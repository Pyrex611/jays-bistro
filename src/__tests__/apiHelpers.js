import { vi } from "vitest";
import { memoryDriver, setStorageForTests } from "../../api/_lib/storage.js";
import { resetAuthCacheForTests } from "../../api/_lib/auth.js";

export const PASSWORD = "bootstrap-pass-123";

export function freshEnv() {
  setStorageForTests(memoryDriver());
  resetAuthCacheForTests();
  process.env.MERCHANT_BOOTSTRAP_PASSWORD = PASSWORD;
  process.env.SESSION_SECRET = "test-session-secret-0123456789-abcdefghij";
  delete process.env.PAYSTACK_SECRET_KEY;
  process.env.PUBLIC_BASE_URL = "https://jays-bistro.vercel.app";
}

/** Invoke a handler with a fake req/res and return { status, json, headers }. */
export async function call(handler, { method = "GET", url = "/", query, body, headers = {}, ip = "1.2.3.4" } = {}) {
  const req = { method, url, query, body, headers: { host: "localhost", "x-forwarded-for": ip, ...headers }, socket: {} };
  const out = { status: 200, headers: {}, text: "" };
  const res = {
    statusCode: 200,
    headersSent: false,
    setHeader: (k, v) => { out.headers[k.toLowerCase()] = v; },
    end: (t) => { out.text = t ?? ""; },
  };
  await handler(req, res);
  out.status = res.statusCode;
  out.json = out.text ? JSON.parse(out.text) : null;
  return out;
}

export const AJAX = { "x-requested-with": "jb-portal" };

/** Sign in and return the cookie header to send on later requests. */
export async function signIn(authHandler, password = PASSWORD) {
  const r = await call(authHandler, { method: "POST", body: { password }, headers: AJAX });
  if (r.status !== 200) throw new Error(`sign-in failed: ${r.status} ${r.text}`);
  return { cookie: String(r.headers["set-cookie"]).split(";")[0] };
}

/** Route Paystack calls to a stub. `reply` receives (path, init) and returns the `data` object. */
export function stubPaystack(reply) {
  const fn = vi.fn(async (url, init) => {
    const path = String(url).replace("https://api.paystack.co", "");
    const data = reply(path, init);
    return { ok: true, status: 200, json: async () => ({ status: true, message: "ok", data }) };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
