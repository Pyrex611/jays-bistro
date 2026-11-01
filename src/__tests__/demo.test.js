import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoApi } from "../demo/demoApi.js";
import { demoStore, DEMO_PASSWORD } from "../demo/demoStore.js";
import { demoStorage } from "../demo/storage.js";
import { generateSeedOrders } from "../demo/seed.js";
import { defaultMenuDoc } from "../lib/menuDoc.js";
import { computeServiceFee } from "../lib/pricing.js";
import { normalizeSettings } from "../lib/settings.js";
import { resolveImageUrl } from "../lib/image.js";
import { runtime } from "../services/runtime.js";
import { api } from "../services/api.js";

const CUSTOMER = { name: "Ada Obi", email: "ada@example.com", phone: "08062624447", address: "12 High Level, Makurdi", note: "" };
const ITEMS = [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }]; // ₦9,000

beforeEach(async () => {
  demoStore.reset();
  await demoApi.merchant.logout();
  runtime.reset();
});

describe("seed orders", () => {
  const doc = defaultMenuDoc();
  const settings = normalizeSettings({ zones: [{ name: "High Level", fee: 500 }] });
  const now = new Date("2026-10-27T15:00:00Z");
  const orders = generateSeedOrders({ items: doc.items, settings, now });

  it("is deterministic", () => {
    expect(generateSeedOrders({ items: doc.items, settings, now }).map((o) => o.code)).toEqual(orders.map((o) => o.code));
  });

  it("fills 30 days with plausible, internally consistent orders", () => {
    expect(orders.length).toBeGreaterThan(60);
    expect(new Set(orders.map((o) => o.code)).size).toBe(orders.length);
    for (const o of orders) {
      expect(o.subtotal + o.deliveryFee + o.serviceFee).toBe(o.total);
      expect(o.serviceFee).toBe(computeServiceFee(o.subtotal + o.deliveryFee, settings.serviceFee));
      expect(o.items.reduce((s, i) => s + i.lineTotal, 0)).toBe(o.subtotal);
      expect(new Date(o.payment.paidAt) <= now).toBe(true);
      if (o.fulfilment === "delivery") expect(o.customer.address).toBeTruthy();
    }
  });

  it("always leaves five recent orders in the kitchen pipeline (even early in the morning) and completes the rest", () => {
    const early = generateSeedOrders({ items: doc.items, settings, now: new Date("2026-10-27T05:00:00Z") }); // 06:00 Lagos: before any lunch orders
    expect(early.filter((o) => o.fulfilmentStatus !== "completed")).toHaveLength(5);
    expect(early.filter((o) => o.fulfilmentStatus === "new").length).toBeGreaterThan(0);
    const open = orders.filter((o) => o.fulfilmentStatus !== "completed");
    expect(open).toHaveLength(5);
    expect(orders.filter((o) => o.fulfilmentStatus === "completed").length).toBeGreaterThan(50);
  });
});

describe("demo merchant session", () => {
  it("accepts the setup password only, and requires sign-in for data", async () => {
    await expect(demoApi.merchant.getMenu()).rejects.toMatchObject({ status: 401 });
    await expect(demoApi.merchant.login("wrong")).rejects.toMatchObject({ status: 401 });
    expect(await demoApi.merchant.login(DEMO_PASSWORD)).toMatchObject({ authenticated: true, mode: "demo" });
    expect((await demoApi.merchant.getMenu()).items).toHaveLength(64);
    await demoApi.merchant.logout();
    await expect(demoApi.merchant.getMenu()).rejects.toMatchObject({ status: 401 });
  });

  it("lets the merchant set their own password (setup password then stops working)", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    await expect(demoApi.merchant.changePassword(DEMO_PASSWORD, "short")).rejects.toMatchObject({ status: 400 });
    await expect(demoApi.merchant.changePassword("nope", "a-much-better-passphrase")).rejects.toMatchObject({ status: 401 });
    await demoApi.merchant.changePassword(DEMO_PASSWORD, "a-much-better-passphrase");
    await demoApi.merchant.logout();
    await expect(demoApi.merchant.login(DEMO_PASSWORD)).rejects.toMatchObject({ status: 401 });
    expect((await demoApi.merchant.login("a-much-better-passphrase")).authenticated).toBe(true);
  });
});

