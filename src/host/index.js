/**
 * dsh-sidebar-git — host half.
 *
 * Standalone Git panel extracted from dsh-better-sidebar (MIT,
 * omdsh-dev/DSH-better-sidebar): the git.* routes of its fenced /sidebar/api
 * JSON RPC, re-homed under this plugin's own /git-panel/api prefix so the two
 * plugins can coexist. Command execution, porcelain parsing, worktree
 * discovery and the browser-trust fence are verbatim ports of the upstream
 * sources (src/git.ts, src/trust-fence.ts, src/wire.ts, src/session-path.ts);
 * only the route dispatch below is new glue.
 *
 * Every git command runs with `-C` on the SESSION's working directory
 * (header first, client summary cwd only while hydrating), and an optional
 * linked-checkout target is validated against the authoritative worktree
 * list before use — a caller can never point git at an unrelated repository.
 */
import { join, isAbsolute, resolve } from 'node:path'
import { stat, open } from 'node:fs/promises'
import * as git from './git.js'
import { isTrustedApiRequest } from './trust-fence.js'
import { readJsonBody, requireString, SidebarError, writeError, writeJson, writeOk } from './wire.js'
import { resolveSessionPath } from './session-path.js'

/** Plugin identity for cordis.yml rows. */
export const name = 'dsh-sidebar-git'

/**
 * Services required before mounting: the route table, session store, and the
 * connection service whose admission (Host/Origin fence + browser
 * authentication, the exact gate the /api bridge applies) decides every
 * request.
 *
 * `workingDirectory` (DSH 0.2.1+) is deliberately NOT declared here: it does
 * not exist on 0.2.0 profiles, and a required injection would keep the whole
 * plugin from mounting there. `apply` waits for it through `ctx.inject`
 * instead, so the plugin mounts either way and falls back to the session
 * header when the service is absent.
 */
export const inject = ['webServer', 'sessions', 'connection']

/**
 * The session's EFFECTIVE working directory on DSH 0.2.1+.
 *
 * `session.header.cwd` only names the ORIGINAL project: the `workingDirectory`
 * Session projection owns the directory a `/cd` or the `working_directory` tool
 * selected (the header is immutable and "continues to identify the original
 * project"). `ctx.workingDirectory.get(session)` answers the committed
 * projection, falling back to the deployment default when nothing is recorded.
 *
 * The service reference is captured from the optional `ctx.inject` wait (see
 * apply) and is undefined on 0.2.0. A missing header (the session is
 * hydrating) plus the deployment default means "nothing recorded", so the
 * caller's summary cwd must keep winning in that case.
 *
 * @param service - the captured workingDirectory service, if this DSH has one.
 * @param session - the attached session, when it exists.
 * @returns the recorded effective directory, or undefined when it adds nothing.
 */
function effectiveCwdOf(service, session) {
  if (session === undefined || service === undefined || typeof service.get !== 'function') return undefined
  try {
    const current = service.get(session)
    if (typeof current !== 'string' || current === '') return undefined
    if (session.header.cwd === undefined && current === service.defaultDirectory) return undefined
    return current
  } catch {
    return undefined
  }
}

/**
 * Resolve a session's authoritative working directory: the effective
 * (possibly switched) directory on 0.2.1+, else the attached session header,
 * else — while the session is still hydrating (the web client attaches the
 * current conversation a moment after page load) — the caller's own
 * list-summary cwd. Unlike upstream, the session-persistence index fallback is
 * not carried over — cold detached sessions degrade to the process cwd instead
 * (documented extraction simplification).
 */
async function sessionCwdOf(ctx, workingDirectory, sessionId, clientCwd) {
  const session = ctx.sessions.get(sessionId)
  const effective = effectiveCwdOf(workingDirectory, session)
  if (effective !== undefined) return effective
  const headerCwd = session?.header.cwd
  if (headerCwd !== undefined && headerCwd !== '') return headerCwd
  if (clientCwd !== undefined && clientCwd !== '') {
    try {
      return requireAbsolute(clientCwd)
    } catch {
      throw new SidebarError('bad-request', `invalid working directory "${clientCwd}"`)
    }
  }
  return process.cwd()
}

/**
 * Normalize a caller-supplied path to an absolute, resolved path or throw
 * (verbatim from upstream fs-tree.ts).
 */
function requireAbsolute(path) {
  if (!isAbsolute(path)) {
    throw new SidebarError('fs-error', `"${path}" is not an absolute path`, 400)
  }
  return resolve(path)
}

/** Optional repository selected by the Git panel when cwd is a container. */
function selectedRepoOf(payload) {
  const record = payload
  if (record?.repoRoot === undefined) return undefined
  return requireAbsolute(requireString(payload, 'repoRoot'))
}

/** Whether `target` lies under `base` (or equals it), tolerant of separator
 * style and — on Windows — of letter case (verbatim from upstream fs-tree.ts). */
