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
import { build } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const lib = join(root, 'lib')
const PACKAGE_ID = 'dsh-sidebar-git'

/** A repo-relative, '/'-separated path — the only path form the bundle may
 *  embed (an absolute one would publish the builder's directory layout and make
 *  the artifact differ from machine to machine). */
function portablePath(absolute) {
  return relative(root, absolute).replace(/\\/g, '/')
}

mkdirSync(lib, { recursive: true })

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
      path: portablePath(join(args.resolveDir, args.path)),
      namespace: 'css-module',
    }))
    build2.onLoad({ filter: /.*/, namespace: 'css-module' }, (args) => {
      const source = readFileSync(join(root, args.path), 'utf8')
      // Keyed by the relative path, so two stylesheets that share a basename
      // stay distinct style tags.
      const tagId = `${PACKAGE_ID}/${args.path}`
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
    '@deepseek-ai/dsh-client-store',
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

/**
 * Node-module roots that can hold a DSH installation, derived from where THIS
 * process runs rather than written down: nvm-windows keeps node inside its own
 * version directory (so the global modules sit beside the executable), POSIX
 * system installs use lib/node_modules, a workspace may vendor the package, and
 * the DSH home supplies the profile trees. An installation that cannot be found
 * makes the audit skip with a hint (see below) instead of failing a build on a
 * machine that simply does not have DSH installed.
 */
function dshModuleRoots() {
  const roots = []
  const push = (candidate) => {
    if (typeof candidate === 'string' && candidate !== '' && !roots.includes(candidate)) roots.push(candidate)
  }
  const execDir = dirname(process.execPath)
  push(join(execDir, 'node_modules'))
  push(join(execDir, 'lib', 'node_modules'))
  push(join(root, 'node_modules'))
  const dshHome = process.env.DSH_HOME ?? join(process.env.USERPROFILE ?? homedir(), '.dsh')
  push(join(dshHome, 'profiles', 'node_modules'))
  try {
    for (const entry of readdirSync(join(dshHome, 'profiles'), { withFileTypes: true })) {
      if (entry.isDirectory()) push(join(dshHome, 'profiles', entry.name, 'node_modules'))
    }
  } catch {
    // No profile tree here; the other roots still apply.
  }
  return roots
}

/** One package-relative entry under every root, in both nestings DSH uses
 *  (`…/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/<pkg>` and the
 *  flat `…/@deepseek-ai/<pkg>`). */
function dshPackageEntries(relativePath) {
  const nestings = [
    join('@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai', relativePath),
    join('@deepseek-ai', relativePath),
  ]
  return dshModuleRoots().flatMap(base => nestings.map(nesting => join(base, nesting)))
}

/** The entry of a package resolved through this workspace's own module graph. */
function resolvedEntry(specifier) {
  try {
    return createRequire(import.meta.url).resolve(specifier)
  } catch {
    return undefined
  }
}

const primitivesEntries = [
  process.env.DSH_PRIMITIVES_ENTRY,
  resolvedEntry(PRIMITIVES_ID),
  ...dshPackageEntries(join('dsh-client-ui-primitives', 'lib', 'index.js')),
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
 *
 * `mode` — `'exports'` parses the entry's own `export { … }` list (a normal
 * ESM package entry); `'presence'` only requires each used name to occur in
 * the entry text, which is all that is checkable for a module that ships
 * inside the built front-end bundle (no source-level export list).
 */
function auditExternalSymbols(bundlePath, moduleId, entryCandidates, label, mode = 'exports') {
  const entry = entryCandidates.find(candidate => existsSync(candidate))
  if (entry === undefined) {
    console.warn(`[audit] ${label}: ${moduleId} not found on this machine — audit skipped`
      + '\n        (set DSH_PRIMITIVES_ENTRY / DSH_FRONTEND_ASSETS to point at a DSH installation)')
    return
  }
  const bundle = readFileSync(bundlePath, 'utf8')
  const source = readFileSync(entry, 'utf8')
  const declared = declaredExports(source)
  const bound = [...bundle.matchAll(new RegExp(`var\\s+(\\w+)\\s*=\\s*require\\("${escapeRegExp(moduleId)}"\\)`, 'g'))]
    .map(match => match[1])
  const accessed = new Set()
  for (const ident of bound) {
    for (const hit of bundle.matchAll(new RegExp(`${ident}\\.([A-Za-z_$][\\w$]*)`, 'g'))) accessed.add(hit[1])
  }
  const missing = mode === 'presence'
    ? [...accessed].filter(name => !source.includes(name)).sort()
    : [...accessed].filter(name => !declared.has(name)).sort()
  if (missing.length > 0) {
    throw new Error(
      `[audit] ${label}: the bundle reads symbols "${moduleId}" does not provide: ${missing.join(', ')}`
      + `\n        (checked against ${entry})`,
    )
  }
  const basis = mode === 'presence' ? 'presence in the served bundle' : `${declared.size} declared exports`
  console.log(`[audit] ${label}: ${accessed.size} symbol(s) verified against ${basis}`)
}

/** The built front-end bundle's hashed asset files (the client module table's home). */
function frontendBundleCandidates() {
  const dirs = [
    process.env.DSH_FRONTEND_ASSETS,
    ...dshPackageEntries(join('dsh-web-frontend', 'dist', 'assets')),
  ].filter(entry => typeof entry === 'string' && entry !== '')
  const found = []
  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (/^index-.*\.js$/.test(name) || name === 'index.js') found.push(join(dir, name))
    }
  }
  return found
}

auditExternalSymbols(join(lib, 'client.js'), PRIMITIVES_ID, primitivesEntries, 'client → dsh-client-ui-primitives')
auditExternalSymbols(join(lib, 'client.js'), '@deepseek-ai/dsh-client-store', frontendBundleCandidates(), 'client → dsh-client-store', 'presence')

console.log('build complete → lib/')
