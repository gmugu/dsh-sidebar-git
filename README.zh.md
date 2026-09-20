# dsh-sidebar-git

[English](README.md) · [简体中文](README.zh.md)

DSH 原生右侧边栏里的独立 Git 面板标签页 —— 从
[dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 的
「文件变动 → Git」视图提取而来（MIT；上游源码连同出处说明保留在 `src/` 下，
新增的只有路由前缀、胶水代码与精简后的文案子集）。

## 提供什么

- 一个原生右侧边栏的页面型标签页（kind 为 `git`，extension 档），带引导胶囊
  （其 `order` 为 15，正好排在工作区文件与新建终端之间 —— 撞号会退化成按插件
  激活顺序排序，让胶囊在行与行之间漂移），可从面板的「+」添加入口打开。
- Git 视图的完整能力：已暂存/未暂存文件列表，每个分区各有一个批量操作
  （全部暂存 / 全部取消暂存，未暂存侧还有**全部回退**，确认弹窗会分别列出
  「已跟踪将被重置」与「未跟踪将被删除」的数量）；行内三个动作 —— 回退
  （已跟踪文件回到索引版本，未跟踪文件被删除，都先过确认弹窗）、暂存（`+`）、
  取消暂存（`−`）；提交框、分支切换、工作树与子仓库选择器；以及类 VSCode 的
  历史（懒加载分页、引用装饰；历史行保留右键菜单：查看差异 / 复制哈希 /
  还原 / 捡取）。
- 底部共享差异预览区：默认占面板一半（store 里 `paneHeight` 保持 `null`，
  直到真正拖动过），带「另一侧兜底」、未跟踪文件的整文件新增回退、上下文折叠
  展开；当文档无法完整呈现时显示一行提示（读取被截到 2 MiB，或二进制文件）。
  **提交补丁默认全部折叠**（文件头仍带路径、徽标与 ±行数），而工作区预览
  —— 永远是你点的那一个改动 —— 直接展开。
- **零网络**：面板只在本地运行 `git`、读取文件；它不做 fetch / pull / push，
  也没有任何远端界面。它的任何操作都碰不到远端。
- Host 路由挂在 **`/git-panel/api/`** 前缀下（与 dsh-better-sidebar 的
  `/sidebar/api` 并存）：`git.status/diff/stage/unstage/commit/branch/checkout/
  log/commit-diff/show/worktrees/discard/revert/cherry-pick`，外加 `fs.read`
  （未跟踪文件的读取回退；文本与二进制读取都会返回真实 `size` 与 `truncated`）。
  每条命令都以 `-C` 在会话的工作目录下执行；可选的工作树/仓库目标会先与权威
  注册表校验。请求要过与 `/api` 网关相同的 loopback/Origin 信任围栏。

## 目录结构

**仓库根目录本身就是包根**，以下条目彼此平级：

- `src/host/` —— `git.ts` / `trust-fence.ts` / `wire.ts` / `session-path.ts`
  （逐字上游，构建时去类型）+ `index.js`（新增胶水）。
- `src/client/` —— `GitPanel.tsx`（上游 GitLens，sidebar store 依赖换成了
  永远武装的工作区围栏）、`GitDiffPane.tsx`（上游 DiffPane，只保留 git 分支）、
  `diff/` 栈（逐字）、文案子集（zh/en）、`index.tsx`（新增：原生标签页注册）。
- `build/build.js` —— esbuild：给 host 模块去类型；把 TSX 客户端打成 DSH 的
  `window.__ModuleLoader__` 包装（react/primitives 走 external）；把
  `*.module.css` 编译成「注入 style + className 映射」。
- `build/probe/` —— 行为级探针（见下），直接驱动**构建产物**而非源码。

## 开发与迭代

```
node build/build.js                                # 重新构建 lib/（同时跑导出审计）
node build/dry-run.mjs                             # 导出面 + 注册 + 守卫门面 + 路由/文案键一致性
node build/probe/run.mjs                           # host 的 discard / fs.read 路由与差异文档模型
# 把构建产物同步进 DSH profile（pnpm 无法跨盘 junction）：
powershell -File build/stage.ps1
```

部署靠的是**同步 staging 副本**，不是重装：profile 通过 junction 指向
`<dsh 主目录>/profiles/<profile>/local/<包名>`（Windows 下这两个路径写在
`build/stage.ps1` 顶部，脚本会把 `package.json` / `cordis.patch.yml` / `lib/`
与两份 README 复制过去）。**工作区才是真源**，因此**客户端**改动刷新页面即可，
**host**（`src/host/`）改动需要重启 dsh。当依赖是指向同一目录的 `link:` 时，
`plugin_manager install_bundle` 会报 `ambiguous-install`（pnpm 看不到依赖变化）
—— 可用路径是同步 staging。

## 面板状态放在注册声明的 store 里

dock 只渲染**活动标签页的 body**（前端 `renderTab(pane.activeTabId)`），所以切到
别的标签页会卸载本面板，里面每个 `useState` 都会被丢弃。因此 body 声明了一个
store（注册项里的 `store: createGitStore()`，来自
`@deepseek-ai/dsh-client-store` 的 `defineStore({ init, actions })`），由框架
**按会话**铸造，并以 `useStore`/`actions` 交给组件。切标签页后仍存活的有：检出
视图（status、工作树、分支名、历史）、工作树/仓库选择、提交信息草稿、正在预览
的改动、预览区高度。重新挂载时立刻渲染这份快照并在后台刷新 —— 没有「加载中…」
闪烁，也不会丢草稿。

## 已经踩过的两个坑（不要再犯）

1. **客户端插件上下文里没有 `ctx.inject(...)`。** 那是个白名单代理，动词表是
   `effect | on | once | provide | timeout/interval/…`；其它属性必须在模块的
   `inject` 导出里**声明**。等待式写法 `ctx.inject(['sidebarRightTabs'], cb)`
   会被守卫直接拒绝并杀死整个激活。正确写法是：先声明服务，再在
   `ctx.effect(...)` 里**直接读取**。
2. **从没有导出该符号的模块里导入组件 = `undefined`，渲染它会让 React 抛
   "element type is invalid"（#130）。** `IconDiffOutline16` 在
   `@deepseek-ai/dsh-client-ui-primitives` 里并不存在（那里的分支图标是
   `IconBranchOutline16`），而这个错误只在浏览器 console 里可见。
   `build/build.js` 现在会把 bundle 从 primitives 包里读到的每个属性与该包自己的
   `export { … }` 清单核对（也核对 store bundle 里 `defineStore` 是否存在），
   缺名即构建失败。

## 与上游的差异（dsh-better-sidebar 0.19.0）

- 不含 sidebar store/偏好设置：工作区围栏视为**永远武装**。
- 不含 session lens、不含 diff 标签页展开、不含 markdown/html/pdf 预览机制
  （只保留 git 差异视图）。
- 会话 cwd 解析：会话 header → 客户端摘要 cwd → 进程 cwd（不带上游的
  session-persistence 兜底）。
- **文件行没有右键菜单**（上游在那儿放了「打开编辑器 / 复制路径 / 暂存 / 回退」）：
  行需要的动作就是它的三个行内按钮，而「打开编辑器」随菜单一起去掉 —— 浏览文件
  由原生侧边栏的文件标签页承担。历史行保留右键菜单。
- **两处做到比上游更好**：未跟踪文件的预览（上游 pane 用「差异文本非空」当渲染
  门，新文件因此什么都画不出来）；未跟踪文件的回退（上游 `discard` 只会
  `git checkout --`，对索引里没有的路径无能为力）。
- 路由前缀 `/git-panel/api`；文案精简为本面板实际用到的 zh/en 键。

## 许可

MIT —— 见 [LICENSE](LICENSE)。部分代码来自
[dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)（MIT），
其版权声明一并附在该文件末尾。