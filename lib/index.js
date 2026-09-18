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

/** Services required before mounting: the route table, session store, and the web runtime's trusted hosts. */
export const inject = ['webServer', 'sessions', 'webRuntime']

/**
 * Resolve a session's authoritative working directory. The attached session
 * header wins; while the session is still hydrating (the web client attaches
 * the current conversation a moment after page load) the caller's own
 * list-summary cwd is used. Unlike upstream, the session-persistence index
 * fallback is not carried over — cold detached sessions degrade to the
 * process cwd instead (documented extraction simplification).
 */
async function sessionCwdOf(ctx, sessionId, clientCwd) {
  const session = ctx.sessions.get(sessionId)
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
 * Text read of a file with the size cap; binary detection via NUL probe.
 * (Slim port of upstream index.ts readText: the Git panel only consumes the
 * text branch, plus `truncated`/`size`.)
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
    const binary = slice.includes(0)
    const head = binary
      ? slice.subarray(0, Math.min(slice.length, READ_HEAD_LIMIT)).toString('base64')
      : undefined
    return {
      content: binary ? '' : slice.toString('utf8'),
      truncated,
      binary,
      size,
      head,
    }
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

/** The git.* dispatch table (ported from upstream buildApi's git section). */
function buildApi(ctx) {
  const cwdOf = async (payload) => {
    const sessionId = requireString(payload, 'sessionId')
    const record = payload
    const clientCwd = typeof record?.cwd === 'string' && record.cwd !== '' ? record.cwd : undefined
    return { sessionId, cwd: await sessionCwdOf(ctx, sessionId, clientCwd) }
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
 * @param ctx - host plugin context (webServer, sessions, webRuntime).
 */
export function apply(ctx) {
  const fence = (req) => isTrustedApiRequest(req, ctx.webRuntime.trustedHosts)
  const api = buildApi(ctx)
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/git-panel/api',
    handler: async (req, res) => {
      if (!fence(req)) {
        writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
        return
      }
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
