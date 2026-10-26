import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import auth from "../../api/merchant/auth.js";
import adminMenu from "../../api/merchant/menu.js";
import orders, { summarize } from "../../api/merchant/orders.js";
import checkout from "../../api/checkout.js";
import invoice from "../../api/invoice/[id].js";
import webhook from "../../api/paystack/webhook.js";
import { getStorage } from "../../api/_lib/storage.js";
import { AJAX, call, freshEnv, signIn, stubPaystack } from "./apiHelpers.js";

const CUSTOMER = { name: "Ada Obi", email: "ada@example.com", phone: "0806 262 4447", address: "12 High Level, Makurdi", note: "No pepper" };
const ITEMS = [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }]; // Party Jollof ₦1,500 ×2 + Isi-ewu ₦6,000 = ₦9,000

beforeEach(() => {
  freshEnv();
});
afterEach(() => vi.unstubAllGlobals());

const idOf = (url) => url.split("/invoice/")[1];

async function publishSettings(settings, mutate) {
  const { cookie } = await signIn(auth);
  const doc = structuredClone((await call(adminMenu, { headers: { cookie } })).json);
  doc.settings = { ...doc.settings, ...settings };
  mutate?.(doc);
  const r = await call(adminMenu, { method: "PUT", headers: { ...AJAX, cookie }, body: { doc, baseVersion: 0 } });
  expect(r.status).toBe(200);
}

describe("WhatsApp invoice (intent: invoice)", () => {
  it("creates an expiring invoice priced by the server", async () => {
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice", fulfilment: "pickup", items_price_hint: 1 } });
    expect(r.status).toBe(200);
    expect(r.json.total).toBe(9000);
    expect(r.json.invoiceUrl).toMatch(/^https:\/\/jays-bistro\.vercel\.app\/invoice\/\d{8}[a-z2-7]{16}$/);
    expect(new Date(r.json.expiresAt) - Date.now()).toBeGreaterThan(23 * 3600 * 1000);
    expect(await getStorage().list("invoices/pending/")).toHaveLength(1);

    const view = await call(invoice, { query: { id: idOf(r.json.invoiceUrl) } });
    expect(view.json.status).toBe("pending");
    expect(view.json.invoice.items).toHaveLength(2);
  });

  it("applies the delivery fee and the minimum order from settings", async () => {
    await publishSettings({ deliveryFee: 1000, minOrder: 2000 });
    const withDelivery = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice", fulfilment: "delivery" } });
    expect(withDelivery.json.total).toBe(10000);

    const tooSmall = await call(checkout, { method: "POST", body: { items: [{ id: 1, quantity: 1 }], intent: "invoice", fulfilment: "pickup" } });
    expect(tooSmall.status).toBe(400);
    expect(tooSmall.json.code).toBe("below_minimum");
  });

  it("refuses unknown items, sold-out items, paused stores and bad quantities", async () => {
    expect((await call(checkout, { method: "POST", body: { items: [{ id: 99999, quantity: 1 }], intent: "invoice" } })).status).toBe(409);
    expect((await call(checkout, { method: "POST", body: { items: [{ id: 1, quantity: 0 }], intent: "invoice" } })).status).toBe(400);
    expect((await call(checkout, { method: "POST", body: { items: [], intent: "invoice" } })).status).toBe(400);

    await publishSettings({}, (doc) => { doc.items.find((i) => i.id === 2).isAvailable = false; });
    const soldOut = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice" } });
    expect(soldOut.status).toBe(409);
    expect(soldOut.json.soldOut).toEqual(["Isi-ewu"]);
  });

  it("refuses orders while the store is paused", async () => {
    await publishSettings({ acceptingOrders: false });
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice" } });
    expect(r.status).toBe(403);
    expect(r.json.code).toBe("closed");
  });
});

