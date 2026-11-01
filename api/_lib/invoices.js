import crypto from "node:crypto";
import { getStorage } from "./storage.js";
import { applyAttempt, buildInvoiceRecord, buildReceipt, isExpired as isExpiredModel, INVOICE_TTL_MS as TTL } from "../../src/lib/invoiceModel.js";
export { normalizePhone, validateCustomer } from "../../src/lib/customer.js";

/**
 * Invoice → receipt lifecycle.
 *
 *   invoices/pending/<id>.json        created at checkout / WhatsApp; expires after 24h (S3 lifecycle rule deletes it after 3 days)
 *   receipts/<yyyy>/<mm>/<id>.json    written when Paystack confirms payment; kept for the merchant's records
 *
 * The same URL (/invoice/<id>) shows the invoice while pending and the receipt once paid.
 * The id is 80 random bits, so the link itself is the access token.
 */

export const INVOICE_TTL_MS = TTL;
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

/** @param {{ lines: Array<{item:object, quantity:number}>, fulfilment: string, channel: string, settings: object, zoneId?: string, customer?: object }} input */
export function buildInvoice(input, now = new Date()) {
  const id = newInvoiceId(now);
  return buildInvoiceRecord({ ...input, id, code: invoiceCode(id), now });
}

export const isExpired = isExpiredModel;

export async function saveInvoice(record) {
  await getStorage().putJSON(pendingKey(record.id), record);
}

/** @returns {Promise<object|null>} the receipt if paid, else the pending invoice, else null */
export async function loadInvoice(id) {
  if (!isValidId(id)) return null;
  const storage = getStorage();
  return (await storage.getJSON(receiptKey(id))) ?? (await storage.getJSON(pendingKey(id)));
}

/** Re-prices an invoice for a chosen fulfilment/zone and registers a new payment attempt. Mutates and returns `record`. */
export function addAttempt(record, input, now = new Date()) {
  return applyAttempt(record, { ...input, reference: referenceFor(record.id, record.attempts.length + 1), now });
}

/**
 * Turn a verified Paystack payment into a receipt. Idempotent: webhook and browser callback may both call it.
 * Returns the receipt, or null if the verification does not match what we asked Paystack to charge.
 */
export async function settle(record, reference, verification, { mode = "live" } = {}) {
  const receipt = buildReceipt(record, reference, verification, mode);
  if (!receipt) return null;
  if (record.status === "paid") return record;
  const storage = getStorage();
  await storage.putJSON(receiptKey(record.id), receipt);
  await storage.remove(pendingKey(record.id));
  return receipt;
}
