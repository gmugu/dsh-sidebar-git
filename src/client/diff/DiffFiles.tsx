/**
 * A full unified-diff document (one changed file, or every file of a commit
 * patch): collapsible per-file headers. A worktree preview — always the single
 * change its row was clicked for — opens that file; a commit patch starts fully
 * folded, so reading history means picking the files to unfold instead of
 * scrolling a wall of diffs. Each expanded file renders through the shared
 * {@link DiffRows} (so git diffs get the same rewrite tinting, intra-line
 * highlights, syntax colors and hunk folds as session-op diffs). Untracked
 * files produce no `git diff` output; the caller passes their content to
 * render as a full-file addition instead.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { t } from '../locales.ts'
import { diffStats, displayPath, parseUnifiedDiff, unifiedSegments, untrackedFile, type DiffFile, type DiffRow, type FoldSegment, type ParsedDiff } from './rows.ts'
import { langOfPath } from './highlight.ts'
import { DiffRows } from './DiffRows.tsx'
import css from './diff.module.css'

/** Whether a file block has rows to reveal (a binary file, or one git emitted
 *  no hunks for, has nothing to expand into). */
function expandable(file: DiffFile): boolean {
  return !file.binary && file.hunks.length > 0
}

/**
 * The file blocks a diff document opens with. A worktree preview is one file —
 * the change the row was clicked for — so it opens, and a lone folded block
 * would only add a click. A document the caller asked to start folded (a commit
 * patch, whatever its file count) opens nothing: its headers still carry each
 * file's path, badge and line counts, and unfolding one is a click.
 */
function defaultExpandedFiles(files: readonly DiffFile[], startFolded: boolean): Set<number> {
  if (startFolded) return new Set()
  const only = files.length === 1 ? files[0] : undefined
  return only !== undefined && expandable(only) ? new Set([0]) : new Set()
}

/** The file header badge: added / deleted / renamed / binary ('' for a plain edit). */
function fileTag(file: DiffFile): string | null {
  if (file.binary) return t('diffBinary')
  if (file.oldPath === '/dev/null') return t('diffAdded')
  if (file.newPath === '/dev/null') return t('diffDeleted')
  const oldPath = displayPath(file.oldPath)
  const newPath = displayPath(file.newPath)
  if (oldPath !== newPath) return t('diffRenamed')
  return null
}

export interface DiffFilesProps {
  /** Unified diff text (`git.diff` or `git.commit-diff` payloads). */
  diff: string
  /** Untracked-file content: when present, renders as a full-file addition instead of parsing. */
  untrackedPath?: string
  untrackedContent?: string
  /** Start every file folded (a commit patch): its headers still name each
   *  file, and the reader unfolds what to read. */
  startFolded?: boolean
  /** An already-parsed document. The pane parses a patch once for its own
   *  header stats and hands the result here, so the text is not parsed twice;
   *  absent (a standalone caller), `diff` is parsed here as before. */
  parsedFiles?: readonly DiffFile[]
  /** Fetch a git gap fold's hidden rows on demand (both sides' contents by
   *  the fold's line ranges); forwarded to every file's DiffRows. Absent
   *  folds without `rows` stay non-expandable (session-op diffs and
   *  untracked additions always carry theirs). */
  resolveFold?: (file: DiffFile, segment: FoldSegment) => Promise<readonly DiffRow[]>
}

export function DiffFiles({ diff, untrackedPath, untrackedContent, startFolded = false, parsedFiles, resolveFold }: DiffFilesProps) {
  const parsed = useMemo<ParsedDiff>(() => {
    if (parsedFiles !== undefined) return { files: [...parsedFiles] }
    if (untrackedPath !== undefined) {
      return { files: [untrackedFile(untrackedPath, untrackedContent ?? '')] }
    }
    return parseUnifiedDiff(diff)
  }, [parsedFiles, diff, untrackedPath, untrackedContent])
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(() => defaultExpandedFiles(parsed.files, startFolded))
  useEffect(() => { setExpandedFiles(defaultExpandedFiles(parsed.files, startFolded)) }, [parsed, startFolded])

  // One in-flight/resolved promise per file+fold key, so a fold re-clicked
  // after a remount (file header collapsed and re-expanded) resolves without
  // a second fetch and concurrent clicks join the same request. The cache
  // dies with `parsed` (a new diff text); rejected promises are dropped so a
  // later retry can go through.
  const foldCache = useRef(new Map<string, Promise<readonly DiffRow[]>>())
  useEffect(() => { foldCache.current = new Map() }, [parsed])
  const loadFold = (file: DiffFile, segment: FoldSegment): Promise<readonly DiffRow[]> => {
    if (resolveFold === undefined) return Promise.resolve([])
    const path = displayPath(file.newPath === '/dev/null' ? file.oldPath : file.newPath)
    const key = `${path}|${String(segment.oldStart)}|${String(segment.newStart)}`
    let promise = foldCache.current.get(key)
    if (promise === undefined) {
      promise = resolveFold(file, segment)
      foldCache.current.set(key, promise)
      promise.catch(() => { foldCache.current.delete(key) })
    }
    return promise
  }

  // Segments and header stats computed once per file.
  const files = useMemo(
    () => parsed.files.map((file) => {
      const segments = unifiedSegments(file)
      return { file, segments, stats: diffStats(segments) }
    }),
    [parsed],
  )

  const renderFile = (entry: (typeof files)[number], fileIndex: number): ReactNode => {
    const { file, segments, stats } = entry
    const tag = fileTag(file)
    const from = displayPath(file.oldPath)
    const to = displayPath(file.newPath)
    const canExpand = expandable(file)
    const fileExpanded = expandedFiles.has(fileIndex)
    return (
      <div key={`file-${String(fileIndex)}`} className={css.fileBlock}>
        <button
          type="button"
          className={css.file}
          disabled={!canExpand}
          aria-expanded={canExpand ? fileExpanded : undefined}
          onClick={() => {
            setExpandedFiles(current => {
              const next = new Set(current)
              if (next.has(fileIndex)) next.delete(fileIndex)
              else next.add(fileIndex)
              return next
            })
          }}
        >
          {canExpand && <span aria-hidden="true" className={clsx(css.fileChevron, fileExpanded && css.fileChevronExpanded)}>›</span>}
          <span className={css.filePath}>{to}</span>
          {from !== to && <span className={css.fileOld}>← {from}</span>}
          {tag !== null && <span className={css.fileTag}>{tag}</span>}
          {canExpand && (stats.added > 0 || stats.deleted > 0) && (
            <span className={css.fileStats}>
              {stats.added > 0 && <span className={css.statAdd}>+{String(stats.added)}</span>}
              {stats.deleted > 0 && <span className={css.statDel}>−{String(stats.deleted)}</span>}
            </span>
          )}
        </button>
        {canExpand && fileExpanded && (
          <DiffRows segments={segments} lang={langOfPath(to)} resolveFold={resolveFold !== undefined ? (segment) => loadFold(file, segment) : undefined} />
        )}
      </div>
    )
  }

  if (parsed.files.length === 0) return null
  return (
    <div className={css.files}>
      {files.map(renderFile)}
    </div>
  )
}