function isWithin(base, target, platform = process.platform) {
  const norm = (value) => value.replace(/[\\/]+/g, '/').replace(/\/$/, '')
  const normalize = (value) => (platform === 'win32' ? norm(value).toLowerCase() : norm(value))
  const b = normalize(base)
  const t = normalize(target)
  return t === b || t.startsWith(`${b}/`)
}

/** How many leading bytes a binary read returns for client-side detect sniffing. */
const READ_HEAD_LIMIT = 4096
/** Text read cap for the untracked-file diff fallback (upstream readLimit). */
const READ_LIMIT = 2 << 20

/**
 * Text/binary read of a file with the size cap; binary detection via a NUL
 * probe. The result is upstream's discriminated union — `kind: 'text'` with the
 * content, `kind: 'binary'` with the sniffed head — because that is exactly
 * what the client's untracked full-addition fallback switches on
 * (`text.kind === 'text'`). A slim `{ binary }` flag instead left that branch
 * dead: every untracked preview rendered an empty pane and no error.
 *
 * Both branches also carry the file's real `size` and the `truncated` flag, so
 * the pane can say what it is showing (a capped read, or a binary file it
 * cannot draw) instead of silently cutting the document.
 */
async function readText(path, readLimit) {
  const info = await stat(path).catch((error) => {
    throw new SidebarError('fs-error', `cannot read "${path}": ${error instanceof Error ? error.message : String(error)}`, 400)
  })
  if (info.isDirectory()) {
    throw new SidebarError('fs-error', `"${path}" is a directory`, 400)
  }
  const size = info.size
  const truncated = size > readLimit
  const handle = await open(path, 'r').catch((error) => {
    throw new SidebarError('fs-error', `cannot read "${path}": ${error instanceof Error ? error.message : String(error)}`, 400)
  })
  try {
    const buffer = Buffer.alloc(Math.min(size, readLimit))
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    const slice = buffer.subarray(0, bytesRead)
    if (slice.includes(0)) {
      return {
        kind: 'binary',
        size,
        truncated,
        head: slice.subarray(0, Math.min(slice.length, READ_HEAD_LIMIT)).toString('base64'),
      }
    }
    return { kind: 'text', content: slice.toString('utf8'), truncated, size }
  } finally {
    await handle.close()
  }
}

/**
 * Resolve a path that a git command reported — `git status`/`git diff`
 * print paths RELATIVE TO THE REPO TOP LEVEL, which may sit above the
 * session cwd (a session inside a subdirectory of a repository). Absolute
 * paths pass through; relative ones join the repo root (falling back to the
 * cwd when the root cannot be resolved). (Verbatim from upstream index.ts.)
 */
async function resolveGitPath(cwd, raw, selected) {
  if (isAbsolute(raw)) return requireAbsolute(resolveSessionPath(cwd, raw))
  const sessionPath = requireAbsolute(join(cwd, raw))
  if (await stat(sessionPath).then(() => true).catch(() => false)) return sessionPath
  const root = await git.repoRoot(cwd, selected).catch(() => cwd)
  return requireAbsolute(join(root, raw))
}

/**
 * The git.* dispatch table (ported from upstream buildApi's git section).
 * @param ctx - host plugin context.
 * @param workingDirectoryOf - reads the captured 0.2.1+ workingDirectory service.
 */
