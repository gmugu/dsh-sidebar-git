/**
 * Typed fetch wrapper over this plugin's /git-panel JSON API — the git.*
 * slice of dsh-better-sidebar's client api.ts (upstream MIT), re-pointed at
 * the /git-panel/api prefix. Every call posts to `/git-panel/api/<method>`
 * with the sessionId and — when known — the session's cwd from the client's
 * own list summary; the host prefers its attached session header and uses
 * the summary cwd only while the session is still hydrating. Failures
 * surface as {@link SidebarApiError} with the wire code.
 */

/** One wire failure. */
export class SidebarApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

/** Git status entry (host git shape). */
export interface GitStatusEntry {
  path: string
  xy: string
}

/** Git status snapshot. */
export interface GitStatusResult {
  isRepo: boolean
  branch?: string
  entries: GitStatusEntry[]
  /** True when the host capped `entries` (huge untracked set). */
  truncated?: boolean
  root?: string
  repositories?: string[]
}

/** One linked Git checkout. */
export interface GitWorktree {
  path: string
  branch: string
  current: boolean
  changes: number
}

/** One git log row. */
export interface GitLogEntry {
  /** Short hash (7+ chars, display). */
  hash: string
  /** Full 40-char hash (advanced operations). */
  hashFull: string
  subject: string
  author: string
  /** ISO 8601 author date (`%ai`). */
  date: string
  /** Ref decorations (--decorate=short); '' when none. */
  refs: string
}

/** Text read result (the untracked diff fallback reads whole files). */
export interface FsTextResult { kind: 'text'; content: string; truncated: boolean }
/** Binary read result (no content; the diff stack renders a notice). */
export interface FsBinaryResult { kind: 'binary'; size: number; truncated: boolean; head: string }

/**
 * Parse one /git-panel JSON response envelope into its value. A non-ok
 * status, an unparseable body, or any shape other than `{ok: true, value}`
 * surfaces as {@link SidebarApiError} carrying the wire code (falling back
 * to the HTTP status).
 */
async function readEnvelope<T>(response: Response): Promise<T> {
  const parsed: { ok?: boolean; value?: unknown; error?: { code?: string; message?: string } } | null
    = await response.json().catch(() => null)
  if (!response.ok || parsed === null || parsed.ok !== true || parsed.value === undefined) {
    throw new SidebarApiError(
      parsed?.error?.code ?? 'http',
      parsed?.error?.message ?? `HTTP ${response.status}`,
    )
  }
  return parsed.value as T
}

async function call<T>(method: string, payload: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/git-panel/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    throw new SidebarApiError('network', error instanceof Error ? error.message : String(error))
  }
  return readEnvelope<T>(response)
}

/** One request's session scope: the conversation id plus its cwd when known. */
export interface SessionScope {
  sessionId: string
  /** The session's working directory from the client list summary (optional). */
  cwd?: string
  /** Selected Git repository when cwd is a workspace container. */
  repoRoot?: string
}

/** Fold a scope into a JSON payload ({cwd}/{repoRoot} only when present). */
function scopePayload(scope: SessionScope, extra: Record<string, unknown>): Record<string, unknown> {
  return {
    sessionId: scope.sessionId,
    ...(scope.cwd !== undefined && scope.cwd !== '' ? { cwd: scope.cwd } : {}),
    ...(scope.repoRoot !== undefined && scope.repoRoot !== '' ? { repoRoot: scope.repoRoot } : {}),
    ...extra,
  }
}

/** Add a linked-worktree selection to a scoped Git request. The host validates
 * membership before using it as a command cwd. */
function gitPayload(scope: SessionScope, worktree: string | undefined, extra: Record<string, unknown>): Record<string, unknown> {
  return scopePayload(scope, { ...(worktree !== undefined && worktree !== '' ? { worktree } : {}), ...extra })
}

/** The git-panel API surface (session scope threaded through every call). */
export const api = {
  gitWorktrees: (scope: SessionScope, signal?: AbortSignal) =>
    call<GitWorktree[]>('git.worktrees', scopePayload(scope, {}), signal),
  gitStatus: (scope: SessionScope, worktree?: string, signal?: AbortSignal) =>
    call<GitStatusResult>('git.status', gitPayload(scope, worktree, {}), signal),
  gitDiff: (scope: SessionScope, path: string | undefined, staged: boolean, worktree?: string, signal?: AbortSignal) =>
    call<{ diff: string }>('git.diff', gitPayload(scope, worktree, { ...(path !== undefined ? { path } : {}), staged }), signal),
  gitStage: (scope: SessionScope, path?: string, worktree?: string) =>
    call<{ ok: true }>('git.stage', gitPayload(scope, worktree, { ...(path !== undefined ? { path } : {}) })),
  gitUnstage: (scope: SessionScope, path?: string, worktree?: string) =>
    call<{ ok: true }>('git.unstage', gitPayload(scope, worktree, { ...(path !== undefined ? { path } : {}) })),
  gitCommit: (scope: SessionScope, message: string, worktree?: string) =>
    call<{ ok: true }>('git.commit', gitPayload(scope, worktree, { message })),
  gitBranch: (scope: SessionScope, worktree?: string, signal?: AbortSignal) =>
    call<{ current: string; names: string[] }>('git.branch', gitPayload(scope, worktree, {}), signal),
  gitCheckout: (scope: SessionScope, branch: string, worktree?: string) =>
    call<{ ok: true }>('git.checkout', gitPayload(scope, worktree, { branch })),
  /** Recent commit history, lazily pageable (skip/count; defaults 0/30). */
  gitLog: (scope: SessionScope, count?: number, skip?: number, worktree?: string, signal?: AbortSignal) =>
    call<GitLogEntry[]>('git.log', gitPayload(scope, worktree, {
      ...(count !== undefined ? { count } : {}),
      ...(skip !== undefined ? { skip } : {}),
    }), signal),
  /** Full patch text of one commit (diff display for the history rows). */
  gitCommitDiff: (scope: SessionScope, hash: string, worktree?: string, signal?: AbortSignal) =>
    call<{ diff: string }>('git.commit-diff', gitPayload(scope, worktree, { hash }), signal),
  /** One file's content at a revision (`git show <rev>:<path>`); null when the
   *  revision has no such path. The diff views' on-demand hunk-fold expansion
   *  reads both sides' full contents through this. */
  gitShow: (scope: SessionScope, rev: string, path: string, worktree?: string, signal?: AbortSignal) =>
    call<{ content: string | null }>('git.show', gitPayload(scope, worktree, { rev, path }), signal),
  /** One file's text (the untracked full-addition fallback of the diff pane). */
  fsRead: (scope: SessionScope, path: string, signal?: AbortSignal) =>
    call<FsTextResult | FsBinaryResult>('fs.read', scopePayload(scope, { path }), signal),
  /** Discard the worktree changes of one file (the index is untouched). */
  gitDiscard: (scope: SessionScope, path: string, worktree?: string) =>
    call<{ ok: true }>('git.discard', gitPayload(scope, worktree, { path })),
  /** Revert one commit onto the current branch. */
  gitRevert: (scope: SessionScope, hash: string, worktree?: string) =>
    call<{ ok: true }>('git.revert', gitPayload(scope, worktree, { hash })),
  /** Cherry-pick one commit onto the current branch. */
  gitCherryPick: (scope: SessionScope, hash: string, worktree?: string) =>
    call<{ ok: true }>('git.cherry-pick', gitPayload(scope, worktree, { hash })),
}
