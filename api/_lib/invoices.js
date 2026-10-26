import crypto from "node:crypto";
import { getStorage } from "./storage.js";
import { computeTotals, toKobo } from "../../src/lib/pricing.js";

/**
 * Invoice → receipt lifecycle.
 *
 *   invoices/pending/<id>.json        created at checkout / WhatsApp; expires after 24h (S3 lifecycle rule deletes it after 3 days)
 *   receipts/<yyyy>/<mm>/<id>.json    written when Paystack confirms payment; kept for the merchant's records
 *
 * The same URL (/invoice/<id>) shows the invoice while pending and the receipt once paid.
 * The id is 80 random bits, so the link itself is the access token.
 */

export const INVOICE_TTL_MS = 24 * 60 * 60 * 1000;
const ID_RE = /^\d{8}[a-z2-7]{16}$/;
const B32 = "abcdefghijklmnopqrstuvwxyz234567";

export const isValidId = (id) => typeof id === "string" && ID_RE.test(id);
export const pendingKey = (id) => `invoices/pending/${id}.json`;
export const receiptKey = (id) => `receipts/${id.slice(0, 4)}/${id.slice(4, 6)}/${id}.json`;
export const invoiceCode = (id) => `JB-${id.slice(8, 13).toUpperCase()}`;
export const referenceFor = (id, attempt) => `${id}-${attempt}`;
export const idFromReference = (ref) => String(ref ?? "").slice(0, String(ref ?? "").lastIndexOf("-"));

export function newInvoiceId(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const bytes = crypto.randomBytes(16);
  return date + Array.from(bytes, (b) => B32[b & 31]).join("");
}

export function normalizePhone(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (/^0\d{10}$/.test(digits)) return `234${digits.slice(1)}`;
  return digits;
}

/** Full validation used when someone is about to pay. */
export function validateCustomer(c, fulfilment) {
  const errors = {};
  const name = String(c?.name ?? "").trim();
  const email = String(c?.email ?? "").trim().toLowerCase();
  const phone = normalizePhone(c?.phone);
  const address = String(c?.address ?? "").trim();
  const note = String(c?.note ?? "").trim();

  if (name.length < 2 || name.length > 60) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = "Enter a valid email for your receipt.";
  if (phone.length < 10 || phone.length > 15) errors.phone = "Enter a phone number we can reach.";
  if (fulfilment === "delivery" && (address.length < 5 || address.length > 200)) errors.address = "Enter your delivery address.";
  if (note.length > 200) errors.note = "Keep the note under 200 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, customer: { name, email, phone, address: fulfilment === "delivery" ? address : "", note } };
}

/** @param {{ lines: Array<{item:object, quantity:number}>, fulfilment: string, channel: string, settings: object, customer?: object }} input */
export function buildInvoice({ lines, fulfilment, channel, settings, customer = {} }, now = new Date()) {
  const id = newInvoiceId(now);
  const items = lines.map(({ item, quantity }) => ({ id: item.id, name: item.name, unitPrice: item.price, quantity, lineTotal: item.price * quantity }));
  const totals = computeTotals(items, fulfilment, settings);
  return {
    id,
    code: invoiceCode(id),
    status: "pending",
    channel,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVOICE_TTL_MS).toISOString(),
    items,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    fulfilment,
    customer,
    attempts: [],
  };
}

export const isExpired = (record, now = Date.now()) => record.status === "pending" && new Date(record.expiresAt).getTime() < now;

export async function saveInvoice(record) {
  await getStorage().putJSON(pendingKey(record.id), record);
}

/** @returns {Promise<object|null>} the receipt if paid, else the pending invoice, else null */
export async function loadInvoice(id) {
  if (!isValidId(id)) return null;
  const storage = getStorage();
  return (await storage.getJSON(receiptKey(id))) ?? (await storage.getJSON(pendingKey(id)));
}

/** Re-prices an invoice for a chosen fulfilment and registers a new payment attempt. Mutates and returns `record`. */
export function addAttempt(record, { fulfilment, settings, customer }, now = new Date()) {
  const totals = computeTotals(record.items, fulfilment, settings);
  const reference = referenceFor(record.id, record.attempts.length + 1);
  record.fulfilment = fulfilment;
  record.deliveryFee = totals.deliveryFee;
  record.total = totals.total;
  record.customer = customer;
  record.attempts.push({ reference, at: now.toISOString(), fulfilment, deliveryFee: totals.deliveryFee, total: totals.total, amountKobo: toKobo(totals.total) });
  return { record, reference, amountKobo: toKobo(totals.total) };
}

/**
 * Turn a verified Paystack payment into a receipt. Idempotent: webhook and browser callback may both call it.
 * Returns the receipt, or null if the verification does not match what we asked Paystack to charge.
 */
export async function settle(record, reference, verification, { mode = "live" } = {}) {
  if (record.status === "paid") return record;
  const attempt = record.attempts.find((a) => a.reference === reference);
  if (!attempt || verification.status !== "success") return null;
  if ((verification.currency ?? "NGN") !== "NGN") return null;
  if (verification.amountKobo !== attempt.amountKobo) return null;

  const receipt = {
    ...record,
    status: "paid",
    fulfilment: attempt.fulfilment,
    deliveryFee: attempt.deliveryFee,
    total: attempt.total,
    payment: { reference, channel: verification.channel ?? "card", paidAt: verification.paidAt ?? new Date().toISOString(), amount: attempt.total, currency: "NGN", mode },
  };
  const storage = getStorage();
  await storage.putJSON(receiptKey(record.id), receipt);
  await storage.remove(pendingKey(record.id));
  return receipt;
}
