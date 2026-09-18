/**
 * Shared client types of the Git panel — the subset of upstream state.ts the
 * extracted surface needs. A diff ref is one previewable git target: either
 * a worktree change (one path × one side) or one commit.
 */

/** One previewable git change: a worktree path on one side, or one commit. */
export type SidebarDiffRef = {
  kind: 'worktree'
  path: string
  staged: boolean
  untracked?: boolean
  /** Selected linked checkout this ref was minted under. */
  worktree?: string
  /** Selected child repository root (workspace-container sessions). */
  repoRoot?: string
} | {
  kind: 'commit'
  hash: string
  hashFull: string
  subject: string
  worktree?: string
  repoRoot?: string
}
