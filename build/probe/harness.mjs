/**
 * Shared report helper for the probes: each probe collects named assertions and
 * returns its failure count, so `run.mjs` can aggregate them.
 *
 * A probe is deliberately NOT a test framework: it drives the BUILT artifact
 * (`lib/`) the same way the running plugin does — a scratch repository for the
 * git routes, a fake Cordis context for the host entry, the real diff stack for
 * the document model — and prints what it checked.
 */

/** One probe's assertion collector. */
export function createProbe(name) {
  let failures = 0
  return {
    name,
    /**
     * Record one assertion.
     * @param label - what is being checked.
     * @param ok - the outcome.
     * @param extra - optional evidence for the line (a value, a count).
     */
    check(label, ok, extra = '') {
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra === '' ? '' : `  (${extra})`}`)
      if (!ok) failures += 1
    },
    /** Print the probe's verdict and return its failure count. */
    finish() {
      console.log(`${failures === 0 ? 'OK  ' : 'FAIL'}  ${name}${failures === 0 ? '' : ` — ${failures} failure(s)`}`)
      return failures
    },
  }
}

/** Whether the built artifacts the probes mount exist. */
export async function artifactsPresent() {
  const { access } = await import('node:fs/promises')
  const { fileURLToPath } = await import('node:url')
  const targets = ['../../lib/index.js', '../../lib/git.js'].map(
    (relative) => fileURLToPath(new URL(relative, import.meta.url)),
  )
  try {
    await Promise.all(targets.map((target) => access(target)))
    return true
  } catch {
    console.error('probes need a build first: run `node build/build.js`')
    return false
  }
}