/**
 * dsh-sidebar-git — browser half entry.
 *
 * Registers the extracted Git panel as ONE page type of the native right
 * Sidebar plus its body and chip-title under the keyed
 * `sidebar.right.pane.tab[.title]` seats. The shape follows the SHIPPED
 * pattern (`dsh-client-ui-sidebar-files`), which is the proven form in this
 * deployment:
 *
 *   - `sidebarRightTabs` is DECLARED in the module's `inject` export and then
 *     read directly as `ctx.sidebarRightTabs` — the client context is a
 *     whitelisting proxy whose verb table has no `inject`, so the cordis
 *     `ctx.inject(...)` wait form throws there (the bug this version fixes);
 *   - every registration lives inside `ctx.effect(...)`, so it dies with the
 *     fiber exactly like a shipped one;
 *   - the body reads only the seat's standard props (`sessionId`,
 *     `useTabInfo`) — no custom inject face on the shared seat.
 *
 * The whole body is additionally guarded: a failure here must never abort the
 * client activation sequence for later packages.
 */
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { IconBranchOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionScope } from './api.ts'
import { attachLocale, t } from './locales.ts'
import { GitPanel } from './GitPanel.tsx'
import { GitDiffPane } from './GitDiffPane.tsx'
import { createGitStore, type GitStoreActions, type GitStoreState, type GitUseStore } from './store.ts'

/** This implementation's identity in the tab system (unique across registrations). */
const TAB_ID = 'dsh-sidebar-git:git'

/** The global command that opens/focuses the Git tab (shortcuts registry id). */
const SHORTCUT_ID = 'dsh-sidebar-git:open'

/**
 * Required browser services. `sidebarRightTabs` must be declared here: direct
 * service access is gated by this declaration, and the declaration is also
 * what parks the plugin until the registry exists. `shortcuts` and
 * `sidebarRight` gate the global open-shortcut's registry and navigation face.
 */
export const inject = ['slots', 'locale', 'sessions', 'sidebarRightTabs', 'shortcuts', 'sidebarRight']

/** Structural faces this entry consumes (no runtime imports behind them). */
interface ClientContextLike {
  locale?: {
    getSnapshot(): { active: string }
    subscribe(listener: () => void): () => void
  }
  sessions?: {
    list: {
      subscribe(listener: () => void): () => void
      getSnapshot(): { byId: Record<string, { cwd?: string } | undefined> }
    }
  }
  sidebarRightTabs?: {
    register(definition: Record<string, unknown>): () => void
  }
  shortcuts?: {
    register(command: Record<string, unknown>): () => void
  }
  sidebarRight?: {
    commandTarget(element?: Element | null): unknown
    openTabFromTarget(kind: string, target: unknown): void
  }
  slots: {
    inject(key: string, callback: () => unknown): { dispose(): void }
    register(options: Record<string, unknown>, component: unknown): unknown
  }
  effect(body: () => (() => void) | void, label?: string): unknown
}

/** Module-level holder: the client context, set during apply (like upstream attachLocale). */
let clientCtx: ClientContextLike | undefined

/** The current session's workspace root, live from the client session list. */
function useSessionCwd(sessionId: string): string | undefined {
  const list = clientCtx?.sessions?.list
  return useSyncExternalStore(
    useMemo(() => (listener: () => void) => list?.subscribe(listener) ?? (() => {}), [list]),
    () => list?.getSnapshot().byId[sessionId]?.cwd,
  )
}

/** The guide capsule glyph — the branch glyph primitives actually ships. */
function GitGlyph(props?: { size?: number }): ReactNode {
  return <IconBranchOutlineRegular size={props?.size ?? 16} />
}

/** The tab chip's title: the git branch glyph before the label (live locale). */
function GitTabTitle(): ReactNode {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <IconBranchOutlineRegular size={14} />
      {t('git')}
    </span>
  )
}

interface GitTabBodyProps {
  /** Standard seat prop: the session the body mounts in. */
  sessionId: string
  /** Standard seat hook: the tab record face (the visible flag lives there). */
  useTabInfo: () => { tab: { visible: boolean } }
  /** Store-bound props: the checkout view, preview ref and pane height live
   *  outside this component so a tab switch does not discard them. */
  useStore: GitUseStore
  actions: GitStoreActions
}

/**
 * One Git tab body: session scope from the standard sessionId prop + live
 * cwd, the Git panel above, and the shared preview pane below (the changes
 * tab's own composition, minus the session lens). Both the panel's view and
 * the preview state come from the registration's store, so remounting after
 * a tab switch is instant and lossless.
 */
