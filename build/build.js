/**
 * Build script for dsh-sidebar-git.
 *
 * - Host: the copied upstream TypeScript modules (git / trust-fence / wire /
 *   session-path) are type-stripped to ESM under lib/; the hand-written
 *   glue src/host/index.js is copied as-is.
 * - Client: src/client/index.tsx is bundled (esbuild, cjs) into the DSH
 *   browser-module wrapper:
 *
 *       window.__ModuleLoader__.load({ id, factory(require) { ... } })
 *
 *   with react / primitives left external (resolved from the browser module
 *   table at runtime). A tiny onLoad plugin compiles `*.module.css` into the
 *   exact shape the upstream tsdown build emits: a <style> injection plus a
 *   className map (module default export).
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const lib = join(root, 'lib')
const PACKAGE_ID = 'dsh-sidebar-git'

mkdirSync(lib, { recursive: true })

// ── esbuild: prefer the native binary; sandboxes that deny child-process
//    spawn fall back to the in-process WASM build (same API, slower). ─────
let build
try {
  build = (await import('esbuild')).build
  await build({ stdin: { contents: 'let x: number = 1', resolveDir: root, loader: 'ts' }, write: false })
} catch (error) {
  if (error?.code !== 'EPERM') throw error
  console.log('native esbuild spawn denied (EPERM) — falling back to esbuild-wasm')
  const esbuildWasm = await import('esbuild-wasm')
  // In Node the WASM build takes a precompiled WebAssembly.Module.
  const wasmBinary = readFileSync(join(root, 'node_modules', 'esbuild-wasm', 'esbuild.wasm'))
  await esbuildWasm.initialize({ wasmModule: new WebAssembly.Module(wasmBinary) })
  build = esbuildWasm.build
}

// ── Host half: type-strip the verbatim upstream modules to ESM. ──────────
await build({
  entryPoints: [
    join(src, 'host', 'git.ts'),
    join(src, 'host', 'trust-fence.ts'),
    join(src, 'host', 'wire.ts'),
    join(src, 'host', 'session-path.ts'),
  ],
  outdir: lib,
  bundle: false,
  format: 'esm',
  logLevel: 'info',
})

// The glue is already plain ESM JavaScript.
cpSync(join(src, 'host', 'index.js'), join(lib, 'index.js'))

// ── CSS-module loader: `*.module.css` → style injection + className map. ─
const cssPrefix = 'dshgit'
const cssModulePlugin = {
  name: 'css-module',
  setup(build2) {
    build2.onResolve({ filter: /\.module\.css$/ }, (args) => ({
      path: join(args.resolveDir, args.path),
      namespace: 'css-module',
    }))
    build2.onLoad({ filter: /.*/, namespace: 'css-module' }, (args) => {
      const source = readFileSync(args.path, 'utf8')
      const tagId = `${PACKAGE_ID}/${args.path.split(/[\\/]/).pop()}`
      // Strip comments first so prose like "see sidebar.module.css" never
      // gets its `.word` tokens rewritten, then restore them verbatim.
      const comments = []
      let css = source.replace(/\/\*[\s\S]*?\*\//g, (m) => `\x00${comments.push(m) - 1}\x00`)
      const map = {}
      // 1. Keyframes names: rename and rewrite every reference.
      const keyframes = [...css.matchAll(/@keyframes\s+([A-Za-z_][\w-]*)/g)].map(m => m[1])
      for (const name of [...new Set(keyframes)]) {
        const renamed = `${cssPrefix}_${name}`
        css = css.replace(new RegExp(`@keyframes\\s+${name}\\b`), `@keyframes ${renamed}`)
        css = css.replace(new RegExp(`\\b${name}\\b`, 'g'), renamed)
      }
      // 2. Class selectors: .name → .<prefix>_name (and record the mapping).
      css = css.replace(/\.([A-Za-z_][\w-]*)/g, (_, name) => {
        const renamed = `${cssPrefix}_${name}`
        map[name] = renamed
        return `.${renamed}`
      })
      css = css.replace(/\x00(\d+)\x00/g, (_, i) => comments[Number(i)])
      const js = [
        `const css = ${JSON.stringify(css)};`,
        `const tagId = ${JSON.stringify(tagId)};`,
        'if (typeof document !== "undefined" && document.querySelector(\'style[data-plugin-css="\' + tagId + \'"]\') === null) {',
        '  const tag = document.createElement("style");',
        `  tag.dataset.plugin = ${JSON.stringify(PACKAGE_ID)};`,
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        'module.exports = ' + mapLiteral(map) + ';',
      ].join('\n')
      return { contents: js, loader: 'js' }
    })
  },
}

