import crypto from "node:crypto";
import { promisify } from "node:util";
import { getStorage } from "./storage.js";
import { fail, isHttps, isProduction, parseCookies } from "./http.js";

/**
 * Merchant password lock — no auth provider, no user accounts.
 *
 *   • The password is never stored in plain text. A scrypt hash lives in a PRIVATE storage object (config/merchant.json).
 *   • Login happens on the server: it reads that object, compares in constant time, and answers with a signed,
 *     HttpOnly, SameSite=Strict cookie. The browser never sees the hash and cannot "check" anything itself.
 *   • Until the merchant sets their own password, the one in env MERCHANT_BOOTSTRAP_PASSWORD works and the portal
 *     forces a change on first login. Changing the password signs everyone else out (the session carries a hash fingerprint).
 *   • Brute force: 5 failures per IP per 15 minutes, plus a fixed delay on every attempt.
 */

const scrypt = promisify(crypto.scrypt);
const RECORD_KEY = "config/merchant.json";
export const COOKIE = "jb_merchant";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;

const digest = (s) => crypto.createHash("sha256").update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));
const b64url = (buf) => Buffer.from(buf).toString("base64url");

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const params = { N: 16384, r: 8, p: 1 };
  const hash = await scrypt(password, salt, 32, params);
  return { algo: "scrypt", ...params, salt: salt.toString("base64"), hash: hash.toString("base64") };
}

export async function verifyPassword(password, rec) {
  const hash = await scrypt(password, Buffer.from(rec.salt, "base64"), 32, { N: rec.N, r: rec.r, p: rec.p });
  const expected = Buffer.from(rec.hash, "base64");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

let recordCache = { at: 0, value: null };
async function loadRecord(force = false) {
  if (!force && Date.now() - recordCache.at < 15_000) return recordCache.value;
  const value = await getStorage().getJSON(RECORD_KEY);
  recordCache = { at: Date.now(), value };
  return value;
}
export const resetAuthCacheForTests = () => (recordCache = { at: 0, value: null });

const fingerprint = (rec) => (rec ? digest(rec.hash).toString("hex").slice(0, 16) : "bootstrap");

/** @returns {Promise<{ok:boolean, bootstrap?:boolean, pwv?:string, reason?:string}>} */
export async function authenticate(password) {
  const rec = await loadRecord();
  if (rec) return (await verifyPassword(password, rec)) ? { ok: true, bootstrap: false, pwv: fingerprint(rec) } : { ok: false };
  const bootstrap = process.env.MERCHANT_BOOTSTRAP_PASSWORD;
  if (!bootstrap) return { ok: false, reason: "not_configured" };
  return safeEqual(password, bootstrap) ? { ok: true, bootstrap: true, pwv: "bootstrap" } : { ok: false };
}

export async function setPassword(newPassword) {
  const rec = { ...(await hashPassword(newPassword)), updatedAt: new Date().toISOString() };
  await getStorage().putJSON(RECORD_KEY, rec);
  recordCache = { at: Date.now(), value: rec };
  return { pwv: fingerprint(rec) };
}

export function validateNewPassword(pw) {
  if (typeof pw !== "string" || pw.length < 10) return "Use at least 10 characters.";
  if (pw.length > 128) return "That password is too long.";
  if (/^(.)\1+$/.test(pw)) return "Choose something less repetitive.";
  return null;
}

// ── sessions ────────────────────────────────────────────────
function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction()) throw new Error("SESSION_SECRET must be set (32+ random characters).");
  return "dev-only-session-secret-change-me-0123456789";
}
const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest();

export function issueToken({ pwv, bootstrap }, now = Date.now()) {
  const payload = b64url(JSON.stringify({ exp: now + SESSION_TTL_MS, pwv, bootstrap: Boolean(bootstrap) }));
  return `${payload}.${b64url(sign(payload))}`;
}

export function readToken(token, now = Date.now()) {
  const [payload, mac] = String(token ?? "").split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > now ? data : null;
  } catch {
    return null;
  }
}

export function cookieHeader(req, token, maxAgeSec = SESSION_TTL_MS / 1000) {
  const parts = [`${COOKIE}=${token}`, "Path=/api", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSec}`];
  if (isHttps(req) || isProduction()) parts.push("Secure");
  return parts.join("; ");
}
export const clearCookieHeader = (req) => cookieHeader(req, "", 0);

/** Returns the session payload, or null. Also rejects sessions issued before the last password change. */
export async function getSession(req) {
  const data = readToken(parseCookies(req)[COOKIE]);
  if (!data) return null;
  const rec = await loadRecord();
  if (data.pwv !== fingerprint(rec)) return null;
  if (!rec && !process.env.MERCHANT_BOOTSTRAP_PASSWORD) return null;
  return data;
}

/** Use at the top of every protected handler. Sends 401 and returns null when not signed in. */
export async function requireMerchant(req, res) {
  const session = await getSession(req);
  if (!session) {
    fail(res, 401, "Please sign in.");
    return null;
  }
  return session;
}

// ── brute-force throttle ─────────────────────────────────────
const attemptKey = (ip) => `config/attempts/${digest(ip).toString("hex").slice(0, 32)}.json`;

export async function throttleStatus(ip, now = Date.now()) {
  const rec = (await getStorage().getJSON(attemptKey(ip))) ?? { fails: [] };
  const fails = rec.fails.filter((t) => now - t < WINDOW_MS);
  const locked = fails.length >= MAX_FAILS;
  return { locked, retryAfter: locked ? Math.ceil((fails[0] + WINDOW_MS - now) / 1000) : 0, fails };
}
export async function recordFailure(ip, now = Date.now()) {
  const { fails } = await throttleStatus(ip, now);
  await getStorage().putJSON(attemptKey(ip), { fails: [...fails, now] });
}
export const clearFailures = (ip) => getStorage().remove(attemptKey(ip));
