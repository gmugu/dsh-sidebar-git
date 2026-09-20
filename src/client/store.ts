/**
 * The Git panel's store — state that must outlive the tab body.
 *
 * Why this exists: the dock renders only the ACTIVE tab's body
 * (`renderTab(pane.activeTabId)` in the front end), so switching away
 * unmounts this panel and every `useState` inside it is discarded — the old
 * behavior was a full "加载中…" refetch, a closed diff preview and a lost
 * commit draft on every tab switch. The registration instead declares a store
 * (`store: createGitStore()`), which the framework mints per session; the
 * body reads it through the injected `useStore`/`actions` props. A remount
 * therefore renders the previous snapshot at once and refreshes in the
 * background.
 *
 * Shape mirrors the shipped `ui-sidebar-files` store: `defineStore({ init,
 * actions })`, actions mutating the draft. The module ships no local types,
 * so the structural signature is declared here.
 */
import { defineStore } from '@deepseek-ai/dsh-client-store'
import type { GitLogEntry, GitStatusResult, GitWorktree } from './api.ts'
import type { SidebarDiffRef } from './types.ts'

/** One complete checkout-derived view: status, branch choices and history are
 *  one consistency unit and are always published together. */
export interface GitView {
  status: GitStatusResult | null
  worktrees: GitWorktree[]
  /** The selected linked checkout, or undefined before the first list. */
  selectedWorktree: string | undefined
  /** The selected child repository (workspace-container sessions). */
  repoRoot: string | undefined
  branchNames: string[]
  logEntries: GitLogEntry[]
  logEnded: boolean
  error: string | null
}

/** The whole per-session panel state. */
export interface GitStoreState {
  view: GitView
  /** The commit-message draft (survives tab switches). */
  commitMsg: string
  /** The previewed change, or null when the preview pane is closed. */
  preview: SidebarDiffRef | null
  /** The preview pane's committed height in px, or null while it has never
   *  been dragged — the pane then takes half of the panel. */
  paneHeight: number | null
  /**
   * The session scope (sessionId + cwd) this state was last used under.
   * Kept here, not in a component ref, so a remount can tell "same scope,
   * just remounted" (keep everything) from "the scope changed" (drop the
   * checkout selection) — the difference between an instant return and a
   * visible blank-and-refill.
   */
  scopeKey: string
}

/** The pristine view of a session that has not loaded anything yet. */
export function initialView(): GitView {
  return {
    status: null,
    worktrees: [],
    selectedWorktree: undefined,
    repoRoot: undefined,
    branchNames: [],
    logEntries: [],
    logEnded: false,
    error: null,
  }
}

/** The handle the registration declares (`store:` option); opaque to us. */
export type GitStoreHandle = unknown

/** The bound actions the body receives (`actions` prop), draft implicit. */
export interface GitStoreActions {
  /** Merge one published view patch. */
  publish(patch: Partial<GitView>): void
  /** Replace the commit-message draft. */
  setCommitMsg(text: string): void
  /** Open or close the preview pane. */
  setPreview(ref: SidebarDiffRef | null): void
  /** Commit a new preview pane height. */
  setPaneHeight(height: number): void
  /** Mark the scope this state now belongs to, dropping the old checkout
   *  selection (only a real scope change calls this). */
  resetScope(scopeKey: string): void
}

/** The selector hook the body receives (`useStore` prop). */
export type GitUseStore = <T>(selector: (state: GitStoreState) => T) => T

interface DefineStoreSpec {
  init: () => GitStoreState
  actions: Record<string, (draft: GitStoreState, ...args: never[]) => void>
}

/**
 * Declare the panel's store. A factory, not a shared value: the registration
 * treats it as an exclusive store, so the framework mints one instance per
 * session and disposes it with the plugin.
 */
export function createGitStore(): GitStoreHandle {
  const define = defineStore as unknown as (spec: DefineStoreSpec) => GitStoreHandle
  return define({
    init: (): GitStoreState => ({
      view: initialView(),
      commitMsg: '',
      preview: null,
      paneHeight: null,
      scopeKey: '',
    }),
    actions: {
      publish: (draft: GitStoreState, patch: Partial<GitView>) => {
        Object.assign(draft.view, patch)
      },
      setCommitMsg: (draft: GitStoreState, text: string) => {
        draft.commitMsg = text
      },
      setPreview: (draft: GitStoreState, ref: SidebarDiffRef | null) => {
        draft.preview = ref
      },
      setPaneHeight: (draft: GitStoreState, height: number) => {
        draft.paneHeight = height
      },
      resetScope: (draft: GitStoreState, scopeKey: string) => {
        draft.scopeKey = scopeKey
        draft.view.selectedWorktree = undefined
      },
    },
  })
}
