import { allow, baseUrl, fail, ok, parseBody } from "../_lib/http.js";
import { loadMenuDoc } from "../_lib/menuStore.js";
import { addAttempt, isExpired, isValidId, loadInvoice, saveInvoice, settle, validateCustomer } from "../_lib/invoices.js";
import { initializeTransaction, paystackMode, verifyTransaction } from "../_lib/paystack.js";

const idFrom = (req) => req.query?.id ?? new URL(req.url, "http://x").pathname.split("/").filter(Boolean).pop();
const queryOf = (req, key) => req.query?.[key] ?? new URL(req.url, "http://x").searchParams.get(key);

/** What the browser is allowed to see. */
const view = (r) => ({
  id: r.id, code: r.code, status: r.status, channel: r.channel, createdAt: r.createdAt, expiresAt: r.expiresAt,
  items: r.items, subtotal: r.subtotal, deliveryFee: r.deliveryFee, total: r.total, fulfilment: r.fulfilment,
  customer: r.customer, payment: r.payment ? { ...r.payment, reference: r.payment.reference } : undefined,
});

/**
 * /api/invoice/:id
 *   GET   → invoice (pending) or receipt (paid). When a payment has been attempted it is confirmed with Paystack first.
 *           Add ?reference=… (Paystack's redirect does this) to check a specific attempt.
 *   POST  { action:"pay", fulfilment, customer } → starts a Paystack payment for this invoice → { authorizationUrl }
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET", "POST"])) return;
  const id = idFrom(req);
  if (!isValidId(id)) return fail(res, 404, "We couldn't find that invoice.");

  const record = await loadInvoice(id);
  if (!record) return fail(res, 404, "We couldn't find that invoice. It may have expired.", { status: "missing" });
  if (record.status === "paid") return req.method === "GET" ? ok(res, { status: "paid", receipt: view(record), mode: record.payment?.mode }) : fail(res, 409, "This invoice has already been paid.", { status: "paid" });

  if (req.method === "GET") {
    // Confirm any payment attempt with Paystack (covers: customer returned from Paystack, or paid in another tab/bank app).
    const wanted = queryOf(req, "reference");
    const refs = [wanted, ...[...record.attempts].reverse().map((a) => a.reference)].filter(Boolean);
    for (const ref of [...new Set(refs)].slice(0, 3)) {
      const attempt = record.attempts.find((a) => a.reference === ref);
      if (!attempt) continue;
      try {
        const verification = await verifyTransaction(ref, { mockApproved: queryOf(req, "mock") === "success", mockAmountKobo: attempt.amountKobo });
        const receipt = await settle(record, ref, verification, { mode: paystackMode() });
        if (receipt) return ok(res, { status: "paid", receipt: view(receipt), mode: receipt.payment.mode });
      } catch (e) {
        console.error("Verify failed:", e.message);
      }
    }
    if (isExpired(record)) return fail(res, 410, "This invoice has expired.", { status: "expired", code: record.code });
    return ok(res, { status: "pending", invoice: view(record), checking: Boolean(wanted) });
  }

  // POST — pay
  if (isExpired(record)) return fail(res, 410, "This invoice has expired. Please place a new order.", { status: "expired" });
  const body = parseBody(req);
  if (body.action !== "pay") return fail(res, 400, "Unknown action.");

  const doc = await loadMenuDoc();
  if (!doc.settings.acceptingOrders) return fail(res, 403, "We're not taking orders right now.", { code: "closed" });
  const fulfilment = body.fulfilment === "delivery" ? "delivery" : "pickup";
  if (fulfilment === "delivery" && !doc.settings.deliveryEnabled) return fail(res, 400, "Delivery isn't available right now. Choose pickup instead.");
  if (paystackMode() === "off") return fail(res, 503, "Online payment isn't switched on yet. Please pay via WhatsApp.", { code: "payments_off" });

  const v = validateCustomer(body.customer, fulfilment);
  if (!v.ok) return fail(res, 422, "Please check your details.", { fields: v.errors });

  const { reference, amountKobo } = addAttempt(record, { fulfilment, settings: doc.settings, customer: v.customer });
  try {
    const init = await initializeTransaction({
      email: v.customer.email, amountKobo, reference, callbackUrl: `${baseUrl(req)}/invoice/${record.id}`,
      metadata: { invoiceId: record.id, code: record.code, customer: v.customer.name },
    });
    await saveInvoice(record);
    return ok(res, { authorizationUrl: init.authorizationUrl });
  } catch (e) {
    console.error("Paystack initialize failed:", e.message);
    return fail(res, 502, "We couldn't reach the payment provider. Please try again.");
  }
}
