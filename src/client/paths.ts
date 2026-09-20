/**
 * Client-side path helpers: the absolute-path notion the sidebar resolver
 * needs ({@link isAbsolutePath}) and the last-segment label the panel's
 * worktree / repository / commit titles use ({@link baseName}). The fs-tree
 * joins with '/' even on Windows, so both separators normalize to '/' before
 * comparison.
 *
 * This module is dependency-free (no node:path in the client bundle): the
 * host is the authority for path semantics, so this mirror deliberately
 * accepts a SUPERSET of absolute forms — anything a Windows host would emit
 * (drive letters, UNC) plus POSIX roots. A form the host would reject
 * (e.g. a backslash UNC path on a POSIX host) passes through here and then
 * fails loudly in the host's requireAbsolute instead of being silently
 * joined onto the cwd.
 */

/**
 * Mirror of the host's absolute-path notion (see fs-tree.requireAbsolute):
 * POSIX roots, Windows drive letters, and Windows UNC network shares in
 * both backslash (`\\server\share\...`) and forward-slash
 * (`//server/share/...`) form. Deliberately a superset — see the module
 * comment — so a produced UNC path is never joined onto the cwd.
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || /^[\\/]{2}[^\\/]/.test(path)
}

/**
 * The last path segment of a '/'- or '\'-separated path (a diff tab title,
 * a worktree label). Returns the whole string when no separator is present.
 */
export function baseName(path: string): string {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? path : path.slice(at + 1)
}
