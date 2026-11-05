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
    const { untrackedFile, unifiedSegments, diffStats, displayPath, parseUnifiedDiff, modInlineDiffs, coalesceInline } = await import(pathToFileURL(outfile).href)

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

    // Rewrite pairing is by content, not by position: a renumbered list moves
    // entries around the block, so the entry that shares a line's text sits at
    // a different index. The pair must join "7. …" with "1. …" (highlighting
    // just the number) and let the two genuinely deleted headings stay pure
    // deletions — position-based pairing would pair them with the new lines
    // and highlight whole unrelated lines.
    const rewritePatch = [
      'diff --git a/list.md b/list.md',
      '--- a/list.md',
      '+++ b/list.md',
      '@@ -1,5 +1,3 @@',
      '-1. settings fullscreen',
      '-2. directory picker',
      '-7. right sidebar works',
      '-8. zoom limited',
      '-9. page scroll locked',
      '+1. right sidebar works',
      '+2. zoom limited',
      '+3. page scroll locked',
      '',
    ].join('\n')
    const rewriteSegments = unifiedSegments(parseUnifiedDiff(rewritePatch).files[0])
    const rewriteRows = rewriteSegments.flatMap((segment) => (segment.kind === 'hunk' ? segment.rows : []))
    const modRows = rewriteRows.filter((row) => row.kind === 'mod')
    const pairedOld = modRows.filter((row) => row.oldLine !== undefined).map((row) => row.oldLine).sort((a, b) => a - b)
    const pairedNew = modRows.filter((row) => row.newLine !== undefined).map((row) => row.newLine).sort((a, b) => a - b)
    report.check(
      'rewrite rows pair by content, not by position',
      pairedOld.join(',') === '3,4,5' && pairedNew.join(',') === '1,2,3',
      `old=[${pairedOld.join(',')}] new=[${pairedNew.join(',')}]`,
    )
    const inline = modInlineDiffs(rewriteSegments)
    const mismatched = modRows.filter((row) => {
      const diff = inline.get(row)
      if (diff === undefined) return true
      const side = row.oldLine !== undefined ? diff.old : diff.next
      return side.map((part) => part.text).join('') !== row.text
    })
    report.check(
      'every rewrite row keeps its own text',
      mismatched.length === 0,
      `modRows=${String(modRows.length)} mismatched=${String(mismatched.length)}`,
    )
    const renumbered = modRows.find((row) => row.oldLine === 3)
    const changed = renumbered === undefined ? null : coalesceInline(inline.get(renumbered)?.old ?? []).filter((part) => part.changed).map((part) => part.text).join('')
    report.check('the highlight marks only the renumbered prefix', changed === '7', `changed="${String(changed)}"`)
    const rewriteStats = diffStats(rewriteSegments)
    report.check(
      'rewrite pairs count once per side, like git numstat',
      rewriteStats.added === 3 && rewriteStats.deleted === 5,
      `+${String(rewriteStats.added)} -${String(rewriteStats.deleted)}`,
    )

    // Rows with nothing in common stay a deletion and an addition: pairing
    // them would tint both as rewrites and highlight the whole line.
    const unrelatedPatch = [
      'diff --git a/other.md b/other.md',
      '--- a/other.md',
      '+++ b/other.md',
      '@@ -1,3 +1,3 @@',
      '-1. settings fullscreen',
      '-2. directory picker',
      '+1. right sidebar works',
      '+2. zoom limited',
      '',
    ].join('\n')
    const unrelatedRows = unifiedSegments(parseUnifiedDiff(unrelatedPatch).files[0])
      .flatMap((segment) => (segment.kind === 'hunk' ? segment.rows : []))
    report.check(
      'unrelated rows stay a pure deletion and a pure addition',
      unrelatedRows.every((row) => row.kind !== 'mod'),
      unrelatedRows.map((row) => row.kind).join(','),
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  return report.finish()
}