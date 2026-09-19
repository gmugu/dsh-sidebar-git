/**
 * The Git panel — the Git lens of dsh-better-sidebar's changes tab
 * (upstream MIT), extracted standalone: repository truth — status list
 * (staged vs unstaged), stage/unstage, commit with a message box, branch
 * switch, and a VSCode-like history with branch decorations, author and
 * relative time. Clicking a changed file or a history row previews it in
 * the shared bottom pane (see {@link GitDiffPane}); rows carry right-click
 * context menus with advanced operations (open file, discard, revert,
 * cherry-pick, copy paths/hashes). Refresh is manual + on mount; while
 * visible it polls lightweight porcelain state so model-authored file
 * changes appear without a manual refresh.
 *
 * Extraction deltas vs upstream: the sidebar-store dependency is gone (the
 * workspace fence is treated as always armed — the "open" menu item shows
 * only for paths inside the session workspace), and the caller supplies the
 * session scope.
 */
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  Button, IconCodeOutline16, IconCopyOutline16, IconPlusOutline16,
  IconRefreshOutline16, IconTrashOutline16, Input, Menu, Modal, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { GitLogEntry, GitStatusEntry, SessionScope } from './api.ts'
import { api } from './api.ts'
import { usePolling } from './use-polling.ts'
import { baseName, isWithinWorkspace, relativeTo } from './paths.ts'
import { resolveSidebarPath } from './sidebar-path.ts'
import { relativeTime, t } from './locales.ts'
import type { GitStoreActions, GitStoreState, GitUseStore } from './store.ts'
import type { SidebarDiffRef } from './types.ts'
import css from './changes.module.css'

/** The XY status letters a row badge shows (X = index, Y = worktree). */
function badgeOf(entry: GitStatusEntry): string {
  const index = entry.xy[0]
  if (index !== undefined && index !== ' ' && index !== '?') return index
  const worktree = entry.xy[1]
  if (worktree !== undefined && worktree !== ' ' && worktree !== '?') return worktree
  return '?'
}

/** Whether the entry carries STAGED (index) changes — the X letter is set. */
function isStagedEntry(entry: GitStatusEntry): boolean {
  const index = entry.xy[0]
  return index !== undefined && index !== ' ' && index !== '?'
}

/** Whether the entry carries UNSTAGED (worktree) changes — the Y letter is set
 *  (untracked `??` counts as unstaged: it is a worktree-only change). A file
 *  with both letters set ('MM') lands in BOTH sections. */
function isUnstagedEntry(entry: GitStatusEntry): boolean {
  if (entry.xy === '??') return true
  const worktree = entry.xy[1]
  return worktree !== undefined && worktree !== ' ' && worktree !== '?'
}

/** Whether the entry is untracked (`??`): git diff never includes it. */
function isUntracked(entry: GitStatusEntry): boolean {
  return badgeOf(entry) === '?'
}

/** The ref names of one log row's decorations (`HEAD -> main` → `main`), deduped. */
function refNames(refs: string): string[] {
  return [...new Set(
    refs
      .split(',')
      .map(ref => ref.trim())
      .filter(ref => ref !== '')
      .map(ref => (ref.includes(' -> ') ? ref.slice(ref.indexOf(' -> ') + 4) : ref))
      .map(ref => (ref.startsWith('tag: ') ? ref.slice(5) : ref)),
  )]
}

/** One thrown value as display text (every error banner/row here normalizes
 *  through this so non-Error rejections never render as '[object Object]'). */
function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

/** The pending destructive action (discard / revert / cherry-pick), gated by a confirm modal. */
interface ConfirmState {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<unknown>
}

/** History batch size: the log loads lazily in pages so a long history never
 *  floods the panel at once (the end of the log is reached by paging). */
const LOG_BATCH = 20

/** Every Nth silent poll re-lists worktrees (and re-runs auto-selection): the
 *  2s tick only needs the selected checkout's STATUS, and re-listing spawned
 *  a second git process per tick for a list that almost never changes — a
 *  linked checkout the agent creates mid-session is picked up within ~30s
 *  instead of 2s. */
const WORKTREE_RECHECK_TICKS = 15

