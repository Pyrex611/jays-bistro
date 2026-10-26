import { beforeEach, describe, expect, it } from "vitest";
import auth from "../../api/merchant/auth.js";
import menuAdmin from "../../api/merchant/menu.js";
import { AJAX, PASSWORD, call, freshEnv, signIn } from "./apiHelpers.js";
import { issueToken, readToken } from "../../api/_lib/auth.js";

beforeEach(freshEnv);

describe("merchant password lock", () => {
  it("rejects a wrong password and accepts the bootstrap one", async () => {
    const bad = await call(auth, { method: "POST", body: { password: "nope" }, headers: AJAX });
    expect(bad.status).toBe(401);
    expect(bad.headers["set-cookie"]).toBeUndefined();

    const good = await call(auth, { method: "POST", body: { password: PASSWORD }, headers: AJAX });
    expect(good.status).toBe(200);
    expect(good.json).toEqual({ authenticated: true, mustChangePassword: true });
    const cookie = String(good.headers["set-cookie"]);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/api");
  });

  it("requires the custom header on state-changing calls (CSRF defence)", async () => {
    const r = await call(auth, { method: "POST", body: { password: PASSWORD } });
    expect(r.status).toBe(403);
  });

  it("is not configured without a bootstrap password and no stored hash", async () => {
    delete process.env.MERCHANT_BOOTSTRAP_PASSWORD;
    const r = await call(auth, { method: "POST", body: { password: "anything" }, headers: AJAX });
    expect(r.status).toBe(503);
  });

  it("locks an IP out after 5 failures", async () => {
    for (let i = 0; i < 5; i += 1) await call(auth, { method: "POST", body: { password: "wrong" }, headers: AJAX, ip: "9.9.9.9" });
    const locked = await call(auth, { method: "POST", body: { password: PASSWORD }, headers: AJAX, ip: "9.9.9.9" });
    expect(locked.status).toBe(429);
    expect(locked.json.retryAfter).toBeGreaterThan(0);
    // another IP is unaffected
    const other = await call(auth, { method: "POST", body: { password: PASSWORD }, headers: AJAX, ip: "8.8.8.8" });
    expect(other.status).toBe(200);
  });

  it("protects merchant endpoints and honours the session cookie", async () => {
    expect((await call(menuAdmin, { method: "GET" })).status).toBe(401);
    const { cookie } = await signIn(auth);
    expect((await call(menuAdmin, { method: "GET", headers: { cookie } })).status).toBe(200);
    const status = await call(auth, { method: "GET", headers: { cookie } });
    expect(status.json.authenticated).toBe(true);
  });

  it("rejects forged, tampered and expired tokens", () => {
    const token = issueToken({ pwv: "bootstrap", bootstrap: true });
    expect(readToken(token)).not.toBeNull();
    const [payload, mac] = token.split(".");
    expect(readToken(`${payload}x.${mac}`)).toBeNull();
    expect(readToken(`${payload}.${mac.slice(0, -2)}AA`)).toBeNull();
    expect(readToken(token, Date.now() + 13 * 3600 * 1000)).toBeNull();
    expect(readToken("garbage")).toBeNull();
  });

  it("changes the password, stores only a hash, and signs old sessions out", async () => {
    const { cookie } = await signIn(auth);
    const weak = await call(auth, { method: "PUT", headers: { ...AJAX, cookie }, body: { currentPassword: PASSWORD, newPassword: "short" } });
    expect(weak.status).toBe(400);
    const wrongCurrent = await call(auth, { method: "PUT", headers: { ...AJAX, cookie }, body: { currentPassword: "nope", newPassword: "a-much-better-passphrase" } });
    expect(wrongCurrent.status).toBe(401);

    const changed = await call(auth, { method: "PUT", headers: { ...AJAX, cookie }, body: { currentPassword: PASSWORD, newPassword: "a-much-better-passphrase" } });
    expect(changed.status).toBe(200);
    expect(changed.json.mustChangePassword).toBe(false);

    // the old cookie no longer works; the bootstrap password no longer works; the new one does
    expect((await call(menuAdmin, { method: "GET", headers: { cookie } })).status).toBe(401);
    expect((await call(auth, { method: "POST", body: { password: PASSWORD }, headers: AJAX })).status).toBe(401);
    expect((await call(auth, { method: "POST", body: { password: "a-much-better-passphrase" }, headers: AJAX })).status).toBe(200);

    const { getStorage } = await import("../../api/_lib/storage.js");
    const stored = JSON.stringify(await getStorage().getJSON("config/merchant.json"));
    expect(stored).toContain("scrypt");
    expect(stored).not.toContain("a-much-better-passphrase");
  });
});
