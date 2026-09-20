/**
 * Probe: the diff stack's document model, driven through the REAL
 * `src/client/diff/rows.ts` (bundled on the fly with esbuild).
 *
 * The pane hands an untracked file's content to `untrackedFile` and renders
 * whatever `unifiedSegments`/`diffStats` produce, so those three functions are
 * what decides whether an untracked preview has rows to draw at all. The probe
 * also parses a two-file patch to pin the multi-file side of the model that the
 * commit view folds.
 */
import { mkdtemp, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { build as esbuild } from 'esbuild'
import { createProbe } from './harness.mjs'

/** @returns {Promise<number>} this probe's failure count. */
export async function run() {
  const report = createProbe('diff-doc')
  const dir = await mkdtemp(join(tmpdir(), 'dsh-probe-diffdoc-'))
  try {
    const entry = fileURLToPath(new URL('../../src/client/diff/rows.ts', import.meta.url))
    const outfile = join(dir, 'rows.mjs')
    await esbuild({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'warning' })
    const { untrackedFile, unifiedSegments, diffStats, displayPath, parseUnifiedDiff } = await import(pathToFileURL(outfile).href)

    const path = 'tmp/hello.txt'
    const file = untrackedFile(path, 'hello line 1\nhello line 2\n')
    const segments = unifiedSegments(file)
    const stats = diffStats(segments)
    const hunks = segments.filter((segment) => segment.kind === 'hunk')
    const rows = hunks.flatMap((hunk) => hunk.rows)

    report.check('an untracked file is shown at its real path', displayPath(file.newPath) === path, displayPath(file.newPath))
    report.check('it is one hunk (so a single-file document opens expanded)', hunks.length === 1, `hunks=${String(hunks.length)}`)
    report.check(
      'every content line is an addition row',
      rows.length === 2 && rows.every((row) => row.kind === 'add'),
      `rows=${String(rows.length)}`,
    )
    report.check(
      'the added text survives verbatim',
      rows.map((row) => row.text).join('|') === 'hello line 1|hello line 2',
      rows.map((row) => row.text).join('|'),
    )
    report.check('its header stat reads +2 / -0', stats.added === 2 && stats.deleted === 0, `+${String(stats.added)} -${String(stats.deleted)}`)

    const patch = [
      'diff --git a/one.txt b/one.txt',
      '--- a/one.txt',
      '+++ b/one.txt',
      '@@ -1 +1 @@',
      '-old',
      '+new',
      'diff --git a/two.txt b/two.txt',
      '--- a/two.txt',
      '+++ b/two.txt',
      '@@ -1 +1,2 @@',
      ' keep',
      '+added',
      '',
    ].join('\n')
    const parsed = parseUnifiedDiff(patch)
    report.check('a two-file patch parses into two files', parsed.files.length === 2, `files=${String(parsed.files.length)}`)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  return report.finish()
}