# dsh-sidebar-git

[English](README.md) · [简体中文](README.zh.md)

Standalone Git panel tab for the DSH native right sidebar — extracted from
[dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)'s
changes-tab Git lens (MIT, upstream sources included under `src/` with
provenance notes; only the route prefix, glue, and locale subset are new).

## What it provides

- One native right-sidebar page tab (kind `git`, extension band) with a guide
  capsule (its `order` is 15, between the workspace-files and new-terminal
  capsules — a tie there would fall back to plugin activation order and let the
  capsule drift between rows), reachable from the panel's "+" add control.
- The Git lens feature set: staged/unstaged file lists with a bulk action per
  section (stage all / unstage all, plus **discard all** on the unstaged side,
  which the confirm modal itemises as tracked resets and untracked deletions),
  three inline row actions — discard (a tracked path resets to the index, an
  untracked one is deleted, both behind the confirm modal), stage (`+`) and
  unstage (`−`) — a commit box, branch switch, worktree + child-repo selectors,
  and VSCode-like history (lazy paging, ref decorations; the commit-history rows
  keep a right-click menu for view/diff/copy/revert/cherry-pick).
- The shared bottom diff pane: half the panel until it is dragged (the store
  keeps `paneHeight: null` until a real resize), staged-side fallback, untracked
  full-addition fallback, hunk-fold expansion, and a one-line notice when a
  document cannot be shown whole (a read capped at 2 MiB, or a binary file).
  A commit patch opens fully folded (its headers still carry each file's path,
  badge and ±counts); a worktree preview — always the single change that was
  clicked — opens.
- **No network, ever**: the panel runs `git` locally and reads files; it never
  fetches, pulls or pushes, and it has no remote UI. Nothing it does can touch
  a remote.
- Host routes under **`/git-panel/api/`** (own prefix; coexists with
  dsh-better-sidebar's `/sidebar/api`): `git.status/diff/stage/unstage/commit/
  branch/checkout/log/commit-diff/show/worktrees/discard/revert/cherry-pick`
  + `fs.read` (untracked fallback; text and binary reads both report the real
  `size` and a `truncated` flag). Every command runs with `-C` on the
  session's working directory; optional worktree/repo targets are validated
  against the authoritative registry. Requests pass the same loopback/Origin
  trust fence as the `/api` gateway.

## Layout

The repository root **is** the package root — these entries sit directly beside
each other:

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
node build/dry-run.mjs                             # exported face + registrations + guard-facade + route/locale parity
node build/probe/run.mjs                           # host discard + fs.read routes + diff-document model
# stage the built package into the DSH profile (pnpm cannot junction across drives):
powershell -File build/stage.ps1
```

Deployment is a **staging copy**, not a reinstall: the profile resolves this
package through a junction to `<dsh home>/profiles/<profile>/local/<package>`
(on Windows `build/stage.ps1` holds those two paths and copies `package.json` /
`cordis.patch.yml` / `lib/` / the READMEs there). The workspace copy is the
source of truth, so a **client** change needs a page refresh and a **host**
change (`src/host/`) needs a dsh restart. `plugin_manager install_bundle`
reports `ambiguous-install` once the dependency is a `link:` to that same
directory (pnpm sees no dependency change) — staging is the working path.

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
  armed.
- No session lens, no diff tab expansion, no markdown/html/pdf preview
  machinery (git diff views only).
- Session cwd resolution: session header → client summary cwd → process cwd
  (the session-persistence fallback is not carried over).
- **The file rows have no right-click menu** (upstream's offered open-editor,
  copy-path, stage and discard there): the actions a row needs are its three
  inline buttons, and opening a file was dropped with the menu — the native
  sidebar's file tab covers browsing. The commit-history rows keep theirs.
- Fixed beyond upstream: the untracked preview (upstream's pane gates the
  document on non-empty diff text and renders nothing for a new file) and the
  untracked discard (upstream's `discard` runs `git checkout --` only, which
  cannot touch a path the index does not know).
- Route prefix `/git-panel/api`; locale reduced to the zh/en keys this panel
  uses.
