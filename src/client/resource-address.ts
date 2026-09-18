/**
 * The DSH resource-address grammar for files (`dsh-resource://file/…`) — the
 * slice of dsh-better-sidebar's resource-address.ts (upstream MIT) the Git
 * panel's "open file" action needs: composing addresses the native right
 * sidebar's built-in preview claims.
 */
import { isAbsolutePath } from './paths.ts'

export const FILE_ADDRESS_PREFIX = 'dsh-resource://file/'

/** Component-encode one id or path segment, keeping `:` literal for drive letters. */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%3A/gi, ':')
}

/** Encode a `/`-separated path segment by segment. */
function encodePath(path: string): string {
  return path.split('/').map(encodeSegment).join('/')
}

/**
 * Build the address of a file read through one session.
 * @param sessionId - the session whose workspace root resolves the path.
 * @param path - absolute or workspace-relative path; backslashes are normalized
 *   to `/`, and leading `./` prefixes are dropped (a leading `/` is KEPT: an
 *   absolute path stays absolute inside the session scope).
 */
export function sessionFileAddress(sessionId: string, path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
  return `${FILE_ADDRESS_PREFIX}session/${encodeSegment(sessionId)}/${encodePath(normalized)}`
}

/**
 * Pick the address scope for one path: workspace-relative paths name the
 * session scope; anything else stays absolute inside it (upstream
 * fileAddressFor — the absolute branch also folds onto the session scope).
 * @param sessionId - the session the path is read in.
 * @param cwd - that session's workspace root, when known.
 * @param path - absolute or workspace-relative path, either separator spelling.
 */
export function fileAddressFor(sessionId: string, cwd: string | undefined, path: string): string {
  const normalized = path.replace(/\\/g, '/')
  if (!isAbsolutePath(normalized)) return sessionFileAddress(sessionId, normalized)
  const root = cwd === undefined ? '' : cwd.replace(/\\/g, '/').replace(/\/+$/, '')
  if (root !== '' && normalized === root) return sessionFileAddress(sessionId, '')
  if (root !== '' && normalized.startsWith(`${root}/`)) return sessionFileAddress(sessionId, normalized.slice(root.length + 1))
  return sessionFileAddress(sessionId, normalized)
}
