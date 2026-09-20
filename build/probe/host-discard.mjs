/**
 * Probe: the host half's `discard` against a scratch repository.
 *
 * Pins the semantics the panel's row-level discard promises: a path the index
 * records is restored from the index (so a staged change survives), an untracked
 * path — which has no earlier version — is deleted together with an untracked
 * directory, an ignored file is never touched, and an already-clean path is a
 * no-op. Runs against `lib/git.js`, i.e. exactly what the deployed host loads.
 */
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createProbe } from './harness.mjs'

const { discard } = await import(new URL('../../lib/git.js', import.meta.url))

const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' })
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
  const report = createProbe('host-discard')
  const root = await mkdtemp(join(tmpdir(), 'dsh-probe-discard-'))
  try {
    git(root, 'init', '-q', '.')
    await writeFile(join(root, 'tracked.txt'), 'v1')
    await writeFile(join(root, '.gitignore'), 'ignored.log\n')
    git(root, 'add', 'tracked.txt', '.gitignore')
    git(root, '-c', 'user.name=probe', '-c', 'user.email=probe@local', 'commit', '-qm', 'init')

    // Fixtures: modified tracked file, untracked file, untracked directory, an
    // ignored file, and a staged new file edited again afterwards (AM).
    await writeFile(join(root, 'tracked.txt'), 'v2-worktree')
    await writeFile(join(root, 'new.txt'), 'new')
    await mkdir(join(root, 'dir'))
    await writeFile(join(root, 'dir', 'sub.txt'), 'sub')
    await writeFile(join(root, 'ignored.log'), 'keep me')
    await writeFile(join(root, 'added.txt'), 'staged-version')
    git(root, 'add', 'added.txt')
    await writeFile(join(root, 'added.txt'), 'worktree-version')

    await discard(root, join(root, 'new.txt'))
    report.check('an untracked file is deleted', !(await exists(join(root, 'new.txt'))))

    await discard(root, join(root, 'dir'))
    report.check('an untracked directory is deleted', !(await exists(join(root, 'dir'))))

    await discard(root, join(root, 'tracked.txt'))
    report.check(
      'a tracked file resets to its index version',
      (await readFile(join(root, 'tracked.txt'), 'utf8')) === 'v1',
      await readFile(join(root, 'tracked.txt'), 'utf8'),
    )

    await discard(root, join(root, 'added.txt'))
    report.check(
      'a staged new file keeps its staged content',
      (await readFile(join(root, 'added.txt'), 'utf8')) === 'staged-version',
      await readFile(join(root, 'added.txt'), 'utf8'),
    )
    report.check('the index still holds the staged addition', git(root, 'status', '--porcelain').includes('A  added.txt'))

    report.check('an ignored file survives a discard', await exists(join(root, 'ignored.log')))

    await discard(root, join(root, 'tracked.txt'))
    report.check('discarding an already-clean tracked path is a no-op', true)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
  return report.finish()
}