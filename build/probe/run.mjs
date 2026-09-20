/**
 * Every probe, in one run: `npm run probe` / `node build/probe/run.mjs`.
 *
 * Each probe drives the BUILT artifacts (`lib/git.js`, `lib/index.js`) or the
 * real diff stack against scratch fixtures, and reports PASS/FAIL lines. The
 * script exits non-zero when any assertion fails, so it can gate a commit next
 * to `build/build.js` and `build/dry-run.mjs`.
 */
import { artifactsPresent } from './harness.mjs'
import { run as hostDiscard } from './host-discard.mjs'
import { run as hostFsRead } from './host-fsread.mjs'
import { run as diffDoc } from './diff-doc.mjs'

if (!(await artifactsPresent())) process.exit(1)

let failures = 0
for (const [name, probe] of [['host-discard', hostDiscard], ['host-fsread', hostFsRead], ['diff-doc', diffDoc]]) {
  console.log(`\n=== probe: ${name} ===`)
  try {
    failures += await probe()
  } catch (error) {
    console.error(`FAIL  ${name} threw: ${error instanceof Error ? error.message : String(error)}`)
    failures += 1
  }
}

console.log(failures === 0 ? '\nprobes: ALL PASS' : `\nprobes: ${String(failures)} failure(s)`)
process.exit(failures === 0 ? 0 : 1)