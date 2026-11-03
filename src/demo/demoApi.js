import { demoStore, DEMO_PASSWORD } from "./demoStore.js";
import { demoStorage } from "./storage.js";
import { applyAttempt, buildInvoiceRecord, buildReceipt, isExpired } from "../lib/invoiceModel.js";
import { resolveOrderLines } from "../lib/orderLines.js";
import { validateCustomer } from "../lib/customer.js";
import { computeTotals } from "../lib/pricing.js";
import { getOpenStatus } from "../lib/hours.js";
import { normalizeSettings } from "../lib/settings.js";
import { validateNewPassword } from "../lib/password.js";
import { summarize } from "../lib/orderStats.js";
import { renderOrderPaidAlert } from "../lib/alertTemplate.js";
import { STATUSES } from "../lib/orderStatus.js";

/**
 * The DEMO backend. Mirrors the real API's shapes and error semantics (status + data.code/fields), so the UI has a
 * single code path. Used only while `capabilities.storage` is false; when storage is connected the real API takes over.
 */
const latency = () => (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test" ? 0 : 160);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const httpError = (status, message, data = {}) => Object.assign(new Error(message), { status, data: { error: message, ...data } });
const origin = () => globalThis.location?.origin ?? "https://demo.invalid";
const SESSION = "jb:demo:session";

let memorySession = false; // fallback when sessionStorage is unavailable (private mode, tests)
const session = {
  get: () => {
    try {
      return typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SESSION) === "1" : memorySession;
    } catch {
      return memorySession;
    }
  },
  set(on) {
    memorySession = on;
    try {
      if (typeof sessionStorage === "undefined") return;
      if (on) sessionStorage.setItem(SESSION, "1");
      else sessionStorage.removeItem(SESSION);
    } catch {
      /* ignore */
    }
  },
};

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const randomId = () => `demo${Array.from({ length: 12 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
const codeOf = (id) => `JB-${id.slice(-5).toUpperCase()}`;
const settingsOf = () => normalizeSettings(demoStore.menu.get().settings);

const requireSession = () => {
  if (!session.get()) throw httpError(401, "Please sign in.");
};

function log(entry) {
  demoStore.alerts.add({ id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), ...entry });
}

/** What the (not yet connected) alert channels would do for this order. Returns the summary stored on the order. */
function dispatchOrderAlert(order) {
  const cfg = demoStore.notify.get();
  const rendered = renderOrderPaidAlert(order, { consoleUrl: `${origin()}/merchant` });
  let entry;
  if (!cfg.events.orderPaid) entry = { status: "skipped", reason: "Paid-order alerts are switched off" };
  else if (!cfg.email.enabled) entry = { status: "skipped", reason: "Email channel is off" };
  else if (cfg.email.recipients.length === 0) entry = { status: "skipped", reason: "No recipients set" };
  else entry = { status: "simulated", reason: "Email isn't connected yet: this is what would be sent" };
  log({ type: "order.paid", channel: "email", orderCode: order.code, to: cfg.email.recipients, subject: rendered.subject, ...entry });
  return { channel: "email", status: entry.status, at: new Date().toISOString() };
}

export const demoApi = {
  // ───────────── merchant ─────────────
  merchant: {
    async session() {
      await sleep(latency());
      return { authenticated: session.get(), mustChangePassword: false, mode: "demo" };
    },
    async login(password) {
      await sleep(latency());
      const stored = demoStore.password.get();
      const ok = stored ? (await sha256(password)) === stored : password === DEMO_PASSWORD;
      if (!ok) throw httpError(401, "That password isn't right.");
      session.set(true);
      return { authenticated: true, mustChangePassword: false, mode: "demo" };
    },
    async logout() {
      session.set(false);
      return { authenticated: false };
    },
    async changePassword(currentPassword, newPassword) {
      requireSession();
      await sleep(latency());
      const stored = demoStore.password.get();
      const ok = stored ? (await sha256(currentPassword)) === stored : currentPassword === DEMO_PASSWORD;
      if (!ok) throw httpError(401, "Your current password isn't right.");
      const problem = validateNewPassword(newPassword);
      if (problem) throw httpError(400, problem);
      if (newPassword === currentPassword) throw httpError(400, "Choose a password you haven't used.");
      demoStore.password.set(await sha256(newPassword));
      return { authenticated: true, mustChangePassword: false };
    },
    async getMenu() {
      requireSession();
      await sleep(latency());
      return demoStore.menu.get();
    },
    async saveMenu(doc, baseVersion) {
      requireSession();
      await sleep(latency());
      return demoStore.menu.save(doc, baseVersion);
    },
    /** Keeps the (already compressed) image in this browser and returns a path the menu validator accepts. */
    async uploadImage(dataUrl) {
      requireSession();
      await sleep(latency());
      const clean = String(dataUrl ?? "").trim();
      if (!/^data:image\/(?:webp|png|jpe?g);base64,/.test(clean)) throw httpError(400, "Upload a WebP, PNG or JPEG image.");
      const id = `demo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      demoStorage.set(`jb:demo:img:${id}`, clean);
      return { url: `uploads/${id}` };
    },
    async orders(days = 7) {
      requireSession();
      await sleep(latency());
      const since = Date.now() - days * 86_400_000;
      const all = demoStore.orders.list().filter((o) => new Date(o.payment.paidAt).getTime() >= since).sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt));
      return { days, includeTest: true, testOrders: 0, ...summarize(all, days), orders: all.slice(0, 100) };
    },
    async setOrderStatus(id, status) {
      requireSession();
      await sleep(latency() / 2);
      if (!STATUSES.includes(status)) throw httpError(400, "Unknown status.");
      const updated = demoStore.orders.update(id, { fulfilmentStatus: status });
      if (!updated) throw httpError(404, "Order not found.");
      return updated;
    },
    async getNotifications() {
      requireSession();
      await sleep(latency() / 2);
      return { config: demoStore.notify.get(), alerts: demoStore.alerts.list() };
    },
    async saveNotifications(config) {
      requireSession();
      await sleep(latency() / 2);
      const recipients = [...new Set((config.email?.recipients ?? []).map((e) => String(e).trim().toLowerCase()))];
      if (recipients.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e))) throw httpError(400, "One of the email addresses isn't valid.");
      if (recipients.length > 5) throw httpError(400, "Up to 5 recipients.");
      const next = { ...demoStore.notify.get(), ...config, email: { ...config.email, recipients } };
      demoStore.notify.save(next);
      return { config: next, alerts: demoStore.alerts.list() };
    },
    /** Renders the alert exactly as the email channel will, logs it as simulated, and returns it for preview. */
    async sendTestAlert() {
      requireSession();
      await sleep(latency());
      const sample = demoStore.orders.list().at(-1);
      const order = { ...sample, code: "JB-TEST1", payment: { ...sample.payment, paidAt: new Date().toISOString() } };
      const cfg = demoStore.notify.get();
      const rendered = renderOrderPaidAlert(order, { consoleUrl: `${origin()}/merchant` });
      log({ type: "test", channel: "email", orderCode: "JB-TEST1", to: cfg.email.recipients, subject: rendered.subject, status: "simulated", reason: "Test alert: email isn't connected yet" });
      return { rendered, to: cfg.email.recipients, alerts: demoStore.alerts.list() };
    },
    reset() {
      demoStore.reset();
      session.set(true);
    },
  },

  // ───────────── customer ─────────────
  menu: () => demoStore.menu.get(),

  async checkout(body) {
    await sleep(latency());
    const doc = demoStore.menu.get();
    const settings = normalizeSettings(doc.settings);
    if (!settings.acceptingOrders) throw httpError(403, "We're not taking orders right now. Please check back soon.", { code: "closed" });
    if (settings.autoPauseOutsideHours && !getOpenStatus(settings.hours, new Date(), settings.closures).open) throw httpError(403, "We're closed right now. Please order during opening hours.", { code: "closed" });

    const fulfilment = body.fulfilment === "delivery" ? "delivery" : "pickup";
    const zoneId = typeof body.zoneId === "string" ? body.zoneId : null;
    if (fulfilment === "delivery" && !settings.deliveryEnabled) throw httpError(400, "Delivery isn't available right now. Choose pickup instead.", { code: "no_delivery" });

    const resolved = resolveOrderLines(body.items, doc);
    if (!resolved.ok) throw httpError(resolved.code === "sold_out" || resolved.code === "unknown_item" ? 409 : 400, resolved.error, { code: resolved.code, soldOut: resolved.soldOut });

    const intent = body.intent === "pay" ? "pay" : "invoice";
    const totals = computeTotals(resolved.lines.map((l) => ({ unitPrice: l.item.price, quantity: l.quantity })), fulfilment, settings, { zoneId, payOnline: intent === "pay" });
    if (totals.zoneRequired) throw httpError(422, "Please choose your delivery area.", { fields: { zone: "Choose your delivery area." } });
    if (totals.belowMinimum) throw httpError(400, `The minimum order is ₦${totals.minOrder.toLocaleString("en-NG")}. Add ₦${totals.shortBy.toLocaleString("en-NG")} more.`, { code: "below_minimum" });

    let customer = {};
    if (intent === "pay") {
      const v = validateCustomer(body.customer, fulfilment);
      if (!v.ok) throw httpError(422, "Please check your details.", { fields: v.errors });
      customer = v.customer;
    }

    const id = randomId();
    const record = buildInvoiceRecord({ id, code: codeOf(id), lines: resolved.lines, fulfilment, channel: intent === "pay" ? "web" : "whatsapp", settings, zoneId, customer });
    const invoiceUrl = `${origin()}/invoice/${id}`;

    if (intent === "invoice") {
      demoStore.invoices.save(record);
      return { invoiceId: id, invoiceUrl, code: record.code, expiresAt: record.expiresAt, total: record.total };
    }
    applyAttempt(record, { reference: `${id}-1`, fulfilment, zoneId, settings, customer });
    demoStore.invoices.save(record);
    return { invoiceId: id, invoiceUrl, authorizationUrl: `/pay/demo/${id}` };
  },

  async invoice(id) {
    await sleep(latency());
    const order = demoStore.orders.find(id);
    if (order) return { status: "paid", receipt: order, mode: "demo" };
    const record = demoStore.invoices.get(id);
    if (!record) throw httpError(404, "We couldn't find that invoice. It may have expired (demo invoices live in the browser that created them).", { status: "missing" });
    if (isExpired(record)) throw httpError(410, "This invoice has expired.", { status: "expired", code: record.code });
    return { status: "pending", invoice: record, checking: false };
  },

  async payInvoice(id, { fulfilment, zoneId = null, customer }) {
    await sleep(latency());
    const record = demoStore.invoices.get(id);
    if (!record) throw httpError(404, "We couldn't find that invoice.", { status: "missing" });
    if (isExpired(record)) throw httpError(410, "This invoice has expired. Please place a new order.", { status: "expired" });
    const settings = settingsOf();
    if (!settings.acceptingOrders) throw httpError(403, "We're not taking orders right now.", { code: "closed" });
    const f = fulfilment === "delivery" ? "delivery" : "pickup";
    if (f === "delivery" && !settings.deliveryEnabled) throw httpError(400, "Delivery isn't available right now. Choose pickup instead.");
    const preview = computeTotals(record.items, f, settings, { zoneId, payOnline: true });
    if (preview.zoneRequired) throw httpError(422, "Please choose your delivery area.", { fields: { zone: "Choose your delivery area." } });
    if (preview.belowMinimum) throw httpError(400, `The minimum order is ₦${preview.minOrder.toLocaleString("en-NG")}.`, { code: "below_minimum" });
    const v = validateCustomer(customer, f);
    if (!v.ok) throw httpError(422, "Please check your details.", { fields: v.errors });
    applyAttempt(record, { reference: `${id}-${record.attempts.length + 1}`, fulfilment: f, zoneId, settings, customer: v.customer });
    demoStore.invoices.save(record);
    return { authorizationUrl: `/pay/demo/${id}` };
  },

  /** Powers the mock payment page (stand-in for Paystack's hosted page). */
  mockPayment: {
    async load(id) {
      await sleep(latency() / 2);
      const record = demoStore.invoices.get(id);
      if (record) {
        if (isExpired(record)) throw httpError(410, "This invoice has expired.");
        return record;
      }
      if (demoStore.orders.find(id)) throw httpError(409, "This invoice has already been paid.", { status: "paid" });
      throw httpError(404, "We couldn't find that invoice.");
    },
    /** @param {"success"|"failed"} outcome @param {string} channel card | bank_transfer | ussd */
    async complete(id, outcome, channel = "card") {
      await sleep(latency());
      const record = demoStore.invoices.get(id);
      if (!record) throw httpError(404, "We couldn't find that invoice.");
      if (outcome !== "success") return { status: "failed" };
      const attempt = record.attempts.at(-1);
      const receipt = buildReceipt(record, attempt.reference, { status: "success", amountKobo: attempt.amountKobo, currency: "NGN", channel, paidAt: new Date().toISOString() }, "demo");
      const order = { ...receipt, fulfilmentStatus: "new", alert: null };
      order.alert = dispatchOrderAlert(order);
      demoStore.orders.add(order);
      demoStore.invoices.remove(id);
      return { status: "paid" };
    },
  },
};