describe("demo menu publishing", () => {
  it("validates, versions and conflicts like the real API", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const current = await demoApi.merchant.getMenu();
    expect(current.settings.zones.length).toBeGreaterThan(0); // sample delivery areas
    const edited = structuredClone(current);
    edited.items[0].price = 2222;
    const saved = await demoApi.merchant.saveMenu(edited, current.version);
    expect(saved.version).toBe(1);
    await expect(demoApi.merchant.saveMenu(edited, 0)).rejects.toMatchObject({ status: 409 });
    const bad = structuredClone(saved);
    bad.items[0].price = -1;
    await expect(demoApi.merchant.saveMenu(bad, 1)).rejects.toMatchObject({ status: 400 });
    expect(demoStore.menu.get().items[0].price).toBe(2222);
  });

  it("stores uploaded photos locally and resolves them for display", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
    const { url } = await demoApi.merchant.uploadImage(dataUrl);
    expect(url).toMatch(/^uploads\/demo-/);
    expect(resolveImageUrl(url)).toBe(dataUrl);
    await expect(demoApi.merchant.uploadImage("data:text/html;base64,AAAA")).rejects.toMatchObject({ status: 400 });
  });
});

describe("demo checkout → mock payment → order", () => {
  it("walks pay → mock payment page → receipt, and the order lands in the console as NEW", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const before = (await demoApi.merchant.orders(30)).kpis.orders;
    const start = await demoApi.checkout({ items: ITEMS, intent: "pay", fulfilment: "delivery", zoneId: "high-level", customer: CUSTOMER });
    expect(start.authorizationUrl).toBe(`/pay/demo/${start.invoiceId}`);

    const invoice = await demoApi.mockPayment.load(start.invoiceId);
    expect(invoice.total).toBe(9000 + 500 + computeServiceFee(9500, normalizeSettings({}).serviceFee));
    expect((await demoApi.invoice(start.invoiceId)).status).toBe("pending");

    expect(await demoApi.mockPayment.complete(start.invoiceId, "failed")).toEqual({ status: "failed" });
    expect((await demoApi.invoice(start.invoiceId)).status).toBe("pending");

    expect(await demoApi.mockPayment.complete(start.invoiceId, "success", "bank_transfer")).toEqual({ status: "paid" });
    const paid = await demoApi.invoice(start.invoiceId);
    expect(paid).toMatchObject({ status: "paid", mode: "demo" });
    expect(paid.receipt.zone).toMatchObject({ id: "high-level", name: "High Level" });
    expect(paid.receipt.payment).toMatchObject({ channel: "bank_transfer", mode: "demo" });

    const after = await demoApi.merchant.orders(30);
    expect(after.kpis.orders).toBe(before + 1);
    expect(after.orders.find((o) => o.id === start.invoiceId).fulfilmentStatus).toBe("new");
  });

  it("creates a WhatsApp-style invoice that can be paid later, re-priced for pickup", async () => {
    const made = await demoApi.checkout({ items: ITEMS, intent: "invoice", fulfilment: "delivery", zoneId: "wadata" });
    expect(made.total).toBe(9600);
    const pay = await demoApi.payInvoice(made.invoiceId, { fulfilment: "pickup", customer: CUSTOMER });
    expect(pay.authorizationUrl).toContain(made.invoiceId);
    await demoApi.mockPayment.complete(made.invoiceId, "success");
    const { receipt } = await demoApi.invoice(made.invoiceId);
    expect(receipt.fulfilment).toBe("pickup");
    expect(receipt.deliveryFee).toBe(0);
    expect(receipt.total).toBe(9000 + computeServiceFee(9000, normalizeSettings({}).serviceFee));
  });

  it("enforces the same business rules as the server", async () => {
    await expect(demoApi.checkout({ items: ITEMS, intent: "invoice", fulfilment: "delivery" })).rejects.toMatchObject({ status: 422, data: { fields: { zone: expect.any(String) } } });
    await expect(demoApi.checkout({ items: ITEMS, intent: "invoice", fulfilment: "delivery", zoneId: "old-gra" })).rejects.toMatchObject({ status: 422 }); // disabled zone
    await expect(demoApi.checkout({ items: [{ id: 1, quantity: 1 }], intent: "invoice", fulfilment: "delivery", zoneId: "north-bank" })).rejects.toMatchObject({ status: 400, data: { code: "below_minimum" } });
    await expect(demoApi.checkout({ items: [{ id: 99999, quantity: 1 }], intent: "invoice" })).rejects.toMatchObject({ status: 409 });
    await expect(demoApi.checkout({ items: ITEMS, intent: "pay", fulfilment: "pickup", customer: { name: "A" } })).rejects.toMatchObject({ status: 422 });

    await demoApi.merchant.login(DEMO_PASSWORD);
    const doc = structuredClone(await demoApi.merchant.getMenu());
    doc.settings.acceptingOrders = false;
    await demoApi.merchant.saveMenu(doc, doc.version);
    await expect(demoApi.checkout({ items: ITEMS, intent: "invoice" })).rejects.toMatchObject({ status: 403, data: { code: "closed" } });
  });

  it("expires unpaid invoices after 24 hours", async () => {
    const made = await demoApi.checkout({ items: ITEMS, intent: "invoice" });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 25 * 3600 * 1000);
    try {
      await expect(demoApi.invoice(made.invoiceId)).rejects.toMatchObject({ status: 410 });
    } finally {
      vi.useRealTimers();
    }
    await expect(demoApi.invoice("demo-nope")).rejects.toMatchObject({ status: 404 });
  });
});

