// Dry-run the built client bundle outside a browser: stub the ModuleLoader
// and every external module the factory requires, then assert the exported
// plugin face ({ inject, apply }) and the registrations apply performs
// against a mock client context (shipped-package shape: declared services,
// direct ctx.sidebarRightTabs access, ctx.effect-wrapped registrations).
const loaded = []
globalThis.window = {
  __ModuleLoader__: {
    load(def) {
      loaded.push(def)
    },
  },
  document: undefined,
}
/** Every defineStore declaration the bundle made (see the stub below). */
const storeSpecs = []
const requireStubs = {
  react: {    useState: () => [null, () => {}],
    useMemo: (f) => f(),
    useSyncExternalStore: () => undefined,
    useCallback: (f) => f,
    useEffect: () => {},
    useRef: () => ({ current: null }),
    createElement: () => null,
  },
  'react/jsx-runtime': { jsx: () => null, jsxs: () => null, Fragment: 'Fragment' },
  'react-dom': {},
  'react-dom/client': {},
  '@deepseek-ai/dsh-client-ui-primitives': {
    Button: () => null, Input: () => null, Menu: () => null, Modal: () => null,
    IconCopyOutline16: () => null, IconPlusOutline16: () => null,
    IconRefreshOutline16: () => null, IconBranchOutline16: () => null,
    writeClipboard: () => {},
  },
  clsx: (...args) => args.filter(Boolean).join(' '),
  // The framework store: capture the declaration so the assertions below can
  // inspect init/actions and the registration's `store` option.
  '@deepseek-ai/dsh-client-store': {
    defineStore: (spec) => {
      storeSpecs.push(spec)
      return { __storeHandle: true }
    },
  },
}
await import('../lib/client.js')
if (loaded.length !== 1) throw new Error(`expected exactly one load() call, got ${loaded.length}`)
const mod = loaded[0].factory((id) => {
  const stub = requireStubs[id]
  if (stub === undefined) throw new Error(`no stub for required module: ${id}`)
  return stub
})
console.log('id:', loaded[0].id)
console.log('inject:', mod.inject?.join(','))
console.log('apply:', typeof mod.apply)
if (typeof mod.apply !== 'function') throw new Error('missing apply')
if (mod.inject?.includes('sidebarRightTabs') !== true) throw new Error('sidebarRightTabs must be declared')
if (mod.inject?.includes('slots') !== true) throw new Error('slots must be declared')
if (mod.inject?.includes('locale') !== true) throw new Error('locale must be declared')

// Execute apply against a mock client context and assert the registrations.
const registered = { tabs: [], panes: [], titles: [] }
const effects = []
const ctx = {
  locale: { getSnapshot: () => ({ active: 'zh' }), subscribe: () => () => {} },
  sessions: { list: { subscribe: () => () => {}, getSnapshot: () => ({ byId: { s1: { cwd: 'D:/x' } } }) } },
  sidebarRight: { openResource: () => {} },
  sidebarRightTabs: {
    register(definition) {
      registered.tabs.push(definition)
      return () => {}
    },
  },
  slots: {
    inject(key, callback) {
      const d = callback()
      if (key === 'sidebar.right.pane.tab') registered.panes.push(d)
      if (key === 'sidebar.right.pane.tab.title') registered.titles.push(d)
      return { dispose: () => { if (typeof d === 'function') d() } }
    },
    register(options, component) {
      return { options, component }
    },
  },
  effect(body, label) {
    effects.push(label)
    const d = body()
    return { dispose: () => { if (typeof d === 'function') d() } }
  },
}
mod.apply(ctx)
console.log('effects:', effects.join(' | '))
if (effects.length !== 3) throw new Error(`expected 3 effects, got ${effects.length}`)
if (registered.tabs.length !== 1) throw new Error(`expected 1 tab type, got ${registered.tabs.length}`)
const def = registered.tabs[0]
console.log('tab id:', def.id, '| kind:', def.kind, '| priority:', def.priority)
console.log('title():', def.title(''))
console.log('guide entries:', def.guide.length, '| guide title:', def.guide[0].title(), '| icon:', typeof def.guide[0].icon)
if (def.guide[0].icon() === undefined) throw new Error('guide icon must render')
if (registered.panes.length !== 1) throw new Error('body slot not registered')
const bodyReg = registered.panes[0]
if (bodyReg.options.inject !== undefined) throw new Error('custom inject face must stay off the shared seat')
console.log('body key:', bodyReg.options.key, '| no custom inject ✓')
console.log('body component:', typeof bodyReg.component)