describe("pay online (mock mode — no Paystack key, not production)", () => {
  it("walks pay → return → receipt, then the invoice URL becomes the receipt", async () => {
    const start = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "delivery", customer: CUSTOMER } });
    expect(start.status).toBe(200);
    expect(start.json.authorizationUrl).toContain("mock=success");
    const id = start.json.invoiceId;

    // before the customer "pays" it is still pending
    expect((await call(invoice, { query: { id } })).json.status).toBe("pending");

    // customer returns from the (mock) payment page
    const ref = new URL(start.json.authorizationUrl).searchParams.get("reference");
    const back = await call(invoice, { query: { id, reference: ref, mock: "success" } });
    expect(back.json.status).toBe("paid");
    expect(back.json.receipt.payment.reference).toBe(`${id}-1`);
    expect(back.json.receipt.customer.phone).toBe("2348062624447");
    expect(back.json.mode).toBe("mock");

    // pending file is gone, receipt filed by month, URL keeps working
    expect(await getStorage().list("invoices/pending/")).toHaveLength(0);
    expect((await getStorage().list("receipts/"))[0]).toMatch(/^receipts\/\d{4}\/\d{2}\/\d{8}[a-z2-7]{16}\.json$/);
    expect((await call(invoice, { query: { id } })).json.status).toBe("paid");
  });

  it("validates customer details before charging", async () => {
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "delivery", customer: { name: "A", email: "nope", phone: "1" } } });
    expect(r.status).toBe(422);
    expect(Object.keys(r.json.fields).sort()).toEqual(["address", "email", "name", "phone"]);
  });

  it("lets a WhatsApp invoice be paid later, switching to pickup and re-pricing the fee", async () => {
    await publishSettings({ deliveryFee: 1500 });
    const made = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice", fulfilment: "delivery" } });
    expect(made.json.total).toBe(10500);
    const id = made.json.invoiceId;

    const pay = await call(invoice, { method: "POST", query: { id }, body: { action: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    expect(pay.status).toBe(200);
    const ref = new URL(pay.json.authorizationUrl).searchParams.get("reference");
    const done = await call(invoice, { query: { id, reference: ref, mock: "success" } });
    expect(done.json.receipt.total).toBe(9000);
    expect(done.json.receipt.fulfilment).toBe("pickup");
  });

  it("expires unpaid invoices after 24 hours", async () => {
    const made = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice" } });
    const id = made.json.invoiceId;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 25 * 3600 * 1000);
    try {
      const r = await call(invoice, { query: { id } });
      expect(r.status).toBe(410);
      expect(r.json.status).toBe("expired");
      const pay = await call(invoice, { method: "POST", query: { id }, body: { action: "pay", customer: CUSTOMER, fulfilment: "pickup" } });
      expect(pay.status).toBe(410);
    } finally {
      vi.useRealTimers();
    }
  });

  it("404s for malformed or unknown ids", async () => {
    expect((await call(invoice, { query: { id: "../../etc/passwd" } })).status).toBe(404);
    expect((await call(invoice, { query: { id: "20261025abcdefghijklmnop" } })).status).toBe(404);
  });
});