/** One JS object literal from the className map (stable key order). */
function mapLiteral(map) {
  const entries = Object.entries(map).map(([k, v]) => `\t${JSON.stringify(k)}: ${JSON.stringify(v)}`)
  return `{\n${entries.join(',\n')}\n}`
}

// ── Client half: bundle the TSX entry into the ModuleLoader wrapper. ─────
await build({
  entryPoints: [join(src, 'client', 'index.tsx')],
  outfile: join(lib, 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  jsx: 'automatic',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/dsh-client-ui-primitives',
  ],
  plugins: [cssModulePlugin],
  banner: {
    js: [
      'window.__ModuleLoader__.load({',
      `\tid: ${JSON.stringify(PACKAGE_ID)},`,
      '\tfactory: function (require) {',
      '\t\tvar module = { exports: {} };',
      '\t\tvar exports = module.exports;',
    ].join('\n'),
  },
  footer: {
    js: [
      '\t\treturn module.exports;',
      '\t}',
      '});',
    ].join('\n'),
  },
  logLevel: 'info',
})

writeFileSync(join(lib, '.built'), new Date().toISOString())

// ── External-symbol audit ────────────────────────────────────────────────
// A component imported from a module that does not export it is `undefined`
// at runtime and crashes React with "element type is invalid" (#130). That is
// exactly how `IconDiffOutline16` shipped broken once — the symbol looked
// plausible, the build stayed green, and only the browser console knew. This
// audit turns that class of mistake into a build failure: every property the
// bundle reads off an external module must appear in that module's own
// `export { … }` list.
const PRIMITIVES_ID = '@deepseek-ai/dsh-client-ui-primitives'
const primitivesEntries = [
  process.env.DSH_PRIMITIVES_ENTRY,
  join(root, 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives', 'lib', 'index.js'),
  'C:\\nvm4w\\nodejs\\node_modules\\@deepseek-ai\\dsh\\node_modules\\@deepseek-ai\\dsh-client-ui-primitives\\lib\\index.js',
  join(process.env.USERPROFILE ?? '', '.dsh', 'profiles', 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives', 'lib', 'index.js'),
].filter(entry => typeof entry === 'string' && entry !== '')

/** Escape one literal for use inside a RegExp. */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Collect the names a module's `export { … }` statements declare. */
function declaredExports(moduleSource) {
  const declared = new Set()
  for (const statement of moduleSource.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const entry of statement[1].split(',')) {
      const name = entry.trim().split(/\s+as\s+/).pop()?.trim()
      if (name !== undefined && name !== '') declared.add(name)
    }
  }
  return declared
}

/**
 * Verify every property the bundle reads off `moduleId` exists in that
 * module's shipped entry. Throws on any missing symbol.
 */
function auditExternalSymbols(bundlePath, moduleId, entryCandidates, label) {
  const entry = entryCandidates.find(candidate => existsSync(candidate))
  if (entry === undefined) {
    console.warn(`[audit] ${label}: module entry not found on this machine — audit skipped`)
    return
  }
  const bundle = readFileSync(bundlePath, 'utf8')
  const declared = declaredExports(readFileSync(entry, 'utf8'))
  const bound = [...bundle.matchAll(new RegExp(`var\\s+(\\w+)\\s*=\\s*require\\("${escapeRegExp(moduleId)}"\\)`, 'g'))]
    .map(match => match[1])
  const accessed = new Set()
  for (const ident of bound) {
    for (const hit of bundle.matchAll(new RegExp(`${ident}\\.([A-Za-z_$][\\w$]*)`, 'g'))) accessed.add(hit[1])
  }
  const missing = [...accessed].filter(name => !declared.has(name)).sort()
  if (missing.length > 0) {
    throw new Error(
      `[audit] ${label}: the bundle reads symbols "${moduleId}" does not export: ${missing.join(', ')}`
      + `\n        (checked against ${entry})`,
    )
  }
  console.log(`[audit] ${label}: ${accessed.size} symbol(s) verified against ${declared.size} declared exports`)
}

auditExternalSymbols(join(lib, 'client.js'), PRIMITIVES_ID, primitivesEntries, 'client → dsh-client-ui-primitives')

console.log('build complete → lib/')
