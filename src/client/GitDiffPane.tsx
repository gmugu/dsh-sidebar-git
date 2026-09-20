/**
 * The Git panel's shared bottom preview pane — the git branch of
 * dsh-better-sidebar's DiffPane (upstream MIT), extracted standalone: one
 * selected target — a git worktree change or a commit patch — rendered
 * through the unified diff stack. Targets load on demand (refreshable,
 * staged-side fallback, untracked full-addition fallback). The pane is
 * resizable by drag (clamped; the height commits on release) and by
 * keyboard. The upstream op-snapshot branch (session ops, markdown/html/pdf
 * readers, redaction) is deliberately not carried over.
 */
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { IconCloseOutline16, IconRefreshOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionScope } from './api.ts'
import { api } from './api.ts'
import { t } from './locales.ts'
import { resolveSidebarPath } from './sidebar-path.ts'
import type { SidebarDiffRef } from './types.ts'
import { DiffFiles } from './diff/DiffFiles.tsx'
import { diffStats, displayPath, foldRowsFromContents, parseUnifiedDiff, unifiedSegments, type DiffFile, type DiffRow, type FoldSegment } from './diff/rows.ts'
import { createFrameBatcher } from './frame-batcher.ts'
import css from './changes.module.css'
import diffCss from './diff/diff.module.css'

/** Drag handle height clamp (px) and keyboard-resize step. */
const HEIGHT_MIN = 140
const HEIGHT_STEP = 24