describe("orders, status workflow and analytics", () => {
  it("summarises demo sales and moves orders through the kitchen", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const week = await demoApi.merchant.orders(7);
    expect(week.kpis.orders).toBeGreaterThan(5);
    expect(week.kpis.revenue).toBeGreaterThan(0);
    expect(week.daily).toHaveLength(7);
    expect(week.topItems.length).toBeGreaterThan(2);

    const open = week.orders.find((o) => o.fulfilmentStatus === "new");
    expect(open).toBeTruthy();
    expect((await demoApi.merchant.setOrderStatus(open.id, "preparing")).fulfilmentStatus).toBe("preparing");
    await expect(demoApi.merchant.setOrderStatus(open.id, "teleported")).rejects.toMatchObject({ status: 400 });
    await expect(demoApi.merchant.setOrderStatus("nope", "ready")).rejects.toMatchObject({ status: 404 });
  });
});

describe("kitchen alerts (simulated until email is connected)", () => {
  it("validates recipients and keeps the config", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const { config } = await demoApi.merchant.getNotifications();
    await expect(demoApi.merchant.saveNotifications({ ...config, email: { enabled: true, recipients: ["not-an-email"] } })).rejects.toMatchObject({ status: 400 });
    await expect(demoApi.merchant.saveNotifications({ ...config, email: { enabled: true, recipients: Array.from({ length: 6 }, (_, i) => `a${i}@x.com`) } })).rejects.toMatchObject({ status: 400 });
    const saved = await demoApi.merchant.saveNotifications({ ...config, email: { enabled: true, recipients: ["Kitchen@Example.com", "kitchen@example.com", "owner@example.com"] } });
    expect(saved.config.email.recipients).toEqual(["kitchen@example.com", "owner@example.com"]);
  });

  it("renders a test alert, and logs a simulated entry per paid order (or why it was skipped)", async () => {
    await demoApi.merchant.login(DEMO_PASSWORD);
    const test = await demoApi.merchant.sendTestAlert();
    expect(test.rendered.subject).toContain("New paid order JB-TEST1");
    expect(test.alerts[0]).toMatchObject({ type: "test", status: "simulated" });

    const start = await demoApi.checkout({ items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER });
    await demoApi.mockPayment.complete(start.invoiceId, "success");
    expect((await demoApi.merchant.getNotifications()).alerts[0]).toMatchObject({ type: "order.paid", status: "simulated" });

    const { config } = await demoApi.merchant.getNotifications();
    await demoApi.merchant.saveNotifications({ ...config, email: { enabled: true, recipients: [] } });
    const again = await demoApi.checkout({ items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER });
    await demoApi.mockPayment.complete(again.invoiceId, "success");
    expect((await demoApi.merchant.getNotifications()).alerts[0]).toMatchObject({ status: "skipped", reason: "No recipients set" });
  });
});

describe("capability switching", () => {
  it("whenReady resolves as soon as capabilities are known, or times out", async () => {
    const waiting = runtime.whenReady(5000);
    runtime.setCapabilities({ storage: false, payments: "demo", email: false, orderStatus: false });
    await waiting;
    expect(runtime.isDemo()).toBe(true);
    runtime.reset();
    await runtime.whenReady(10); // times out, assumes real backend
    expect(runtime.isDemo()).toBe(false);
  });

  it("api.checkout uses the demo backend in demo mode and the real endpoint when storage is connected", async () => {
    runtime.setCapabilities({ storage: false, payments: "demo" });
    expect((await api.checkout({ items: ITEMS, intent: "invoice" })).invoiceId).toMatch(/^demo/);

    runtime.setCapabilities({ storage: true, payments: "test" });
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ invoiceId: "real123" }) }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      expect((await api.checkout({ items: ITEMS, intent: "invoice" })).invoiceId).toBe("real123");
      expect(fetchMock).toHaveBeenCalledWith("/api/checkout", expect.objectContaining({ method: "POST" }));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("a missing API (404) means demo, but a server error never does", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })));
    await expect(api.menu()).rejects.toMatchObject({ status: 404 });
    expect(runtime.isDemo()).toBe(true);

    runtime.reset();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));
    await expect(api.menu()).rejects.toMatchObject({ status: 500 });
    expect(runtime.isKnown()).toBe(false);
    vi.unstubAllGlobals();
  });

  it("demo storage survives a missing localStorage", () => {
    demoStorage.set("jb:demo:x", { a: 1 });
    expect(demoStorage.get("jb:demo:x")).toEqual({ a: 1 });
    demoStorage.clearAll();
    expect(demoStorage.get("jb:demo:x")).toBeNull();
  });
});
