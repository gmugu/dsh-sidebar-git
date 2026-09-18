class SidebarError extends Error {
  constructor(code, message, status = 400, meta) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
  code;
  status;
  meta;
}
const MAX_BODY_BYTES = 1 << 20;
async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      throw new SidebarError("bad-request", "request body too large");
    }
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new SidebarError("bad-request", "request body is not valid JSON");
  }
}
function writeJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(payload);
}
function writeOk(res, value) {
  writeJson(res, 200, { ok: true, value });
}
function writeError(res, error) {
  if (error instanceof SidebarError) {
    writeJson(res, error.status, { ok: false, error: { code: error.code, message: error.message } });
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  writeJson(res, 500, { ok: false, error: { code: "internal", message } });
}
function requireString(payload, key) {
  const record = payload;
  const value = record?.[key];
  if (typeof value !== "string" || value === "") {
    throw new SidebarError("bad-request", `missing or invalid "${key}"`);
  }
  return value;
}
export {
  SidebarError,
  readJsonBody,
  requireString,
  writeError,
  writeJson,
  writeOk
};