export interface GitPanelProps {
  scope: SessionScope
  onOpenFile: (path: string) => void
  /** Preview one change in the shared bottom pane (worktree or commit ref). */
  onPreview: (ref: SidebarDiffRef) => void
  /** The ref currently previewed (row highlight); null when the pane is closed. */
  selectedRef: SidebarDiffRef | null
  /** Poll only while the tab is actually visible. */
  visible: boolean
  /** The registration's store selector hook (state that outlives the body). */
  useStore: GitUseStore
  /** The registration's bound store actions. */
  actions: GitStoreActions
}

export function GitPanel(props: GitPanelProps) {
  const { scope, onOpenFile, onPreview, selectedRef, visible, useStore, actions } = props
  // The checkout-derived view lives in the registration's store, not in this
  // component: the dock unmounts a tab body when another tab is selected, so
  // component state would be discarded on every switch.
  const view = useStore((state: GitStoreState) => state.view)
  const commitMsg = useStore((state: GitStoreState) => state.commitMsg)
  const { status, worktrees, selectedWorktree, repoRoot, branchNames, logEntries, logEnded, error } = view
  const [busy, setBusy] = useState(false)
  const [commitError, setCommitError] = useState<string | null>(null)
  const [logLoadingMore, setLogLoadingMore] = useState(false)

  /** The open file-row context menu (cursor position for the portaled Menu). */
  const [fileMenu, setFileMenu] = useState<{ entry: GitStatusEntry; staged: boolean; x: number; y: number } | null>(null)
  /** The open history-row context menu. */
  const [historyMenu, setHistoryMenu] = useState<{ entry: GitLogEntry; x: number; y: number } | null>(null)
  /** The pending destructive action awaiting confirmation. */
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const refreshInFlight = useRef(false)
  /** Monotonic request id: a manual worktree switch invalidates any older poll
   *  before it can publish state from the previous checkout. */
  const refreshGeneration = useRef(0)
  const worktreeChosenByUser = useRef(false)
  /** selectedWorktree read inside refresh without re-creating the callback:
   *  avoids a spurious full refresh on every auto-select (the very state
   *  change refresh writes back via the store would recreate the callback and
   *  re-trigger the mount effect — an N→N+1 fetch loop). */
  const chosenPathRef = useRef<string | undefined>(undefined)
  useEffect(() => { chosenPathRef.current = selectedWorktree }, [selectedWorktree])
  /** Silent polls since the last worktree re-list (see WORKTREE_RECHECK_TICKS). */
  const silentTickCount = useRef(0)

  const gitScope: SessionScope = repoRoot === undefined ? scope : { ...scope, repoRoot }

  /** Publish a complete checkout-derived view. Status, branch choices and
   *  history are one consistency unit: never mix rows from two worktrees. */
  const refreshTarget = useCallback(async (
    target: string | undefined,
    options: { generation: number },
  ): Promise<void> => {
    actions.publish({ error: null })
    try {
      const [statusResult, branchResult, logResult] = await Promise.all([
        api.gitStatus(gitScope, target),
        api.gitBranch(gitScope, target).catch(() => ({ current: '', names: [] as string[] })),
        api.gitLog(gitScope, LOG_BATCH, 0, target).catch(() => [] as GitLogEntry[]),
      ])
      if (options.generation !== refreshGeneration.current) return
      // One atomic publish: status, branch choices and history are one
      // consistency unit and must never mix two checkouts.
      actions.publish({
        status: statusResult,
        branchNames: branchResult.names,
        logEntries: logResult,
        logEnded: logResult.length < LOG_BATCH,
        error: null,
        ...(statusResult.root !== undefined && statusResult.root !== repoRoot ? { repoRoot: statusResult.root } : {}),
      })
    } catch (reason) {
      if (options.generation === refreshGeneration.current) {
        actions.publish({ error: errorMessage(reason) })
      }
    }
    // Granular scope fields: the scope object's identity churns, only its
    // sessionId / cwd fields gate the git target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.sessionId, scope.cwd, repoRoot])

  const refresh = useCallback(async (silent = false): Promise<void> => {
    if (refreshInFlight.current) return
    refreshInFlight.current = true
    let generation = refreshGeneration.current
    try {
      // Fast path for the ordinary silent tick: the selected checkout's
      // STATUS is all that changes between worktree re-lists (see
      // WORKTREE_RECHECK_TICKS) — one git process instead of two.
      if (silent && chosenPathRef.current !== undefined && (silentTickCount.current += 1) % WORKTREE_RECHECK_TICKS !== 0) {
        const statusResult = await api.gitStatus(gitScope, chosenPathRef.current)
        if (generation === refreshGeneration.current) actions.publish({ status: statusResult })
        return
      }
      silentTickCount.current = 0
      const listed = await api.gitWorktrees(scope)
      if (generation !== refreshGeneration.current) return
      actions.publish({ worktrees: listed })
      const selectedStillExists = listed.some(entry => entry.path === chosenPathRef.current)
      let target = selectedStillExists ? chosenPathRef.current : listed.find(entry => entry.current)?.path
      // DSH and other coding agents commonly create one linked checkout while
      // the session remains rooted at the clean primary checkout. Select that
      // checkout automatically only when the choice is unambiguous.
      const current = listed.find(entry => entry.current)
      const dirtyLinked = listed.filter(entry => !entry.current && entry.changes > 0)
      if (!worktreeChosenByUser.current) {
        target = (current?.changes ?? 0) === 0 && dirtyLinked.length === 1
          ? dirtyLinked[0]!.path
          : current?.path
      }
      const targetChanged = target !== chosenPathRef.current
      if (targetChanged) {
        // Changing the automatically selected checkout invalidates any direct
        // target refresh that may still be resolving for the previous one.
        generation = refreshGeneration.current += 1
        chosenPathRef.current = target
        // Remove rows owned by the previous checkout immediately: keeping them
        // interactive while the target changes could apply a destructive action
        // to the new checkout with stale history from the old one. One publish
        // keeps the panel from ever rendering a mixed view.
        actions.publish({
          selectedWorktree: target,
          status: null,
          branchNames: [],
          logEntries: [],
          logEnded: false,
        })
        setLogLoadingMore(false)
      }
      // A poll may update status alone only while staying on the same checkout.
      // Any automatic selection change refreshes the complete derived view.
      if (silent && !targetChanged) {
        const statusResult = await api.gitStatus(gitScope, target)
        if (generation === refreshGeneration.current) actions.publish({ status: statusResult })
        return
      }
      await refreshTarget(target, { generation })
    } catch (reason) {
      if (generation === refreshGeneration.current) {
        actions.publish({ error: errorMessage(reason) })
      }
    } finally {
      refreshInFlight.current = false
    }
    // Granular scope fields: the scope object's identity churns, only its
    // sessionId / cwd fields gate the refresh target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.sessionId, scope.cwd, refreshTarget])

  // The applied scope lives in the STORE, not in a component ref (a ref dies
  // with the unmount). A plain remount of the same session therefore keeps its
  // checkout selection; only a real scope change drops it. Clearing it on every
  // mount made the following refresh treat the target as changed, blank the
  // rows and refill them — the visible flicker on returning to this tab.
  const scopeKey = `${scope.sessionId}\u0000${scope.cwd ?? ''}`
  const storedScopeKey = useStore((state: GitStoreState) => state.scopeKey)
  useEffect(() => {
    if (storedScopeKey === scopeKey) return
    refreshGeneration.current += 1
    refreshInFlight.current = false
    worktreeChosenByUser.current = false
    chosenPathRef.current = undefined
    silentTickCount.current = 0
    actions.resetScope(scopeKey)
  }, [scopeKey, storedScopeKey])
  useEffect(() => { void refresh() }, [refresh])

  /** A user choice invalidates any older poll and atomically refreshes every
   *  checkout-derived surface before destructive history actions can run. */
  const chooseWorktree = (target: string): void => {
    worktreeChosenByUser.current = true
    chosenPathRef.current = target
    actions.publish({
      selectedWorktree: target,
      status: null,
      branchNames: [],
      logEntries: [],
      logEnded: false,
    })
    setLogLoadingMore(false)
    const generation = refreshGeneration.current += 1
    void refreshTarget(target, { generation })
  }
  /** Switching the selected child repository must invalidate every
   *  target-derived surface (status/history/log) before the asynchronous
   *  refresh resolves; otherwise stale rows remain actionable while their
   *  handlers already address the new repository. Mirrors chooseWorktree. */
  const chooseRepo = (target: string): void => {
    actions.publish({
      repoRoot: target,
      status: null,
      branchNames: [],
      logEntries: [],
      logEnded: false,
    })
    setLogLoadingMore(false)
    // Re-list worktrees for the selected child (a workspace container's
    // own worktree list is empty); keep the current linked-checkout choice
    // unless it does not belong to the new repository.
    const generation = refreshGeneration.current += 1
    void refreshTarget(chosenPathRef.current ?? '', { generation })
  }
  /** The silent poll tick (the status-only fast path between worktree
   *  re-lists, see refresh) — fixed 2s cadence while visible, no initial
   *  burst (mount and scope changes already refresh above). */
  const pollTick = useCallback((): Promise<void> => refresh(true), [refresh])
  usePolling(visible, pollTick, { intervalMs: 2_000 })

  /** Append the next history page (lazy: only when the user asks for more). */
  const loadMoreLog = async (): Promise<void> => {
    if (logLoadingMore || logEnded) return
    const generation = refreshGeneration.current
    const target = chosenPathRef.current
    setLogLoadingMore(true)
    try {
      const next = await api.gitLog(gitScope, LOG_BATCH, logEntries.length, target)
      // A worktree switch clears the old history and increments generation.
      // Never append a late page from that checkout into the new one.
      if (generation !== refreshGeneration.current || target !== chosenPathRef.current) return
      actions.publish({
        logEntries: [...logEntries, ...next],
        ...(next.length < LOG_BATCH ? { logEnded: true } : {}),
      })
    } catch (reason) {
      if (generation === refreshGeneration.current && target === chosenPathRef.current) {
        setCommitError(`${t('historyLoadError')}: ${errorMessage(reason)}`)
      }
    } finally {
      if (generation === refreshGeneration.current && target === chosenPathRef.current) setLogLoadingMore(false)
    }
  }

  /** The preview ref for one changed file (one ref per path+side). */
  const worktreeRefOf = (entry: GitStatusEntry, staged: boolean): SidebarDiffRef => ({
    kind: 'worktree',
    path: entry.path,
    staged,
    untracked: isUntracked(entry),
    worktree: selectedWorktree,
    repoRoot,
  })

  /** The preview ref for one commit. */
  const commitRefOf = (entry: GitLogEntry): SidebarDiffRef => ({
    kind: 'commit',
    hash: entry.hash,
    hashFull: entry.hashFull,
    subject: entry.subject,
    worktree: selectedWorktree,
    repoRoot,
  })

  /** Whether a worktree row is the one currently previewed. */
  const isPreviewedWorktree = (entry: GitStatusEntry, staged: boolean): boolean => {
    if (selectedRef === null || selectedRef.kind !== 'worktree') return false
    return selectedRef.path === entry.path && selectedRef.staged === staged
      && (selectedRef.worktree ?? '') === (selectedWorktree ?? '')
  }

  const stageEntry = async (entry: GitStatusEntry, staged: boolean): Promise<void> => {
    setBusy(true)
    try {
      if (staged) await api.gitUnstage(gitScope, entry.path, selectedWorktree)
      else await api.gitStage(gitScope, entry.path, selectedWorktree)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const stageAll = async (staged: boolean): Promise<void> => {
    setBusy(true)
    try {
      if (staged) await api.gitUnstage(gitScope, undefined, selectedWorktree)
      else await api.gitStage(gitScope, undefined, selectedWorktree)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const commit = async (): Promise<void> => {
    const message = commitMsg.trim()
    if (message === '' || busy) return
    setBusy(true)
    setCommitError(null)
    try {
      await api.gitCommit(gitScope, message, selectedWorktree)
      actions.setCommitMsg('')
      await refresh()
    } catch (reason) {
      setCommitError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  const checkout = async (branch: string): Promise<void> => {
    if (branch === status?.branch || busy) return
    setBusy(true)
    setCommitError(null)
    try {
      await api.gitCheckout(gitScope, branch, selectedWorktree)
      await refresh()
    } catch (reason) {
      setCommitError(`${t('checkoutError')}: ${errorMessage(reason)}`)
    } finally {
      setBusy(false)
    }
  }

  /** Run one destructive operation after the confirm modal, then refresh. */
  const runConfirmed = (confirmState: ConfirmState): void => {
    setConfirm({ ...confirmState, onConfirm: async () => {
      setBusy(true)
      setCommitError(null)
      try {
        await confirmState.onConfirm()
        await refresh()
      } catch (reason) {
        setCommitError(errorMessage(reason))
      } finally {
        setBusy(false)
      }
    } })
  }

  /** Copy `text` to the clipboard (best-effort; no visual feedback needed — the menu closes). */
  const copy = (text: string): void => {
    void writeClipboard(text)
  }

  const openFileMenu = (event: MouseEvent, entry: GitStatusEntry, staged: boolean): void => {
    event.preventDefault()
    event.stopPropagation()
    setFileMenu({ entry, staged, x: event.clientX, y: event.clientY })
  }

  const openHistoryMenu = (event: MouseEvent, entry: GitLogEntry): void => {
    event.preventDefault()
    event.stopPropagation()
    setHistoryMenu({ entry, x: event.clientX, y: event.clientY })
  }

  const stagedEntries = (status?.entries ?? []).filter(isStagedEntry)
  const unstagedEntries = (status?.entries ?? []).filter(isUnstagedEntry)

  const renderEntry = (entry: GitStatusEntry, staged: boolean): ReactNode => {
    const selected = isPreviewedWorktree(entry, staged)
    return (
      <div
        key={`${staged ? 's' : 'u'}:${entry.path}`}
        className={css.gitRow}
        data-selected={selected ? 'true' : undefined}
      >
        <button
          type="button"
          className={css.gitRowMain}
          title={entry.path}
          onClick={() => { onPreview(worktreeRefOf(entry, staged)) }}
          onContextMenu={(event) => { openFileMenu(event, entry, staged) }}
        >
          <span className={css.gitBadge} data-letter={badgeOf(entry)}>{badgeOf(entry)}</span>
          <span className={css.gitName}>{entry.path}</span>
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={staged ? t('unstage') : t('stage')}
          title={staged ? t('unstage') : t('stage')}
          disabled={busy}
          onClick={() => { void stageEntry(entry, staged) }}
        >
          {staged ? <IconTrashOutline16 /> : <IconPlusOutline16 />}
        </button>
      </div>
    )
  }

  return (
    <div className={css.git}>
      {worktrees.length > 1 && (
        <div className={css.gitWorktreeRow}>
          <span className={css.gitWorktreeLabel}>{t('worktree')}</span>
          <select
            className={css.gitBranchSelect}
            value={selectedWorktree ?? ''}
            title={selectedWorktree}
            disabled={busy}
            onChange={(event) => { chooseWorktree(event.target.value) }}
          >
            {worktrees.map(entry => (
              <option key={entry.path} value={entry.path}>
                {entry.branch} · {baseName(entry.path)} ({entry.changes})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={css.gitHeader}>
        {(status?.repositories?.length ?? 0) > 1 && (
          <select
            className={css.gitBranchSelect}
            value={repoRoot ?? ''}
            title={repoRoot}
            onChange={(event) => { chooseRepo(event.target.value) }}
            disabled={busy}
          >
            {status!.repositories!.map(root => <option key={root} value={root}>{baseName(root)}</option>)}
          </select>
        )}
        <select
          className={css.gitBranchSelect}
          value={status?.branch ?? ''}
          onChange={(event) => { void checkout(event.target.value) }}
          disabled={busy || (status !== null && !status.isRepo)}
        >
          {(status?.branch ?? '') !== '' && <option value={status!.branch}>{status!.branch}</option>}
          {branchNames.filter(name => name !== status?.branch).map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('refresh')}
          title={t('refresh')}
          onClick={() => { void refresh() }}
        >
          <IconRefreshOutline16 size={14} />
        </button>
      </div>

      {/*
        No loading placeholder by design: entering this tab must look instant.
        A warm store (or the module-level copy) already has rows; a cold
        session paints the header alone until the first snapshot lands, then
        the sections appear without any "loading" flash.
      */}
      {error !== null && <div className={css.gitError}>{error}</div>}
      {error === null && status !== null && !status.isRepo && (
        <div className={css.gitPlaceholder}>{t('notRepo')}</div>
      )}

      {status !== null && status.isRepo && (
        <>
          {status.truncated === true && (
            <div className={css.gitEmpty}>{t('statusTruncated')}</div>
          )}
          <div className={css.gitSection}>
            <div className={css.gitSectionHeader}>
              <span>{t('staged')} ({stagedEntries.length})</span>
              {stagedEntries.length > 0 && (
                <button type="button" className={css.gitLink} disabled={busy} onClick={() => { void stageAll(true) }}>
                  {t('unstageAll')}
                </button>
              )}
            </div>
            {stagedEntries.length === 0 && <div className={css.gitEmpty}>{t('noChanges')}</div>}
            {stagedEntries.map(entry => renderEntry(entry, true))}
          </div>
          <div className={css.gitSection}>
            <div className={css.gitSectionHeader}>
              <span>{t('unstaged')} ({unstagedEntries.length})</span>
              {unstagedEntries.length > 0 && (
                <button type="button" className={css.gitLink} disabled={busy} onClick={() => { void stageAll(false) }}>
                  {t('stageAll')}
                </button>
              )}
            </div>
            {unstagedEntries.length === 0 && <div className={css.gitEmpty}>{t('noChanges')}</div>}
            {unstagedEntries.map(entry => renderEntry(entry, false))}
          </div>

          <div className={css.gitCommit}>
            <Input
              className={css.gitCommitInput}
              placeholder={t('commitPlaceholder')}
              value={commitMsg}
              disabled={busy}
              onChange={(event) => { actions.setCommitMsg(event.target.value); setCommitError(null) }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void commit()
              }}
            />
            <button
              type="button"
              className={css.gitCommitButton}
              disabled={busy || commitMsg.trim() === '' || stagedEntries.length === 0}
              onClick={() => { void commit() }}
            >
              {t('commit')}
            </button>
          </div>
          {commitError !== null && <div className={css.gitError}>{commitError}</div>}

          <div className={css.gitSection}>
            <div className={css.gitSectionHeader}><span>{t('history')}</span></div>
            {logEntries.map(entry => (
              <div
                key={entry.hashFull}
                role="button"
                tabIndex={0}
                className={css.gitLogRow}
                data-selected={selectedRef?.kind === 'commit' && selectedRef.hashFull === entry.hashFull ? 'true' : undefined}
                title={`${entry.author} · ${entry.date}\n${entry.hashFull}`}
                onClick={() => { onPreview(commitRefOf(entry)) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onPreview(commitRefOf(entry))
                  }
                }}
                onContextMenu={(event) => { openHistoryMenu(event, entry) }}
              >
                <span className={css.gitLogLine1}>
                  <span className={css.gitLogHash}>{entry.hash}</span>
                  <span className={css.gitLogSubject}>{entry.subject}</span>
                </span>
                <span className={css.gitLogLine2}>
                  {refNames(entry.refs).map(ref => (
                    <span key={ref} className={css.gitLogRef}>{ref}</span>
                  ))}
                  <span className={css.gitLogMeta}>{entry.author} · {relativeTime(entry.date)}</span>
                </span>
              </div>
            ))}
            {!logEnded && (
              <button
                type="button"
                className={css.gitLogMore}
                disabled={logLoadingMore || busy}
                onClick={() => { void loadMoreLog() }}
              >
                {logLoadingMore ? t('loading') : t('loadMore')}
              </button>
            )}
          </div>

          {/*
            The one shared file-row context menu, positioned at the right-click
            cursor (portal so the panel's overflow clip cannot crop it).
          */}
          <Menu
            open={fileMenu !== null}
            onClose={() => { setFileMenu(null) }}
            items={[
              // A linked worktree outside the session workspace cannot be
              // opened while the workspace fence is armed: hide the action
              // for that checkout so the menu does not offer a no-op.
              // (Extraction: the fence is treated as always armed.)
              ...(fileMenu !== null && isWithinWorkspace(scope.cwd ?? '', resolveSidebarPath(repoRoot ?? selectedWorktree ?? scope.cwd, fileMenu.entry.path))
                ? [{ id: 'open', label: t('openEditor'), icon: <IconCodeOutline16 size={14} /> }]
                : []),
              fileMenu?.staged === true
                ? { id: 'stage', label: t('unstage'), icon: <IconTrashOutline16 size={14} /> }
                : { id: 'stage', label: t('stage'), icon: <IconPlusOutline16 size={14} /> },
              ...(fileMenu !== null && !isUntracked(fileMenu.entry)
                ? [{ id: 'discard', label: t('discard'), icon: <IconTrashOutline16 size={14} />, danger: true }]
                : []),
              { type: 'separator', id: 'sep1' },
              { id: 'relative', label: t('copyRelative'), icon: <IconCopyOutline16 size={14} /> },
              { id: 'absolute', label: t('copyAbsolute'), icon: <IconCopyOutline16 size={14} /> },
            ]}
            onSelect={(id) => {
              const target = fileMenu
              if (target === null) return
              setFileMenu(null)
              if (id === 'open') {
                const resolved = resolveSidebarPath(repoRoot ?? selectedWorktree ?? scope.cwd, target.entry.path)
                // Defense-in-depth: the menu hides this action when the
                // resolved path escapes the session workspace, but a
                // racing repo switch could still reach here with a path
                // the host would reject. No-op in that case.
                if (!isWithinWorkspace(scope.cwd ?? '', resolved)) return
                onOpenFile(resolved)
                return
              }
              if (id === 'stage') {
                void stageEntry(target.entry, target.staged)
                return
              }
              if (id === 'discard') {
                runConfirmed({
                  title: t('discardTitle'),
                  description: t('discardDesc', { path: target.entry.path }),
                  confirmLabel: t('discard'),
                  onConfirm: () => api.gitDiscard(gitScope, target.entry.path, selectedWorktree),
                })
                return
              }
              if (id === 'relative') {
                copy(relativeTo(repoRoot ?? selectedWorktree ?? scope.cwd ?? '', target.entry.path))
                return
              }
              if (id === 'absolute') copy(resolveSidebarPath(repoRoot ?? selectedWorktree ?? scope.cwd, target.entry.path))
            }}
            portal
            compact
            align="start"
            getAnchorRect={() => (fileMenu === null ? null : new DOMRect(fileMenu.x, fileMenu.y, 0, 0))}
            anchor={<span />}
          />

          {/* The shared history-row context menu. */}
          <Menu
            open={historyMenu !== null}
            onClose={() => { setHistoryMenu(null) }}
            items={[
              { id: 'view', label: t('viewCommitDiff') },
              { id: 'copyShort', label: t('copyShortHash'), icon: <IconCopyOutline16 size={14} /> },
              { id: 'copyFull', label: t('copyFullHash'), icon: <IconCopyOutline16 size={14} /> },
              { id: 'copySubject', label: t('copySubject'), icon: <IconCopyOutline16 size={14} /> },
              { type: 'separator', id: 'sep2' },
              { id: 'revert', label: t('revertCommit'), danger: true },
              { id: 'cherryPick', label: t('cherryPickCommit'), danger: true },
            ]}
            onSelect={(id) => {
              const target = historyMenu
              if (target === null) return
              setHistoryMenu(null)
              if (id === 'view') {
                onPreview(commitRefOf(target.entry))
                return
              }
              if (id === 'copyShort') {
                copy(target.entry.hash)
                return
              }
              if (id === 'copyFull') {
                copy(target.entry.hashFull)
                return
              }
              if (id === 'copySubject') {
                copy(target.entry.subject)
                return
              }
              if (id === 'revert') {
                runConfirmed({
                  title: t('revertTitle'),
                  description: t('revertDesc', { subject: target.entry.subject }),
                  confirmLabel: t('revertCommit'),
                  onConfirm: () => api.gitRevert(gitScope, target.entry.hashFull, selectedWorktree),
                })
                return
              }
              if (id === 'cherryPick') {
                runConfirmed({
                  title: t('cherryPickTitle'),
                  description: t('cherryPickDesc', { subject: target.entry.subject }),
                  confirmLabel: t('cherryPickCommit'),
                  onConfirm: () => api.gitCherryPick(gitScope, target.entry.hashFull, selectedWorktree),
                })
              }
            }}
            portal
            compact
            align="start"
            getAnchorRect={() => (historyMenu === null ? null : new DOMRect(historyMenu.x, historyMenu.y, 0, 0))}
            anchor={<span />}
          />

          {/* Destructive actions land here first: Cancel / Confirm. */}
          <Modal
            open={confirm !== null}
            onClose={() => { setConfirm(null) }}
            title={confirm?.title ?? ''}
            closeLabel={t('cancel')}
            footer={(
              <>
                <Button variant="outline" onClick={() => { setConfirm(null) }}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => {
                    const pending = confirm
                    if (pending === null) return
                    setConfirm(null)
                    void pending.onConfirm()
                  }}
                >
                  {confirm?.confirmLabel ?? ''}
                </Button>
              </>
            )}
          >
            <p className={css.gitConfirmDesc}>{confirm?.description}</p>
          </Modal>
        </>
      )}
    </div>
  )
}
