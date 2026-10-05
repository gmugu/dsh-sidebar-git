# AGENTS.md — 本项目对 Agent 的要求

## 0. 项目事实

- **是什么**：`dsh-sidebar-git` —— 从 `dsh-better-sidebar` 0.19.0 的「文件变动 → Git」视图提取出的独立 DSH 插件（上游 MIT，逐字源码保留在 `src/` 并注明出处）。
- **形态**：DSH bundle，原生右侧栏页面型 tab（kind `git`，extension 档 + 引导胶囊）；Host 路由前缀 `/git-panel/api`。
- **仓库根 = 包根**：`D:\ws\dsh-sidebar-git`。
- **`lib/` 是构建产物，随源码一起入库，两者必须同步**（提交前见 §2.6）。
- **安装位置**：`C:\Users\admin\.dsh\profiles\web\local\dsh-sidebar-git`（由 profile 的 `node_modules` junction 指过去）；workspace 是源码真源。
- **构建工具**：esbuild（客户端打包 + host 去类型），无 TS 类型检查步骤。

## 1. 变更与验收流程（每次改动都走完）

1. 只改 `src/`（`src/host/`、`src/client/`）与 `build/`；**不要手工改 `lib/`**。
2. `node build/build.js` —— 构建即跑**外部符号导出审计**（primitives 的 `export {}` 清单 + `defineStore` 存在性）。审计失败视为构建失败，必须修掉。
3. `node build/dry-run.mjs` —— 断言导出面（`inject`/`apply`）、tab 类型与槽位注册、store 声明与各 action、以及 apply 能通过 runner 的“声明服务守卫门面”。
4. `.\build\stage.ps1` —— 把 `package.json` / `cordis.patch.yml` / `lib/` / `README.md` 同步到 profile 的 staging 目录（跨盘 junction 不可用，必须走 staging）。
5. `plugin_manager` 重新安装（`target` 用 staging 路径）。**替换已安装包需要重启 dsh 才有新的客户端模块代际**；安装后如实报告 `applied` / `restart-required`。
6. **提交前可复现性检查**：重跑 `node build/build.js` 后 `git diff` 必须为空 —— 证明入库的 `lib/` 与当前源码严格对应。


## 2. 已知陷阱（本项目踩过，别重犯）

- **客户端 ctx 是白名单代理，动词表里没有 `inject`**：`ctx.inject([...], cb)` 会被守卫直接拒绝并杀死整个激活。正确写法是「在模块 `inject` 导出里声明服务 → `ctx.effect` 内**直接访问** `ctx.sidebarRightTabs`」。
- **导入模块未导出的符号 = `undefined`**，渲染它会让 React 抛 “element type is invalid”（#130，只在浏览器 console 可见）。构建审计就是为此存在；加新图标/组件前先确认它在 primitives 的导出清单里。
- **dock 只渲染活动 tab 的 body**（`renderTab(pane.activeTabId)`）：切走即卸载。跨 tab 存活的状态必须放进注册声明的 store（`store: createGitStore()`，`defineStore`，框架按 session 铸实例，组件经 `useStore`/`actions` 读写），且“已应用的 scope”也要存在 store 里，否则重挂载会清掉选择并产生空-填闪烁。
- **UI 文案走 locale**（`src/client/locales.ts`，zh/en 两份 key 必须对齐）；颜色继承主题 token。
- **写文件用 read/edit/write 工具，不要用 shell 重定向**（`Set-Content` 会带 UTF-8 BOM，`package.json` 带 BOM 会让 `JSON.parse` 直接失败）。
- staging 目录在 D 盘之外，写入需要相应权限；不要试图把 workspace 直接 link 进 profile（pnpm 会生成损坏的跨盘 junction）。

## 3. 提交流程速查

```
# 门禁
node build/build.js && node build/dry-run.mjs
git diff --name-only            # 期待为空（可复现）
# 提交（仅在用户明确要求时）
git commit -m 'type(scope): subject' -m '正文…'
```
