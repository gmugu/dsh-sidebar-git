# dsh-sidebar-git

Standalone Git panel tab for the DSH native right sidebar — extracted from
[dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)'s
changes-tab Git lens (MIT, upstream sources included under `src/` with
provenance notes; only the route prefix, glue, and locale subset are new).

## What it provides

- One native right-sidebar page tab (kind `git`, extension band) with a guide
  capsule, reachable from the panel's "+" add control.
- The full Git lens feature set: staged/unstaged file lists, stage/unstage,
  commit box, branch switch, worktree + child-repo selectors, VSCode-like
  history (lazy paging, ref decorations), shared bottom diff pane
  (staged-side fallback, untracked full-addition fallback, hunk-fold
  expansion), right-click menus (open file, discard/revert/cherry-pick with
  confirm modals, copy paths/hashes), 2s polling while visible.
- Host routes under **`/git-panel/api/`** (own prefix; coexists with
  dsh-better-sidebar's `/sidebar/api`): `git.status/diff/stage/unstage/commit/
  branch/checkout/log/commit-diff/show/worktrees/discard/revert/cherry-pick`
  + `fs.read` (untracked fallback). Every command runs with `-C` on the
  session's working directory; optional worktree/repo targets are validated
  against the authoritative registry. Requests pass the same loopback/Origin
  trust fence as the `/api` gateway.

## Layout

The repository root (`D:\ws\dsh-sidebar-git`) **is** the package root — these
entries sit directly beside each other:

- `src/host/` — `git.ts` / `trust-fence.ts` / `wire.ts` / `session-path.ts`
  (verbatim upstream, type-stripped at build) + `index.js` (new glue).
- `src/client/` — `GitPanel.tsx` (upstream GitLens, store dependency replaced
  by an always-armed workspace fence), `GitDiffPane.tsx` (upstream DiffPane,
  git branch only), `diff/` stack (verbatim), locales subset (zh/en),
  `index.tsx` (new: native tab registration).
- `build/build.js` — esbuild: type-strips the host modules, bundles the TSX
  client into the DSH `window.__ModuleLoader__` wrapper (react/primitives
  external), compiles `*.module.css` into style-injection + className map.

## Iterate

```
node build/build.js                                # rebuild lib/ (runs the export audit)
node build/dry-run.mjs                             # exported face + registrations + guard-facade pass
# stage the built package into the profile (pnpm cannot junction across drives):
Copy-Item package.json,cordis.patch.yml,lib -> C:\Users\admin\.dsh\profiles\web\local\dsh-sidebar-git\
# then reinstall via the plugin manager (bundle: dsh-sidebar-git)
```

Installed location: `C:\Users\admin\.dsh\profiles\web\local\dsh-sidebar-git`
(junctioned from the profile `node_modules`). The workspace copy is the
source of truth.

## Panel state lives in the registration's store

The dock renders **only the active tab's body** (`renderTab(pane.activeTabId)`
in the served front end), so selecting another tab unmounts this panel and
every `useState` inside it is discarded. The body therefore declares a store
(`store: createGitStore()` in its registration, `defineStore({ init, actions })`
from `@deepseek-ai/dsh-client-store`), which the framework mints **per
session** and hands to the component as `useStore`/`actions`. What survives a
tab switch: the checkout view (status, worktrees, branch names, history), the
worktree/repo selection, the commit-message draft, the previewed change and
the preview pane height. A remount renders that snapshot immediately and
refreshes in the background — no "加载中…" flash, no lost draft.

## Two traps this plugin already hit (do not regress)

1. **`ctx.inject(...)` does not exist on the client plugin context.** That
   context is a whitelisting proxy whose verb table is
   `effect | on | once | provide | timeout/interval/…`; every other property
   must be *declared* in the module's `inject` export. The wait form
   `ctx.inject(['sidebarRightTabs'], cb)` is rejected by the guard and kills
   the whole activation. The shipped pattern is: declare the service, then
   read it directly inside `ctx.effect(...)`.
2. **A component imported from a module that does not export it is
   `undefined`, and rendering it crashes React with "element type is
   invalid" (#130).** `IconDiffOutline16` does not exist in
   `@deepseek-ai/dsh-client-ui-primitives` (the branch glyph there is
   `IconBranchOutline16`); the mistake only surfaced in the browser console.
   `build/build.js` now audits every property the bundle reads off the
   primitives package against that package's own `export { … }` list (and
   `defineStore`'s presence in the served store bundle) and fails the build on
   a missing name.

## Extraction deltas vs upstream (dsh-better-sidebar 0.19.0)

- No sidebar store/preferences: the workspace fence is treated as always
  armed (the "open file" menu item only offers in-workspace paths).
- No session lens, no diff tab expansion, no markdown/html/pdf preview
  machinery (git diff views only).
- Session cwd resolution: session header → client summary cwd → process cwd
  (the session-persistence fallback is not carried over).
- "Open file" hands the path to the native right sidebar's built-in file
  preview (`dsh-resource://file/...`) instead of the plugin editor.
- Route prefix `/git-panel/api`; locale reduced to the zh/en keys this panel
  uses.
