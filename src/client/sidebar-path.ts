/**
 * Resolve a (possibly relative) path against the session cwd — verbatim from
 * dsh-better-sidebar's produced-files.ts (upstream MIT); the Git panel's
 * menu actions and diff fallback need exactly this one function.
 */
import { isAbsolutePath } from './paths.ts'

export function resolveSidebarPath(cwd: string | undefined, path: string): string {
  if (isAbsolutePath(path)) return path
  const base = cwd ?? ''
  if (base === '') return path
  const separator = base.includes('\\') ? '\\' : '/'
  return `${base.replace(/[\\/]+$/, '')}${separator}${path}`
}
