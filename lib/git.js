import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
class GitCommandError extends Error {
  constructor(message, code = "git-error", command) {
    super(message);
    this.code = code;
    this.command = command;
  }
  code;
  command;
}
function parsePorcelainZ(output) {
  const tokens = output.split("\0");
  const entries = [];
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    index += 1;
    if (token === "") continue;
    const xy = token.slice(0, 2);
    const rest = token.slice(3);
    entries.push({ path: rest, xy });
    if ((xy[0] === "R" || xy[0] === "C") && tokens[index] !== void 0 && tokens[index] !== "") {
      index += 1;
    }
  }
  return entries;
}
function parseWorktreeList(output) {
  const rows = [];
  let path;
  let branch = "HEAD";
  let locked = false;
  let prunable = false;
  const flush = () => {
    if (path !== void 0) rows.push({ path, branch, locked, prunable });
    path = void 0;
    branch = "HEAD";
    locked = false;
    prunable = false;
  };
  const sep = output.includes("\0") ? "\0" : "\n";
  const framed = output.endsWith(sep) ? output : `${output}${sep}`;
  for (const line of framed.split(sep)) {
    if (line === "") {
      flush();
    } else if (line.startsWith("worktree ")) {
      path = line.slice("worktree ".length);
    } else if (line.startsWith("branch refs/heads/")) {
      branch = line.slice("branch refs/heads/".length);
    } else if (line === "locked" || line.startsWith("locked ")) {
      locked = true;
    } else if (line === "prunable" || line.startsWith("prunable ")) {
      prunable = true;
    }
  }
  return rows;
}
function parseLogLines(output) {
  const rows = [];
  for (const line of output.split("\n")) {
    if (line === "") continue;
    const [hash, subject, author, date, hashFull, refs] = line.split("");
    if (hash === void 0 || subject === void 0) continue;
    rows.push({
      hash,
      subject,
      author: author ?? "",
      date: date ?? "",
      hashFull: hashFull ?? hash,
      refs: refs ?? ""
    });
  }
  return rows;
}
function runGit(cwd, args, timeoutMs = 3e4) {
  const full = ["-C", cwd, "--no-pager", "-c", "color.ui=false", ...args];
  return new Promise((resolvePromise, reject) => {
    const child = spawn("git", full, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" }
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new GitCommandError(`git ${args[0] ?? ""} timed out after ${timeoutMs}ms`, "git-error", args.join(" ")));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new GitCommandError(`cannot run git: ${error.message}`, "git-error", args.join(" ")));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolvePromise(stdout);
      } else {
        reject(new GitCommandError(stderr.trim() || `git exited with ${String(code)}`, "git-error", args.join(" ")));
      }
    });
  });
}
const DISCOVERY_LIMIT = 200;
const DISCOVERY_TIMEOUT_MS = 5e3;
const DISCOVERY_CACHE_TTL_MS = 6e4;
const repoRootsCache = /* @__PURE__ */ new Map();
const repoRootsInFlight = /* @__PURE__ */ new Map();
async function isGitRepo(cwd) {
  try {
    const out = await runGit(cwd, ["rev-parse", "--is-inside-work-tree"], DISCOVERY_TIMEOUT_MS);
    return out.trim() === "true";
  } catch {
    return false;
  }
}
async function directRepoRoot(cwd) {
  const out = await runGit(cwd, ["rev-parse", "--show-toplevel"], DISCOVERY_TIMEOUT_MS);
  return out.trim();
}
function repoRoots(cwd) {
  const cached = repoRootsCache.get(cwd);
  if (cached !== void 0 && cached.expires > Date.now()) return Promise.resolve(cached.roots);
  const pending = repoRootsInFlight.get(cwd);
  if (pending !== void 0) return pending;
  const promise = discoverRepoRoots(cwd).then(
    (roots) => {
      repoRootsCache.set(cwd, { roots, expires: Date.now() + DISCOVERY_CACHE_TTL_MS });
      repoRootsInFlight.delete(cwd);
      return roots;
    },
    (error) => {
      repoRootsInFlight.delete(cwd);
      throw error;
    }
  );
  repoRootsInFlight.set(cwd, promise);
  return promise;
}
async function discoverRepoRoots(cwd) {
  try {
    return [await directRepoRoot(cwd)];
  } catch {
    const entries = await readdir(cwd, { withFileTypes: true }).catch(() => []);
    const roots = [];
    for (const entry of entries.filter((entry2) => entry2.isDirectory() && !entry2.name.startsWith(".") && entry2.name !== "node_modules").sort((left, right) => left.name.localeCompare(right.name)).slice(0, DISCOVERY_LIMIT)) {
      try {
        const root = await directRepoRoot(join(cwd, entry.name));
        if (!roots.some((existing) => pathIdentity(existing) === pathIdentity(root))) roots.push(root);
      } catch {
      }
    }
    return roots;
  }
}
async function repoRoot(cwd, selected) {
  const roots = await repoRoots(cwd);
  if (roots.length === 0) throw new GitCommandError("not a git repository", "not-repo", "rev-parse");
  if (selected !== void 0) {
    const identity = pathIdentity(selected);
    const match = roots.find((root) => pathIdentity(root) === identity);
    if (match !== void 0) return match;
  }
  return roots[0];
}
async function currentBranch(cwd) {
  const out = await runGit(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
  return out.trim();
}
const GIT_STATUS_LIMIT = 2e3;
async function status(cwd, selected) {
  const repositories = await repoRoots(cwd);
  if (repositories.length === 0) return { isRepo: false, entries: [], repositories: [] };
  const root = await repoRoot(cwd, selected);
  const [branch, raw] = await Promise.all([
    currentBranch(root).catch(() => "HEAD"),
    runGit(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])
  ]);
  const parsed = parsePorcelainZ(raw);
  const truncated = parsed.length > GIT_STATUS_LIMIT;
  return {
    isRepo: true,
    branch,
    entries: truncated ? parsed.slice(0, GIT_STATUS_LIMIT) : parsed,
    truncated,
    root,
    repositories
  };
}
function pathIdentity(path) {
  const absolute = resolve(path).replace(/[\\/]+$/, "");
  return process.platform === "win32" ? absolute.toLowerCase() : absolute;
}
let worktreeListSupportsZ;
async function listedWorktrees(cwd) {
  let raw;
  if (worktreeListSupportsZ === false) {
    raw = await runGit(cwd, ["worktree", "list", "--porcelain"]);
  } else {
    try {
      raw = await runGit(cwd, ["worktree", "list", "--porcelain", "-z"]);
      worktreeListSupportsZ = true;
    } catch {
      worktreeListSupportsZ = false;
      raw = await runGit(cwd, ["worktree", "list", "--porcelain"]);
    }
  }
  return parseWorktreeList(raw).filter((entry) => !entry.prunable);
}
async function worktrees(cwd) {
  if (!await isGitRepo(cwd)) return [];
  const currentRoot = await repoRoot(cwd);
  const listed = await listedWorktrees(cwd);
  const rows = await Promise.all(listed.map(async (entry) => ({
    path: entry.path,
    branch: entry.branch,
    current: pathIdentity(entry.path) === pathIdentity(currentRoot),
    // One stale/permission-raced linked checkout must not hide the valid
    // current repository from the panel. Targeted operations still fail loud.
    changes: await status(entry.path).then((result) => result.entries.length, () => 0)
  })));
  return rows.sort((left, right) => Number(right.current) - Number(left.current));
}
async function resolveWorktree(cwd, requested) {
  if (requested === void 0 || requested === "") return cwd;
  const identity = pathIdentity(requested);
  const match = (await listedWorktrees(cwd)).find((entry) => pathIdentity(entry.path) === identity);
  if (match === void 0) {
    throw new GitCommandError(`unknown linked worktree: ${requested}`, "git-worktree", "worktree list");
  }
  return match.path;
}
async function diff(cwd, path, staged, selected) {
  const root = await repoRoot(cwd, selected);
  const args = ["diff", "--no-ext-diff", "--no-color", "-U3"];
  if (staged) args.push("--cached");
  if (path !== void 0) args.push("--", path);
  return runGit(root, args);
}
async function stage(cwd, path, selected) {
  await runGit(await repoRoot(cwd, selected), ["add", "-A", ...path !== void 0 ? ["--", path] : []]);
}
async function unstage(cwd, path, selected) {
  await runGit(await repoRoot(cwd, selected), ["reset", "-q", ...path !== void 0 ? ["--", path] : []]);
}
async function commit(cwd, message, selected) {
  await runGit(await repoRoot(cwd, selected), ["commit", "-m", message]);
}
async function branches(cwd, selected) {
  const root = await repoRoot(cwd, selected);
  const [current, raw] = await Promise.all([
    currentBranch(root).catch(() => "HEAD"),
    runGit(root, ["for-each-ref", "--format=%(refname:short)", "refs/heads"])
  ]);
  const names = raw.split("\n").filter((line) => line !== "");
  return { current, names: names.includes(current) ? names : [current, ...names] };
}
async function checkout(cwd, branch, selected) {
  await runGit(await repoRoot(cwd, selected), ["checkout", branch]);
}
async function log(cwd, count = 30, skip = 0, selected) {
  const raw = await runGit(await repoRoot(cwd, selected), [
    "log",
    "-n",
    String(count),
    "--skip",
    String(skip),
    "--decorate=short",
    "--pretty=format:%h%x1f%s%x1f%an%x1f%ai%x1f%H%x1f%D"
  ]);
  return parseLogLines(raw);
}
async function show(cwd, rev, path, selected) {
  try {
    return await runGit(await repoRoot(cwd, selected), ["show", `${rev}:${path}`]);
  } catch {
    return null;
  }
}
async function commitDiff(cwd, hash, selected) {
  return runGit(await repoRoot(cwd, selected), ["show", "--no-ext-diff", "--no-color", "--format=", "-m", "--first-parent", hash]);
}
async function indexed(cwd, path) {
  return (await runGit(cwd, ["ls-files", "-z", "--", path])).length > 0;
}
async function discard(cwd, path, selected) {
  const root = await repoRoot(cwd, selected);
  if (await indexed(root, path)) {
    await runGit(root, ["checkout", "--", path]);
    return;
  }
  await runGit(root, ["clean", "-f", "-d", "--", path]);
}
async function revert(cwd, hash, selected) {
  await runGit(await repoRoot(cwd, selected), ["revert", "--no-edit", hash]);
}
async function cherryPick(cwd, hash, selected) {
  await runGit(await repoRoot(cwd, selected), ["cherry-pick", hash]);
}
export {
  GitCommandError,
  branches,
  checkout,
  cherryPick,
  commit,
  commitDiff,
  currentBranch,
  diff,
  discard,
  isGitRepo,
  log,
  parseLogLines,
  parsePorcelainZ,
  parseWorktreeList,
  repoRoot,
  repoRoots,
  resolveWorktree,
  revert,
  show,
  stage,
  status,
  unstage,
  worktrees
};