describe("pay online (live mode, Paystack stubbed)", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_stub";
  });

  const initStub = (verifyData) =>
    stubPaystack((path, init) => {
      if (path === "/transaction/initialize") {
        const body = JSON.parse(init.body);
        return { authorization_url: `https://checkout.paystack.com/${body.reference}`, reference: body.reference, access_code: "x" };
      }
      if (path.startsWith("/transaction/verify/")) return verifyData(decodeURIComponent(path.split("/").pop()));
      throw new Error(`unexpected ${path}`);
    });

  it("sends the right amount in kobo and the invoice URL as callback", async () => {
    const fn = initStub(() => ({ status: "abandoned" }));
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    expect(r.json.authorizationUrl).toContain("checkout.paystack.com");
    const sent = JSON.parse(fn.mock.calls[0][1].body);
    expect(sent).toMatchObject({ email: "ada@example.com", amount: 900000, currency: "NGN" });
    expect(sent.callback_url).toBe(r.json.invoiceUrl);
    expect(fn.mock.calls[0][1].headers.Authorization).toBe("Bearer sk_test_stub");
  });

  it("settles only when Paystack confirms success with the exact amount", async () => {
    let verdict = { status: "success", amount: 123, currency: "NGN", channel: "bank_transfer", paid_at: "2026-10-25T10:00:00Z" };
    initStub(() => verdict);
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    const id = r.json.invoiceId;
    const ref = `${id}-1`;

    // wrong amount → NOT settled (tampering / partial payment)
    expect((await call(invoice, { query: { id, reference: ref } })).json.status).toBe("pending");
    // wrong currency → NOT settled
    verdict = { ...verdict, amount: 900000, currency: "USD" };
    expect((await call(invoice, { query: { id, reference: ref } })).json.status).toBe("pending");
    // abandoned → NOT settled
    verdict = { status: "abandoned" };
    expect((await call(invoice, { query: { id, reference: ref } })).json.status).toBe("pending");
    // correct → settled with the channel Paystack reports
    verdict = { status: "success", amount: 900000, currency: "NGN", channel: "bank_transfer", paid_at: "2026-10-25T10:00:00Z" };
    const ok = await call(invoice, { query: { id, reference: ref } });
    expect(ok.json.status).toBe("paid");
    expect(ok.json.receipt.payment).toMatchObject({ channel: "bank_transfer", amount: 9000, mode: "live" });
  });

  it("ignores a reference that does not belong to the invoice", async () => {
    // Paystack would say "success" for the foreign reference, but it is not one of this invoice's attempts.
    initStub((ref) => (ref === "someone-elses-ref" ? { status: "success", amount: 900000, currency: "NGN" } : { status: "abandoned" }));
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    const res = await call(invoice, { query: { id: r.json.invoiceId, reference: "someone-elses-ref" } });
    expect(res.json.status).toBe("pending");
  });

  it("webhook settles an invoice even if the customer never came back", async () => {
    initStub(() => ({ status: "success", amount: 900000, currency: "NGN", channel: "card", paid_at: "2026-10-25T10:00:00Z" }));
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    const id = r.json.invoiceId;

    const hook = await call(webhook, { method: "POST", body: { event: "charge.success", data: { reference: `${id}-1` } } });
    expect(hook.status).toBe(200);
    expect((await call(invoice, { query: { id } })).json.status).toBe("paid");
  });

  it("webhook never trusts its own payload", async () => {
    initStub(() => ({ status: "abandoned" }));
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    const id = r.json.invoiceId;
    await call(webhook, { method: "POST", body: { event: "charge.success", data: { reference: `${id}-1`, status: "success", amount: 900000 } } });
    expect((await call(invoice, { query: { id } })).json.status).toBe("pending");
    // junk and non-charge events are acknowledged and ignored
    expect((await call(webhook, { method: "POST", body: { event: "charge.success", data: { reference: "x" } } })).status).toBe(200);
    expect((await call(webhook, { method: "POST", body: { event: "transfer.success" } })).status).toBe(200);
  });

  it("answers 503 (not a crash) when Paystack is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
    const r = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
    expect(r.status).toBe(502);
  });
});

describe("payments switched off (production, no key)", () => {
  it("says so plainly and keeps WhatsApp invoices working", async () => {
    process.env.VERCEL_ENV = "production";
    try {
      const pay = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
      expect(pay.status).toBe(503);
      expect(pay.json.code).toBe("payments_off");
      const inv = await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice" } });
      expect(inv.status).toBe(200);
    } finally {
      delete process.env.VERCEL_ENV;
    }
  });
});

describe("merchant orders", () => {
  it("lists paid orders with KPIs; pending invoices do not count", async () => {
    for (const items of [ITEMS, [{ id: 1, quantity: 1 }]]) {
      const s = await call(checkout, { method: "POST", body: { items, intent: "pay", fulfilment: "pickup", customer: CUSTOMER } });
      await call(invoice, { query: { id: s.json.invoiceId, reference: `${s.json.invoiceId}-1`, mock: "success" } });
    }
    await call(checkout, { method: "POST", body: { items: ITEMS, intent: "invoice" } }); // unpaid

    expect((await call(orders, { query: { days: "7" } })).status).toBe(401);
    const { cookie } = await signIn(auth);
    const r = await call(orders, { query: { days: "7" }, headers: { cookie } });
    expect(r.status).toBe(200);
    expect(r.json.kpis).toEqual({ revenue: 10500, orders: 2, averageOrder: 5250 });
    expect(r.json.topItems[0]).toMatchObject({ id: 1, units: 3, revenue: 4500 });
    expect(r.json.daily).toHaveLength(7);
    expect(r.json.orders).toHaveLength(2);
  });

  it("summarize() handles an empty period", () => {
    const s = summarize([], 3, new Date("2026-10-25T12:00:00Z"));
    expect(s.kpis).toEqual({ revenue: 0, orders: 0, averageOrder: 0 });
    expect(s.daily).toHaveLength(3);
  });
});
