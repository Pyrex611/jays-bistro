import { computeTotals, toKobo } from "./pricing.js";

/**
 * Pure invoice/receipt model. The API (api/_lib/invoices.js) and the browser demo backend (src/demo) both build
 * invoices, register payment attempts and issue receipts through these functions, so they can never disagree on money.
 */

export const INVOICE_TTL_MS = 24 * 60 * 60 * 1000;

export const zoneSnapshot = (zone) => (zone ? { id: zone.id, name: zone.name, fee: zone.fee, etaMins: zone.etaMins } : null);
export const isExpired = (record, now = Date.now()) => record.status === "pending" && new Date(record.expiresAt).getTime() < now;

/** @param {{ id:string, code:string, lines:Array<{item:object, quantity:number}>, fulfilment:string, channel:string, settings:object, zoneId?:string|null, customer?:object, now?:Date }} input */
export function buildInvoiceRecord({ id, code, lines, fulfilment, channel, settings, zoneId = null, customer = {}, now = new Date() }) {
  const items = lines.map(({ item, quantity }) => ({ id: item.id, name: item.name, unitPrice: item.price, quantity, lineTotal: item.price * quantity }));
  const totals = computeTotals(items, fulfilment, settings, { zoneId });
  return {
    id,
    code,
    status: "pending",
    channel,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVOICE_TTL_MS).toISOString(),
    items,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    serviceFee: 0, // added when the customer pays online
    total: totals.total,
    fulfilment,
    zone: zoneSnapshot(totals.zone),
    prepMins: settings.prepMins,
    customer,
    attempts: [],
  };
}

/** Re-prices for the chosen fulfilment/zone (adding the online-payment fee) and registers a payment attempt. Mutates `record`. */
export function applyAttempt(record, { reference, fulfilment, zoneId = null, settings, customer, now = new Date() }) {
  const totals = computeTotals(record.items, fulfilment, settings, { zoneId, payOnline: true });
  const zone = zoneSnapshot(totals.zone);
  record.fulfilment = fulfilment;
  record.deliveryFee = totals.deliveryFee;
  record.serviceFee = totals.serviceFee;
  record.total = totals.total;
  record.zone = zone;
  record.customer = customer;
  record.attempts.push({ reference, at: now.toISOString(), fulfilment, zone, deliveryFee: totals.deliveryFee, serviceFee: totals.serviceFee, total: totals.total, amountKobo: toKobo(totals.total) });
  return { record, reference, amountKobo: toKobo(totals.total), totals };
}

/**
 * A verified payment → receipt, or null if the verification doesn't match exactly what we asked to be charged.
 * `verification`: { status, amountKobo, currency?, channel?, paidAt? }
 */
export function buildReceipt(record, reference, verification, mode) {
  if (record.status === "paid") return record;
  const attempt = record.attempts.find((a) => a.reference === reference);
  if (!attempt || verification.status !== "success") return null;
  if ((verification.currency ?? "NGN") !== "NGN") return null;
  if (verification.amountKobo !== attempt.amountKobo) return null;
  return {
    ...record,
    status: "paid",
    fulfilment: attempt.fulfilment,
    zone: attempt.zone ?? null,
    deliveryFee: attempt.deliveryFee,
    serviceFee: attempt.serviceFee ?? 0,
    total: attempt.total,
    payment: { reference, channel: verification.channel ?? "card", paidAt: verification.paidAt ?? new Date().toISOString(), amount: attempt.total, currency: "NGN", mode },
  };
}