function buildApi(ctx, workingDirectoryOf) {
  const cwdOf = async (payload) => {
    const sessionId = requireString(payload, 'sessionId')
    const record = payload
    const clientCwd = typeof record?.cwd === 'string' && record.cwd !== '' ? record.cwd : undefined
    return { sessionId, cwd: await sessionCwdOf(ctx, workingDirectoryOf(), sessionId, clientCwd) }
  }
  /** Resolve the optional Git-panel checkout selector against the
   * authoritative session repository. Unlike `cwd`, `worktree` is never
   * trusted directly. */
  const gitCwdOf = async (payload) => {
    const base = await cwdOf(payload)
    const record = payload
    const requested = typeof record?.worktree === 'string' && record.worktree !== '' ? record.worktree : undefined
    return { sessionId: base.sessionId, cwd: await git.resolveWorktree(base.cwd, requested) }
  }
  return {
    'git.worktrees': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const selected = selectedRepoOf(payload)
      // A workspace container (no repo at cwd) has child repos; the worktree
      // list belongs to the SELECTED child, not the container.
      const base = selected !== undefined ? await git.repoRoot(cwd, selected).catch(() => cwd) : cwd
      return git.worktrees(base)
    },
    'git.status': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      return git.status(cwd, selectedRepoOf(payload))
    },
    'git.diff': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const record = payload
      const repoRoot = selectedRepoOf(payload)
      const path = record?.path === undefined ? undefined : await resolveGitPath(cwd, requireString(payload, 'path'), repoRoot)
      return { diff: await git.diff(cwd, path, record?.staged === true, repoRoot) }
    },
    'git.stage': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const record = payload
      const path = record?.path === undefined ? undefined : requireString(payload, 'path')
      await git.stage(cwd, path, selectedRepoOf(payload))
      return { ok: true }
    },
    'git.unstage': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const record = payload
      const path = record?.path === undefined ? undefined : requireString(payload, 'path')
      await git.unstage(cwd, path, selectedRepoOf(payload))
      return { ok: true }
    },
    'git.commit': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const message = requireString(payload, 'message')
      await git.commit(cwd, message, selectedRepoOf(payload))
      return { ok: true }
    },
    'git.push': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      return { pushed: await git.push(cwd, selectedRepoOf(payload)) }
    },
    'git.branch': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      return git.branches(cwd, selectedRepoOf(payload))
    },
    'git.checkout': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      await git.checkout(cwd, requireString(payload, 'branch'), selectedRepoOf(payload))
      return { ok: true }
    },
    'git.log': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const record = payload
      const count = typeof record?.count === 'number' ? Math.trunc(record.count) : 30
      const skip = typeof record?.skip === 'number' ? Math.trunc(record.skip) : 0
      return git.log(cwd, count, skip, selectedRepoOf(payload))
    },
    'git.commit-diff': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      return { diff: await git.commitDiff(cwd, requireString(payload, 'hash'), selectedRepoOf(payload)) }
    },
    'git.show': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const path = requireString(payload, 'path')
      const rev = requireString(payload, 'rev')
      return { content: await git.show(cwd, rev, path, selectedRepoOf(payload)) }
    },
    'git.discard': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      const repoRoot = selectedRepoOf(payload)
      await git.discard(cwd, await resolveGitPath(cwd, requireString(payload, 'path'), repoRoot), repoRoot)
      return { ok: true }
    },
    'git.revert': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      await git.revert(cwd, requireString(payload, 'hash'), selectedRepoOf(payload))
      return { ok: true }
    },
    'git.cherry-pick': async (payload) => {
      const { cwd } = await gitCwdOf(payload)
      await git.cherryPick(cwd, requireString(payload, 'hash'), selectedRepoOf(payload))
      return { ok: true }
    },
    /** Text read rooted at the session cwd (the untracked full-addition
     * fallback of the diff pane). Workspace containment mirrors upstream:
     * git-derived repo paths resolve first, then the fence applies. */
    'fs.read': async (payload) => {
      const { cwd } = await cwdOf(payload)
      const selected = selectedRepoOf(payload)
      const absolute = await resolveGitPath(cwd, requireString(payload, 'path'), selected)
      if (!isWithin(cwd, absolute)) {
        throw new SidebarError('forbidden', `path "${absolute}" is outside workspace`, 403)
      }
      return readText(absolute, READ_LIMIT)
    },
  }
}

/**
 * Plugin body: mount the fenced /git-panel/api routes.
 * @param ctx - host plugin context (webServer, sessions, connection).
 */
export function apply(ctx) {
  // Optional 0.2.1+ dependency: wait for the effective-directory service
  // without making it a hard requirement, so the plugin still mounts on a DSH
  // whose profiles have no workingDirectory row. The callback runs when (and
  // if) the service is active, and clears the reference if it goes away.
  let workingDirectory
  ctx.inject(['workingDirectory'], (waiting) => {
    workingDirectory = waiting.workingDirectory
    waiting.effect(() => () => { workingDirectory = undefined }, 'dsh-sidebar-git: workingDirectory')
  })

  // Delegate admission to the connection service, the same authority the /api
  // bridge uses: requestRejection() applies the Host/Origin fence AND requires
  // an authenticated browser Peer (the launch-token cookie). It answers with
  // the HTTP status to send back, or undefined when the caller may proceed.
  //
  // The fallback exists for a DSH whose connection service predates
  // requestRejection (0.2.0 offers no admission method at all): the copied
  // fence applies that release's rules, reading the same service's configured
  // trustedHosts (the connection row in the profile patch) so the route never
  // invents an authority list of its own.
  const reject = (req, res) => {
    const connection = ctx.connection
    if (typeof connection?.requestRejection === 'function') {
      const rejection = connection.requestRejection(req)
      if (rejection === undefined) return false
      res.statusCode = rejection
      res.end()
      return true
    }
    if (isTrustedApiRequest(req, connection?.trustedHosts ?? [])) return false
    writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
    return true
  }
  const api = buildApi(ctx, () => workingDirectory)
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/git-panel/api',
    handler: async (req, res) => {
      if (reject(req, res)) return
      if (req.method !== 'POST') {
        writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } })
        return
      }
      const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
      const method = pathname.startsWith('/git-panel/api/') ? pathname.slice('/git-panel/api/'.length) : undefined
      if (method === undefined || method.includes('/')) {
        writeError(res, new SidebarError('not-found', 'unknown git-panel API method', 404))
        return
      }
      try {
        const payload = await readJsonBody(req)
        const handler = api[method]
        if (handler === undefined) {
          throw new SidebarError('not-found', `unknown git-panel API method "${method}"`, 404)
        }
        writeOk(res, await handler(payload))
      } catch (error) {
        writeError(res, error)
      }
    },
  }), 'dsh-sidebar-git: /git-panel/api routes')
}
