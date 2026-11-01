/** Tiny helpers shared by all API handlers. Works on Vercel Node functions and the local dev middleware. */

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export const ok = (res, body, headers) => send(res, 200, body, { "Cache-Control": "no-store", ...headers });
export const fail = (res, status, error, extra = {}) => send(res, status, { error, ...extra }, { "Cache-Control": "no-store" });

export function parseBody(req) {
  const b = req.body;
  if (b && typeof b === "object" && !Buffer.isBuffer(b)) return b;
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return {};
}

/** Returns true if the method is allowed; otherwise answers 405 and returns false. */
export function allow(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  fail(res, 405, "Method not allowed");
  return false;
}

/** CSRF defence in depth: state-changing portal calls must carry this custom header (browsers block cross-site use of it). */
export function requireAjax(req, res) {
  if (req.headers["x-requested-with"] === "jb-portal") return true;
  fail(res, 403, "Missing request header");
  return false;
}

export function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export const isHttps = (req) => (req.headers["x-forwarded-proto"] ?? "").split(",")[0] === "https";

export function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  return fwd || req.socket?.remoteAddress || "unknown";
}

/** Public origin used for links we generate (invoice URLs, Paystack callback). Prefer PUBLIC_BASE_URL. */
export function baseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] ?? "http").split(",")[0];
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:5173";
  return `${proto}://${host}`;
}

export const isProduction = () => process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
