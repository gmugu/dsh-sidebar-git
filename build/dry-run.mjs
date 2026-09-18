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
const requireStubs = {
  react: {
    useState: () => [null, () => {}],
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
    IconCodeOutline16: () => null, IconCopyOutline16: () => null, IconPlusOutline16: () => null,
    IconRefreshOutline16: () => null, IconTrashOutline16: () => null, IconBranchOutline16: () => null,
    writeClipboard: () => {},
  },
  clsx: (...args) => args.filter(Boolean).join(' '),
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