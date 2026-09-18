import { win32 } from "node:path";
const WSL_LOCALHOST_ROOT = /^\\\\wsl\.localhost\\([^\\]+)(?:\\|$)/i;
function resolveSessionPath(cwd, target, platform = process.platform) {
  if (platform !== "win32" || !/^\/(?!\/)/.test(target)) return target;
  const normalizedCwd = cwd.replace(/\//g, "\\");
  const match = WSL_LOCALHOST_ROOT.exec(normalizedCwd);
  if (match === null) return target;
  const distroRoot = `\\\\wsl.localhost\\${match[1]}`;
  const relative = target.slice(1).replace(/\//g, "\\");
  return win32.resolve(distroRoot, relative);
}
export {
  resolveSessionPath
};
