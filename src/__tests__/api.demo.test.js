import { afterEach, beforeEach, describe, expect, it } from "vitest";
import auth from "../../api/merchant/auth.js";
import adminMenu from "../../api/merchant/menu.js";
import publicMenu from "../../api/menu.js";
import checkout from "../../api/checkout.js";
import invoice from "../../api/invoice/[id].js";
import webhook from "../../api/paystack/webhook.js";
import { AJAX, call, freshEnv } from "./apiHelpers.js";

beforeEach(() => {
  freshEnv();
  process.env.DEMO_MODE = "1"; // no storage connected
});
afterEach(() => {
  delete process.env.DEMO_MODE;
});

describe("demo mode (no storage connected)", () => {
  it("serves the bundled menu and advertises demo capabilities", async () => {
    const r = await call(publicMenu);
    expect(r.status).toBe(200);
    expect(r.json.source).toBe("default");
    expect(r.json.items).toHaveLength(64);
    expect(r.json.capabilities).toEqual({ storage: false, payments: "demo", email: false, orderStatus: false });
  });

  it("tells the console to use the demo backend instead of crashing", async () => {
    expect((await call(auth)).json).toEqual({ authenticated: false, mustChangePassword: false, mode: "demo" });
  });

  it("refuses data calls with a clear 503 (never a 500)", async () => {
    for (const [handler, opts] of [
      [adminMenu, { method: "GET" }],
      [checkout, { method: "POST", body: { items: [{ id: 1, quantity: 1 }], intent: "invoice" } }],
      [invoice, { method: "GET", query: { id: "20261025abcdefghijklmnop" } }],
      [auth, { method: "POST", headers: AJAX, body: { password: "x" } }],
    ]) {
      const r = await call(handler, opts);
      expect(r.status).toBe(503);
      expect(r.json.code).toBe("storage_not_configured");
    }
  });

  it("acknowledges webhooks without touching storage", async () => {
    const r = await call(webhook, { method: "POST", body: { event: "charge.success", data: { reference: "x-1" } } });
    expect(r.status).toBe(200);
  });
});