/** A byte count as KiB/MiB text for the pane's notices. */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '?'
  if (bytes < 1024) return `${String(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}

/** What the pane is showing: one git target. */
export interface GitPreview {
  kind: 'git'
  ref: SidebarDiffRef
}

export interface GitDiffPaneProps {
  target: GitPreview
  scope: SessionScope
  /** The persisted pane height in px, or null while the pane has never been
   *  dragged (it then takes half of the panel). */
  height: number | null
  onHeightCommit: (height: number) => void
  onClose: () => void
}

export function GitDiffPane({ target, scope, height, onHeightCommit, onClose }: GitDiffPaneProps) {
  // ── Git target loading (mirrors the upstream diff tab: staged-side
  //    fallback, the untracked full-addition fallback, refresh by tick).
  //    Every visited target is fetched fresh: for an untracked file that is one
  //    request and no git process, for a tracked one a single `git diff` — the
  //    price of an always-current document with no state to invalidate. ─────
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diffText, setDiffText] = useState<string | null>(null)
  const [untracked, setUntracked] = useState<string | undefined>(undefined)
  // The staged flag of the side ACTUALLY rendered: when the requested side's
  // diff came back empty the load falls back to the other side, and the fold
  // expansion must read that side's revisions (else the sliced line numbers
  // land on the wrong contents).
  const [effectiveStaged, setEffectiveStaged] = useState<boolean | null>(null)
  /** What the document cannot show by itself: a capped read or a binary file
   *  (the body then holds nothing to draw). */
  const [notice, setNotice] = useState<string | null>(null)
  const gitRef = target.ref
  // The scope every git call of this target shares (repoRoot folded in when
  // the ref carries one, exactly like the load effect's paneScope).
  const gitScope = useMemo<SessionScope>(() => ({
    sessionId: scope.sessionId,
    cwd: scope.cwd,
    ...(gitRef?.repoRoot !== undefined ? { repoRoot: gitRef.repoRoot } : {}),
  }), [scope.sessionId, scope.cwd, gitRef?.repoRoot])

  useEffect(() => {
    if (gitRef === null) return
    let cancelled = false
    const paneScope: SessionScope = {
      sessionId: scope.sessionId,
      cwd: scope.cwd,
      ...(gitRef.repoRoot !== undefined ? { repoRoot: gitRef.repoRoot } : {}),
    }
    setLoading(true)
    setError(null)
    setDiffText(null)
    setUntracked(undefined)
    setEffectiveStaged(null)
    setNotice(null)

    const load = async (): Promise<void> => {
      try {
        if (gitRef.kind === 'commit') {
          const result = await api.gitCommitDiff(paneScope, gitRef.hashFull, gitRef.worktree)
          if (!cancelled) setDiffText(result.diff)
          return
        }
        // A path git does not track has no patch and no earlier revision: both
        // sides of `git diff` are empty by definition, so asking for them costs
        // two git processes and two round trips to learn nothing. The row's own
        // status already says "untracked" — read the file and render the full
        // addition git would emit for a new file. (Were that flag one poll
        // stale, the drawing still matches what git reports for that path.)
        if (gitRef.untracked === true && !gitRef.staged) {
          const text = await api.fsRead(paneScope, resolveSidebarPath(gitRef.repoRoot ?? gitRef.worktree ?? scope.cwd, gitRef.path))
          if (!cancelled) {
            setDiffText('')
            if (text.kind === 'text') {
              setUntracked(text.content)
              // The host caps a read at 2 MiB (`READ_LIMIT`); say so instead of
              // presenting a cut document as the whole file.
              if (text.truncated) setNotice(t('diffTruncated', { size: formatBytes(text.size) }))
            } else {
              // A binary file has nothing to draw: the document stays empty and
              // the notice names what it is.
              setNotice(t('diffBinaryNotice', { size: formatBytes(text.size) }))
            }
          }
          return
        }
        let result = await api.gitDiff(paneScope, gitRef.path, gitRef.staged, gitRef.worktree)
        let staged: boolean | null = null
        if (result.diff === '') {
          // The requested side is empty — try the OTHER side once (the change
          // may have moved sides after the preview target was minted).
          const other = await api.gitDiff(paneScope, gitRef.path, !gitRef.staged, gitRef.worktree)
          if (other.diff !== '') {
            result = other
            staged = !gitRef.staged
          }
        }
        if (!cancelled) {
          setDiffText(result.diff)
          setEffectiveStaged(staged)
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [gitRef, scope.sessionId, scope.cwd, tick])

  // ── On-demand git fold expansion: a fold's hidden rows come from both
  //    sides' full contents (git.show / fsRead), fetched ONCE per file so
  //    sibling folds share the request, then sliced by each fold's line
  //    ranges. The cache dies with the target or a refresh tick. ───────────
  const foldContents = useRef(new Map<string, Promise<{ old: string; new: string }>>())
  useEffect(() => { foldContents.current = new Map() }, [gitRef, tick])
  const foldLoader = useMemo(() => {
    if (gitRef === null) return undefined
    const sidesOf = (file: DiffFile): Promise<{ old: string; new: string }> => {
      // Both sides empty cannot cover a non-empty fold — treat it as a failed
      // fetch so the fold degrades to the unavailable marker instead of
      // silently expanding to nothing (the symptom of a bad rev or path
      // reading null on both sides).
      const ofSides = (oldContent: string | null, newContent: string | null): { old: string; new: string } => {
        if ((oldContent ?? '') === '' && (newContent ?? '') === '') throw new Error('no content on either side')
        return { old: oldContent ?? '', new: newContent ?? '' }
      }
      const fetchSides = async (): Promise<{ old: string; new: string }> => {
        if (gitRef.kind === 'commit') {
          // The patch's -m --first-parent shape: old side from the parent,
          // new side from the commit (a root commit's parent read fails → '').
          const [oldSide, newSide] = await Promise.all([
            file.oldPath === '/dev/null'
              ? Promise.resolve({ content: null })
              : api.gitShow(gitScope, `${gitRef.hashFull}^`, displayPath(file.oldPath), gitRef.worktree),
            file.newPath === '/dev/null'
              ? Promise.resolve({ content: null })
              : api.gitShow(gitScope, gitRef.hashFull, displayPath(file.newPath), gitRef.worktree),
          ])
          return ofSides(oldSide.content, newSide.content)
        }
        // Worktree change: staged is HEAD vs index, unstaged is index vs
        // worktree (the worktree side reads the live file).
        const staged = effectiveStaged ?? gitRef.staged
        if (staged) {
          const [oldSide, newSide] = await Promise.all([
            file.oldPath === '/dev/null'
              ? Promise.resolve({ content: null })
              : api.gitShow(gitScope, 'HEAD', displayPath(file.oldPath), gitRef.worktree),
            file.newPath === '/dev/null'
              ? Promise.resolve({ content: null })
              : api.gitShow(gitScope, ':0', displayPath(file.newPath), gitRef.worktree),
          ])
          return ofSides(oldSide.content, newSide.content)
        }
        const [oldSide, worktree] = await Promise.all([
          file.oldPath === '/dev/null'
            ? Promise.resolve({ content: null })
            : api.gitShow(gitScope, ':0', displayPath(file.oldPath), gitRef.worktree),
          api.fsRead(gitScope, resolveSidebarPath(gitRef.repoRoot ?? gitRef.worktree ?? scope.cwd, displayPath(file.newPath))).catch(() => null),
        ])
        return ofSides(oldSide.content, worktree !== null && worktree.kind === 'text' ? worktree.content : null)
      }
      const path = displayPath(file.newPath === '/dev/null' ? file.oldPath : file.newPath)
      let promise = foldContents.current.get(path)
      if (promise === undefined) {
        promise = fetchSides()
        foldContents.current.set(path, promise)
      }
      return promise
    }
    return (file: DiffFile, segment: FoldSegment): Promise<readonly DiffRow[]> =>
      sidesOf(file).then(sides => foldRowsFromContents(segment, sides.old, sides.new))
  }, [gitRef, gitScope, effectiveStaged, scope])

  // Header stats come off the parsed patch text.
  // One parse per loaded patch: the header's +N/−M chips and the document
  // itself (handed to DiffFiles below) share this result instead of each
  // parsing the same text.
  const parsedPatch = useMemo(
    () => (diffText === null || diffText === '' ? null : parseUnifiedDiff(diffText)),
    [diffText],
  )
  const gitStats = useMemo(() => {
    if (parsedPatch === null) return null
    let added = 0
    let deleted = 0
    for (const file of parsedPatch.files) {
      const stats = diffStats(unifiedSegments(file))
      added += stats.added
      deleted += stats.deleted
    }
    return { added, deleted }
  }, [parsedPatch])

  // ── Resize: drag the top handle; commit on release (persisted by the
  //    shell). Arrow keys resize by a step for keyboard users. Both read the
  //    pane's RENDERED height as their origin, so an unsized pane (which
  //    occupies half the panel) resizes from wherever it actually sits. ────
  const paneRef = useRef<HTMLDivElement | null>(null)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const paneHeight = dragHeight ?? height
  const renderedHeight = (): number => paneRef.current?.offsetHeight ?? HEIGHT_MIN
  const clamp = (value: number): number => Math.min(Math.max(value, HEIGHT_MIN), Math.round(window.innerHeight * 0.7))
  const dragOrigin = useRef<{ y: number; h: number } | null>(null)
  // Pointer streams fire several times per frame; one setState per event
  // re-rendered the whole pane at event cadence (see frame-batcher).
  const dragBatcher = useRef(createFrameBatcher()).current
  useEffect(() => () => dragBatcher.dispose(), [dragBatcher])
  const onHandleDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragOrigin.current = { y: event.clientY, h: renderedHeight() }
    const onMove = (ev: PointerEvent): void => {
      if (dragOrigin.current === null) return
      const next = clamp(dragOrigin.current.h + (dragOrigin.current.y - ev.clientY))
      dragBatcher.schedule(() => { setDragHeight(next) })
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      dragOrigin.current = null
      dragBatcher.flushNow()
      setDragHeight(current => {
        if (current !== null) onHeightCommit(current)
        return null
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const title = gitRef.kind === 'worktree' ? gitRef.path : `${gitRef.hash} ${gitRef.subject}`
  const stats = gitStats

  return (
    <div ref={paneRef} className={css.diffPane} style={{ height: paneHeight ?? '50%' }}>
      <div
        className={css.dragHandle}
        role="separator"
        aria-orientation="horizontal"
        aria-label={t('changesResizePreview')}
        tabIndex={0}
        onPointerDown={onHandleDown}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') { event.preventDefault(); onHeightCommit(clamp(renderedHeight() + HEIGHT_STEP)) }
          if (event.key === 'ArrowDown') { event.preventDefault(); onHeightCommit(clamp(renderedHeight() - HEIGHT_STEP)) }
        }}
      />
      <div className={css.diffHead}>
        {gitRef.kind === 'worktree' && (
          <span className={css.diffKind} data-kind="git">{gitRef.staged ? t('staged') : t('unstaged')}</span>
        )}
        {gitRef.kind === 'commit' && (
          <span className={css.diffKind} data-kind="git">{gitRef.hash}</span>
        )}
        <span className={css.diffPath} title={title}>{title}</span>
        {stats !== null && (stats.added > 0 || stats.deleted > 0) && (
          <span className={css.diffStats}>
            {stats.added > 0 && <span className={diffCss.statAdd}>+{String(stats.added)}</span>}
            {stats.deleted > 0 && <span className={diffCss.statDel}>−{String(stats.deleted)}</span>}
          </span>
        )}
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('refresh')}
          title={t('refresh')}
          disabled={loading}
          onClick={() => { setTick(value => value + 1) }}
        >
          <IconRefreshOutline16 size={14} />
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('changesClosePreview')}
          title={t('changesClosePreview')}
          onClick={onClose}
        >
          <IconCloseOutline16 size={14} />
        </button>
      </div>
      {loading
        ? <div className={css.paneBody}><div className={css.gitPlaceholder}>{t('loading')}</div></div>
        : error !== null
          ? <div className={css.paneBody}><div className={css.gitError}>{t('diffLoadError')}: {error}</div></div>
          : (
            <div className={css.paneBody}>
              {notice !== null && <div className={css.paneNotice}>{notice}</div>}
              {/* An untracked target carries no diff text at all — git never
                  emits one — and renders from its content instead, so the
                  document gate must accept that pair. Gating on non-empty diff
                  text alone (upstream's pane does exactly that) silently drops
                  the full-addition fallback the loader just filled in, leaving
                  a new file's preview blank with no error. The upstream diff
                  TAB gates on the untracked flag this way; the pane now does
                  the same. */}
              {((diffText !== null && diffText !== '') || untracked !== undefined) && (
                <DiffFiles
                  diff={diffText ?? ''}
                  resolveFold={foldLoader}
                  startFolded={gitRef.kind === 'commit'}
                  parsedFiles={parsedPatch === null ? undefined : parsedPatch.files}
                  untrackedPath={untracked !== undefined && gitRef.kind === 'worktree' ? gitRef.path : undefined}
                  untrackedContent={untracked}
                />
              )}
              {diffText === '' && untracked === undefined && notice === null && (
                <div className={css.gitEmpty}>{t('diffEmpty')}</div>
              )}
            </div>
          )}
    </div>
  )
}