function GitTabBody(props: GitTabBodyProps): ReactNode {
  const { sessionId, useTabInfo, useStore, actions } = props
  const info = useTabInfo()
  const visible = info.tab.visible
  const cwd = useSessionCwd(sessionId)
  const scope = useMemo((): SessionScope => ({ sessionId, cwd }), [sessionId, cwd])
  const preview = useStore((state: GitStoreState) => state.preview)
  const paneHeight = useStore((state: GitStoreState) => state.paneHeight)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <GitPanel
        scope={scope}
        visible={visible}
        onPreview={(ref) => { actions.setPreview(ref) }}
        selectedRef={preview}
        useStore={useStore}
        actions={actions}
      />
      {preview !== null && (
        <GitDiffPane
          target={{ kind: 'git', ref: preview }}
          scope={scope}
          height={paneHeight}
          onHeightCommit={(height) => { actions.setPaneHeight(height) }}
          onClose={() => { actions.setPreview(null) }}
        />
      )}
    </div>
  )
}

/** The tab type's registry definition (shipped-package shape). */
function gitDefinition(): Record<string, unknown> {
  return {
    id: TAB_ID,
    kind: 'git',
    // An implementation from outside the product outranks the shipped ones.
    priority: 'extension',
    title: () => t('git'),
    // The guide orders its capsules by this number alone; a tie falls back to
    // registration order, which varies between page loads. 15 sits between the
    // workspace-files capsule (10) and the new-terminal one (20) — the value
    // this used to share with the terminal, which is why the Git capsule
    // drifted between the second and third row.
    guide: [{
      // Stable identity within this provider (SidebarRightGuideEntry.id);
      // a missing id still renders, but two id-less entries would collide as
      // duplicates under the 0.1.7 registry's dedup check.
      id: 'git',
      order: 15,
      title: () => t('git'),
      description: () => t('guideDescGit'),
      icon: GitGlyph,
      // The shortcut registry command whose effective keys the capsule shows
      // (SidebarRightGuideEntry.commandId — displayed once we register it).
      commandId: SHORTCUT_ID,
    }],
  }
}

/**
 * Client plugin body: attach the locale service, then register the type, the
 * body, and the chip title — each in its own effect so the registration dies
 * with this plugin. Guarded end to end: a failure here must never abort the
 * client activation sequence for packages that load after this one.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContextLike): void {
  clientCtx = ctx
  try {
    attachLocale(ctx.locale)
  } catch (error) {
    console.error('[dsh-sidebar-git] locale attach failed:', error)
  }
  try {
    const tabs = ctx.sidebarRightTabs
    if (tabs === undefined) {
      console.error('[dsh-sidebar-git] sidebarRightTabs service is unavailable')
      return
    }
    ctx.effect(() => tabs.register(gitDefinition()), 'dsh-sidebar-git: git tab type')
    // The global open/focus shortcut (the shipped files panel's pattern): the
    // resolver captures the live DOM target, the navigation controller turns
    // it into an open aimed at the pane the user is in. No mounted session
    // (or a stale sidebar target) resolves blocked with a localized reason.
    const shortcuts = ctx.shortcuts
    const sidebarRight = ctx.sidebarRight
    if (shortcuts !== undefined && sidebarRight !== undefined) {
      ctx.effect(() => shortcuts.register({
        id: SHORTCUT_ID,
        label: () => t('git'),
        aliases: ['git', 'git panel'],
        // Ctrl+Alt+G (⌘+Alt+G on macOS): the files panel owns primary+alt+P;
        // 'primary' expands to Meta on macOS and Control elsewhere. Linux web
        // is deliberately undeclared: register() validates every profile at
        // registration and Linux's web allowlist (Ctrl+/, Ctrl+Shift+,/.)
        // rejects primary+alt, so an absent profile is the shipped pattern
        // (files does the same); Linux users bind it in shortcut settings.
        defaults: {
          'web:macos': { code: 'KeyG', modifiers: ['primary', 'alt'] },
          'web:windows': { code: 'KeyG', modifiers: ['primary', 'alt'] },
        },
        regions: ['page', 'editable', 'terminal'],
        modals: [],
        resolve: ({ target: element }: { target?: Element | null }) => {
          const target = sidebarRight.commandTarget(element)
          if (target === undefined) {
            return { status: 'blocked', reason: t('shortcutNoSession') }
          }
          return { status: 'handled', run: () => { sidebarRight.openTabFromTarget('git', target) } }
        },
      }), 'dsh-sidebar-git: git tab shortcut')
    } else {
      console.error('[dsh-sidebar-git] shortcuts or sidebarRight service is unavailable')
    }
    // The store is declared on the body registration ("exclusive store"), so
    // the framework mints one instance per session and hands the body
    // `useStore`/`actions` — panel state then survives the body unmounting
    // whenever another tab is selected.
    const store = createGitStore()
    ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
      name: 'sidebar.right.pane.tab',
      key: TAB_ID,
      store,
    }, GitTabBody)), 'dsh-sidebar-git: git tab body')
    ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
      name: 'sidebar.right.pane.tab.title',
      key: TAB_ID,
    }, GitTabTitle)), 'dsh-sidebar-git: git tab title')
  } catch (error) {
    console.error('[dsh-sidebar-git] registration failed:', error)
  }
}