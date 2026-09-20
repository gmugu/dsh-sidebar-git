/**
 * Probe: the host half's `/git-panel/api/fs.read` route — the untracked-file
 * read the diff pane renders a full addition from.
 *
 * It mounts `lib/index.js` (the built host entry) with a fake Cordis context,
 * captures the registered route handler and drives it with mocked request and
 * response objects, so the assertions cover the artifact the deployed host
 * loads: the discriminated `kind` union the client switches on, the `size` and
 * `truncated` metadata the pane's notice reads, the browser-trust fence, and the
 * error envelope for a missing file.
 */
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createProbe } from './harness.mjs'

const { apply } = await import(new URL('../../lib/index.js', import.meta.url))

/** The read cap the host applies (src/host/index.js READ_LIMIT). */
const READ_LIMIT = 2 << 20

const exists = async (path) => {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/** @returns {Promise<number>} this probe's failure count. */
export async function run() {
  const report = createProbe('host-fsread')
  const dir = await mkdtemp(join(tmpdir(), 'dsh-probe-fsread-'))
  try {
    const textPath = join(dir, 'sample.txt')
    const binaryPath = join(dir, 'sample.bin')
    const bigPath = join(dir, 'big.txt')
    await writeFile(textPath, 'hello from the untracked fallback\n')
    await writeFile(binaryPath, Buffer.from([0x50, 0x4e, 0x47, 0x00, 0x01, 0x02]))
    await writeFile(bigPath, 'x'.repeat(READ_LIMIT + 1024))

    let route
    apply({
      sessions: { get: () => ({ header: { cwd: dir } }) },
      webRuntime: { trustedHosts: [] },
      webServer: { register: (value) => { route = value; return () => {} } },
      effect: (fn) => fn(),
    })
    if (route === undefined) {
      report.check('apply() registers the route table', false)
      return report.finish()
    }

    const call = async (path, host = '127.0.0.1:3080') => {
      const payload = JSON.stringify({ sessionId: 'probe', path })
      const req = {
        method: 'POST',
        url: '/git-panel/api/fs.read',
        headers: { host },
        async *[Symbol.asyncIterator]() { yield Buffer.from(payload, 'utf8') },
      }
      const res = { status: 0, body: '' }
      res.writeHead = (status) => { res.status = status }
      res.end = (body) => { res.body = body }
      await route.handler(req, res)
      return { status: res.status, json: JSON.parse(res.body) }
    }

    const text = await call(textPath)
    const textValue = text.json.value
    report.check('answers 200 ok', text.status === 200 && text.json.ok === true)
    report.check(
      "a text read carries kind: 'text'",
      textValue?.kind === 'text',
      `kind=${JSON.stringify(textValue?.kind)} keys=${JSON.stringify(Object.keys(textValue ?? {}))}`,
    )
    report.check('a text read carries the content', textValue?.content?.includes('hello from the untracked fallback') === true)
    report.check(
      'a text read carries the real size and an unset truncated flag',
      textValue?.size === (await stat(textPath)).size && textValue?.truncated === false,
      `size=${String(textValue?.size)}`,
    )

    const big = await call(bigPath)
    const bigValue = big.json.value
    report.check(
      'a read past the cap is flagged truncated with the full size',
      bigValue?.truncated === true && bigValue?.size === READ_LIMIT + 1024 && bigValue?.content?.length === READ_LIMIT,
      `size=${String(bigValue?.size)} content=${String(bigValue?.content?.length)}`,
    )

    const binary = await call(binaryPath)
    const binaryValue = binary.json.value
    report.check(
      "a binary read carries kind: 'binary' with the sniffed head",
      binaryValue?.kind === 'binary' && typeof binaryValue?.head === 'string' && binaryValue.head.length > 0,
      `kind=${JSON.stringify(binaryValue?.kind)}`,
    )

    const fenced = await call(textPath, 'evil.example.com')
    report.check('a non-loopback Host is refused', fenced.status === 403 && fenced.json.error?.code === 'forbidden')

    const missing = await call(join(dir, 'nope.txt'))
    report.check('a missing path fails with fs-error', missing.json.error?.code === 'fs-error', JSON.stringify(missing.json.error))
    report.check('the probe left no fixture behind beyond its own directory', await exists(dir))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  return report.finish()
}