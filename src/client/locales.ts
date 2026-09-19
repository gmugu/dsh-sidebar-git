/**
 * Minimal zh/en copy for the Git panel — the subset of dsh-better-sidebar's
 * locales.ts (upstream MIT) the extracted surface uses, plus this plugin's
 * own guide strings. The copy follows the DSH i18n system: the client apply
 * attaches the locale service (`ctx.locale`) through {@link attachLocale},
 * and `t()` resolves the active locale from it, switching live. Without an
 * attached service the browser language decides, matching upstream.
 */

/** The zh dictionary (source of truth). */
export const zh = {
  git: 'Git',
  guideDescGit: 'Git 状态、暂存与提交、分支与历史（自 better-sidebar 提取）',
  worktree: '工作树',
  refresh: '刷新',
  loading: '加载中…',
  notRepo: '当前目录不是 git 仓库',
  statusTruncated: '变更过多，仅显示前 2000 条',
  staged: '已暂存',
  unstageAll: '全部取消暂存',
  noChanges: '没有变更',
  unstaged: '未暂存',
  stageAll: '全部暂存',
  commitPlaceholder: '提交信息 (Ctrl+Enter)',
  commit: '提交',
  history: '历史',
  loadMore: '加载更多',
  historyLoadError: '加载更多历史失败',
  checkoutError: '切换分支失败',
  unstage: '取消暂存',
  stage: '暂存',
  openEditor: '打开编辑器',
  discard: '放弃更改',
  deleteFile: '删除文件',
  discardUntrackedTitle: '删除未跟踪文件',
  discardUntrackedDesc: '「{path}」还没有被 git 记录，回退将删除该文件，内容无法恢复。',
  copyRelative: '复制相对地址',
  copyAbsolute: '复制绝对地址',
  discardTitle: '放弃更改',
  discardDesc: '将丢弃「{path}」的工作区修改（不可恢复）。',
  cancel: '取消',
  viewCommitDiff: '查看提交差异',
  copyShortHash: '复制短哈希',
  copyFullHash: '复制完整哈希',
  copySubject: '复制提交信息',
  revertCommit: '还原此提交',
  cherryPickCommit: '捡取此提交',
  revertTitle: '还原此提交',
  revertDesc: '将在当前分支创建一个反转「{subject}」的新提交。',
  cherryPickTitle: '捡取此提交',
  cherryPickDesc: '将「{subject}」的更改应用到当前分支。',
  changesClosePreview: '关闭预览',
  changesError: '出错',
  copied: '已复制',
  copy: '复制',
  diffEmpty: '没有文本差异',
  diffLoadError: '加载差异失败',
  changesResizePreview: '调整预览高度',
  changesContext: '上下文',
  changesFold: '{count} 行…点击展开',
  changesFoldLoading: '展开中…',
  changesFoldUnavailable: '上下文未加载',
  diffExpand: '展开其余 {count} 行',
  diffAdded: '新增',
  diffBinary: '二进制',
  diffDeleted: '删除',
  diffRenamed: '重命名',
  timeJustNow: '刚刚',
  timeMinutesAgo: '{n} 分钟前',
  timeHoursAgo: '{n} 小时前',
  timeYesterday: '昨天',
}

/** The en dictionary, key-checked against zh. */
export const en: Record<keyof typeof zh, string> = {
  git: 'Git',
  guideDescGit: 'Git status, staging & commit, branches and history (extracted from better-sidebar)',
  worktree: 'Worktree',
  refresh: 'Refresh',
  loading: 'Loading…',
  notRepo: 'This directory is not a git repository',
  statusTruncated: 'Too many changes; showing the first 2,000 entries',
  staged: 'Staged',
  unstageAll: 'Unstage all',
  noChanges: 'No changes',
  unstaged: 'Unstaged',
  stageAll: 'Stage all',
  commitPlaceholder: 'Commit message (Ctrl+Enter)',
  commit: 'Commit',
  history: 'History',
  loadMore: 'Load more',
  historyLoadError: 'Failed to load more history',
  checkoutError: 'Branch switch failed',
  unstage: 'Unstage',
  stage: 'Stage',
  openEditor: 'Open editor',
  discard: 'Discard changes',
  deleteFile: 'Delete file',
  discardUntrackedTitle: 'Delete untracked file',
  discardUntrackedDesc: 'Git does not track "{path}" yet, so discarding it deletes the file; its contents cannot be recovered.',
  copyRelative: 'Copy relative path',
  copyAbsolute: 'Copy absolute path',
  discardTitle: 'Discard changes',
  discardDesc: 'This discards the worktree changes of "{path}" (not recoverable).',
  cancel: 'Cancel',
  viewCommitDiff: 'View commit diff',
  copyShortHash: 'Copy short hash',
  copyFullHash: 'Copy full hash',
  copySubject: 'Copy subject',
  revertCommit: 'Revert commit',
  cherryPickCommit: 'Cherry-pick commit',
  revertTitle: 'Revert commit',
  revertDesc: 'Create a new commit on the current branch that reverts "{subject}".',
  cherryPickTitle: 'Cherry-pick commit',
  cherryPickDesc: 'Apply the changes of "{subject}" to the current branch.',
  changesClosePreview: 'Close preview',
  changesError: 'error',
  copied: 'Copied',
  copy: 'Copy',
  diffEmpty: 'No text changes',
  diffLoadError: 'Failed to load diff',
  changesResizePreview: 'Resize preview',
  changesContext: 'context',
  changesFold: '{count} lines…click to expand',
  changesFoldLoading: 'Expanding…',
  changesFoldUnavailable: 'Context unavailable',
  diffExpand: 'Expand {count} more rows',
  diffAdded: 'Added',
  diffBinary: 'Binary',
  diffDeleted: 'Deleted',
  diffRenamed: 'Renamed',
  timeJustNow: 'just now',
  timeMinutesAgo: '{n} min ago',
  timeHoursAgo: '{n} h ago',
  timeYesterday: 'yesterday',
}

/** The attached DSH locale service (module-level holder, like upstream). */
let localeService: { getSnapshot(): { active: string } } | undefined

/**
 * Attach (or detach, with undefined) the DSH locale service. The panel
 * renders inside the native right-sidebar slot; the service rides this
 * module-level holder so components keep calling the plain `t()`.
 */
export function attachLocale(service: { getSnapshot(): { active: string } } | undefined): void {
  localeService = service
}

/** The active locale id: the DSH locale service's snapshot, else the browser language. */
function activeLocale(): string {
  return localeService?.getSnapshot().active
    ?? (typeof navigator !== 'undefined' ? navigator.language : '')
    ?? 'en'
}

/** Translate a copy key in the active locale (zh → zh, else en). */
export type CopyKey = keyof typeof zh

/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
export function t(key: CopyKey, params?: Record<string, string | number>): string {
  let text: string | undefined
  const dict = activeLocale().toLowerCase().startsWith('zh') ? zh : en
  text = dict[key]
  if (text === undefined) text = key
  if (params !== undefined) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}

/** Format an ISO 8601 author date relative to now (刚刚 / N 分钟前 / N 小时前 / 昨天 / date). */
export function relativeTime(iso: string): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return iso
  const seconds = Math.floor((Date.now() - then) / 1000)
  if (seconds < 60) return t('timeJustNow')
  if (seconds < 3600) return t('timeMinutesAgo', { n: Math.floor(seconds / 60) })
  if (seconds < 86400) return t('timeHoursAgo', { n: Math.floor(seconds / 3600) })
  if (seconds < 172800) return t('timeYesterday')
  const date = new Date(then)
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