// ── The store declaration (state that must outlive the tab body) ──────────
if (bodyReg.options.store === undefined) throw new Error('the body registration must declare a store')
if (storeSpecs.length !== 1) throw new Error(`expected exactly one defineStore declaration, got ${storeSpecs.length}`)
const spec = storeSpecs[0]
if (typeof spec.init !== 'function') throw new Error('store spec needs init()')
for (const action of ['publish', 'setCommitMsg', 'setPreview', 'setPaneHeight', 'resetScope']) {
  if (typeof spec.actions?.[action] !== 'function') throw new Error(`store spec is missing action "${action}"`)
}
const draft = spec.init()
if (draft.view?.status !== null || draft.commitMsg !== '' || draft.preview !== null || draft.paneHeight !== null) {
  throw new Error('store init() must start with an empty view, no draft, no preview, an unsized pane')
}
if (draft.scopeKey !== '') throw new Error('store init() must start with an unapplied scope')
spec.actions.publish(draft, { status: { isRepo: true, entries: [] }, error: null })
spec.actions.setCommitMsg(draft, 'wip')
spec.actions.setPaneHeight(draft, 420)
if (draft.view.status?.isRepo !== true) throw new Error('publish must patch the view')
if (draft.commitMsg !== 'wip') throw new Error('setCommitMsg must replace the draft')
if (draft.paneHeight !== 420) throw new Error('setPaneHeight must commit the height')
spec.actions.setPreview(draft, { kind: 'commit', hash: 'abc', hashFull: 'a'.repeat(40), subject: 's' })
if (draft.preview?.kind !== 'commit') throw new Error('setPreview must store the ref')
// `resetScope` marks a genuinely changed scope and drops the old selection.
spec.actions.resetScope(draft, 's1\u0000D:/y')
if (draft.scopeKey !== 's1\u0000D:/y') throw new Error('resetScope must record the new scope')
if (draft.view.selectedWorktree !== undefined) throw new Error('resetScope must drop the checkout selection')
console.log('store spec: init + 5 actions verified ✓')
if (registered.titles.length !== 1) throw new Error('title slot not registered')
console.log('APPLY MOCK OK')

// ── Guarded-facade pass: mirror dsh-cordis-client-runner's dynamic client
//    proxy (verb table + declared-service gate) and prove apply survives it.
//    The verb table has no `inject`, so a cordis ctx.inject(...) wait call
//    would be rejected here — the regression this test exists for.
const CTX_VERBS = new Set(['effect', 'on', 'once', 'provide', 'timeout', 'interval',
  'setTimeout', 'setInterval', 'throttle', 'debounce'])
const declared = new Set(mod.inject)
const guarded = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'get') return (name) => ctx[name]
    if (typeof prop !== 'string') return undefined
    if (CTX_VERBS.has(prop)) return (...args) => ctx[prop](...args)
    if (!declared.has(prop)) {
      throw new Error(`guard rejected undeclared property "${prop}"`)
    }
    return ctx[prop]
  },
  set() {
    throw new Error('guard rejected assignment')
  },
})
registered.tabs.length = 0
registered.panes.length = 0
registered.titles.length = 0
effects.length = 0
mod.apply(guarded)
if (registered.tabs.length !== 1 || registered.panes.length !== 1 || registered.titles.length !== 1) {
  throw new Error('guarded-facade pass did not register everything')
}
console.log('GUARDED-FACADE PASS OK — no undeclared access, no ctx.inject wait')

