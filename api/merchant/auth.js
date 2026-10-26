import { allow, clientIp, fail, ok, parseBody, requireAjax } from "../_lib/http.js";
import {
  authenticate, clearCookieHeader, clearFailures, cookieHeader, getSession, issueToken,
  recordFailure, setPassword, throttleStatus, validateNewPassword,
} from "../_lib/auth.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * /api/merchant/auth
 *   GET     → { authenticated, mustChangePassword }
 *   POST    { password }                        → sign in
 *   PUT     { currentPassword, newPassword }    → change password (signs everyone else out)
 *   DELETE  → sign out
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET", "POST", "PUT", "DELETE"])) return;

  if (req.method === "GET") {
    const s = await getSession(req);
    return ok(res, { authenticated: Boolean(s), mustChangePassword: Boolean(s?.bootstrap) });
  }

  if (!requireAjax(req, res)) return;

  if (req.method === "DELETE") return ok(res, { authenticated: false }, { "Set-Cookie": clearCookieHeader(req) });

  const body = parseBody(req);
  const ip = clientIp(req);

  if (req.method === "POST") {
    const t = await throttleStatus(ip);
    if (t.locked) return fail(res, 429, "Too many attempts. Try again later.", { retryAfter: t.retryAfter });

    await sleep(process.env.NODE_ENV === "test" ? 0 : 400); // slows guessing; negligible for the owner
    const result = await authenticate(String(body.password ?? ""));
    if (result.reason === "not_configured") return fail(res, 503, "The portal isn't set up yet (MERCHANT_BOOTSTRAP_PASSWORD is missing).");
    if (!result.ok) {
      await recordFailure(ip);
      return fail(res, 401, "That password isn't right.");
    }
    await clearFailures(ip);
    return ok(res, { authenticated: true, mustChangePassword: result.bootstrap }, { "Set-Cookie": cookieHeader(req, issueToken(result)) });
  }

  // PUT — change password (requires being signed in AND knowing the current password)
  const session = await getSession(req);
  if (!session) return fail(res, 401, "Please sign in.");
  const t = await throttleStatus(ip);
  if (t.locked) return fail(res, 429, "Too many attempts. Try again later.", { retryAfter: t.retryAfter });

  const current = await authenticate(String(body.currentPassword ?? ""));
  if (!current.ok) {
    await recordFailure(ip);
    return fail(res, 401, "Your current password isn't right.");
  }
  const problem = validateNewPassword(body.newPassword);
  if (problem) return fail(res, 400, problem);
  if (body.newPassword === body.currentPassword) return fail(res, 400, "Choose a password you haven't used.");

  const { pwv } = await setPassword(body.newPassword);
  return ok(res, { authenticated: true, mustChangePassword: false }, { "Set-Cookie": cookieHeader(req, issueToken({ pwv, bootstrap: false })) });
}