// ── Source-level parity the bundle cannot show (this project has no tsc step):
//    every method the client calls must be a route the host answers, and both
//    locale dictionaries must carry the same keys. Both are pure string checks
//    over the sources, so a typo in a method name or a half-added copy key -
//    which would only surface at runtime (a 404, or a raw key on screen) - fails
//    the build instead.
const { readFile } = await import('node:fs/promises')
const { fileURLToPath } = await import('node:url')
const source = (relative) => readFile(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')

const apiSource = await source('../src/client/api.ts')
const hostSource = await source('../src/host/index.js')
const clientMethods = [...apiSource.matchAll(/call<[^>]*>\('([^']+)'/g)].map((match) => match[1])
const hostRoutes = [...hostSource.matchAll(/^\s*'([a-z][a-z-]*\.[a-z-]+)':/gm)].map((match) => match[1])
const clientOnly = clientMethods.filter((name) => !hostRoutes.includes(name))
const hostOnly = hostRoutes.filter((name) => !clientMethods.includes(name))
if (clientOnly.length > 0 || hostOnly.length > 0) {
  throw new Error(`route/api mismatch — client calls without a route: ${clientOnly.join(', ') || 'none'}; routes never called: ${hostOnly.join(', ') || 'none'}`)
}
console.log(`route/api parity ✓ — ${new Set(clientMethods).size} method(s)`)

const localeSource = await source('../src/client/locales.ts')
const zhStart = localeSource.indexOf('export const zh')
const enStart = localeSource.indexOf('export const en')
if (zhStart < 0 || enStart < 0 || enStart < zhStart) throw new Error('locales.ts: cannot find the zh and en dictionaries')
const keysIn = (text) => [...text.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*):/gm)].map((match) => match[1])
const zhKeys = keysIn(localeSource.slice(zhStart, enStart))
const enKeys = keysIn(localeSource.slice(enStart))
const zhOnly = zhKeys.filter((key) => !enKeys.includes(key))
const enOnly = enKeys.filter((key) => !zhKeys.includes(key))
if (zhOnly.length > 0 || enOnly.length > 0) {
  throw new Error(`locale key mismatch — zh only: ${zhOnly.join(', ') || 'none'}; en only: ${enOnly.join(', ') || 'none'}`)
}
console.log(`locale parity ✓ — ${zhKeys.length} key(s)`)

// ── Portability pass: nothing this repository ships may carry the builder's
//    machine. An artifact, a doc or a script that embeds an absolute path (a
//    drive letter, a user profile, AppData) leaks the author's directory layout
//    and makes the build differ from machine to machine - the CSS-module
//    virtual id and the build script's DSH lookup both shipped that way once. A
//    line that genuinely has to show such a path can opt out with the marker
//    `machine-path-ok`.
const { readdirSync } = await import('node:fs')
const { join, relative } = await import('node:path')
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const MACHINE_PATTERNS = [
  // A drive path with at least two non-empty segments: that is a real location
  // (`D:\ws\project\src`, `C:\Users\me\AppData\...`, `C:\nvm4w\nodejs\node_modules`),
  // while a doc example like `C:\\foo` or a placeholder like `D:\dsh-home` has
  // one segment and stays legal.
  ['windows drive path', /[A-Za-z]:\\[^\\\s]+\\[^\\\s]/],
  ['user profile path', /[\\/]Users[\\/]/],
  ['AppData', /AppData/],
  ['env placeholder', /%USERPROFILE%/],
]
/** Every file this repository publishes, plus the build tooling — except this
 *  gate itself, whose pattern literals would otherwise flag it. */
const shippedFiles = [
  ...readdirSync(join(rootDir, 'lib')).filter((name) => name.endsWith('.js')).map((name) => join(rootDir, 'lib', name)),
  join(rootDir, 'README.md'),
  join(rootDir, 'README.zh.md'),
  join(rootDir, 'LICENSE'),
  ...readdirSync(join(rootDir, 'src'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx|css|js)$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name)),
  ...readdirSync(join(rootDir, 'build'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== 'dry-run.mjs' && /\.(js|mjs|ps1)$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name)),
]
const offenders = []
for (const target of shippedFiles) {
  const lines = (await readFile(target, 'utf8')).split('\n')
  lines.forEach((line, index) => {
    if (line.includes('machine-path-ok')) return
    for (const [name, test] of MACHINE_PATTERNS) {
      if (test.test(line)) offenders.push(`${relative(rootDir, target).replaceAll('\\', '/')}:${index + 1} (${name})`)
    }
  })
}
if (offenders.length > 0) {
  throw new Error(`a shipped file carries a machine-specific path: ${offenders.join('; ')}`)
}
console.log(`portability pass ✓ — ${shippedFiles.length} shipped file(s) free of machine paths`)