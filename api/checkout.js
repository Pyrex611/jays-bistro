import { allow, baseUrl, fail, ok, parseBody } from "./_lib/http.js";
import { loadMenuDoc } from "./_lib/menuStore.js";
import { resolveOrderLines } from "./_lib/orderLines.js";
import { addAttempt, buildInvoice, saveInvoice, validateCustomer } from "./_lib/invoices.js";
import { initializeTransaction, paystackMode } from "./_lib/paystack.js";
import { computeTotals } from "../src/lib/pricing.js";

/**
 * POST /api/checkout
 *   { items:[{id,quantity}], fulfilment:"pickup"|"delivery", intent:"pay"|"invoice", customer? }
 *
 *   intent "pay"     → needs full customer details → { invoiceId, invoiceUrl, authorizationUrl }   (Paystack)
 *   intent "invoice" → no details needed           → { invoiceId, invoiceUrl, code, expiresAt, total } (WhatsApp)
 *
 * Prices, availability, delivery fee and minimum order are all decided HERE from the live menu.
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["POST"])) return;
  const body = parseBody(req);

  const doc = await loadMenuDoc();
  const settings = doc.settings;
  if (!settings.acceptingOrders) return fail(res, 403, "We're not taking orders right now. Please check back soon.", { code: "closed" });

  const fulfilment = body.fulfilment === "delivery" ? "delivery" : "pickup";
  if (fulfilment === "delivery" && !settings.deliveryEnabled) return fail(res, 400, "Delivery isn't available right now. Choose pickup instead.", { code: "no_delivery" });

  const resolved = resolveOrderLines(body.items, doc);
  if (!resolved.ok) return fail(res, resolved.code === "sold_out" || resolved.code === "unknown_item" ? 409 : 400, resolved.error, { code: resolved.code, soldOut: resolved.soldOut });

  const totals = computeTotals(resolved.lines.map((l) => ({ unitPrice: l.item.price, quantity: l.quantity })), fulfilment, settings);
  if (totals.belowMinimum) return fail(res, 400, `The minimum order is ₦${settings.minOrder.toLocaleString("en-NG")}. Add ₦${totals.shortBy.toLocaleString("en-NG")} more.`, { code: "below_minimum" });

  const intent = body.intent === "pay" ? "pay" : "invoice";
  let customer = {};
  if (intent === "pay") {
    const v = validateCustomer(body.customer, fulfilment);
    if (!v.ok) return fail(res, 422, "Please check your details.", { fields: v.errors });
    customer = v.customer;
    if (paystackMode() === "off") return fail(res, 503, "Online payment isn't switched on yet. You can still order on WhatsApp.", { code: "payments_off" });
  }

  const record = buildInvoice({ lines: resolved.lines, fulfilment, channel: intent === "pay" ? "web" : "whatsapp", settings, customer });
  const invoiceUrl = `${baseUrl(req)}/invoice/${record.id}`;

  if (intent === "invoice") {
    await saveInvoice(record);
    return ok(res, { invoiceId: record.id, invoiceUrl, code: record.code, expiresAt: record.expiresAt, total: record.total });
  }

  const { reference, amountKobo } = addAttempt(record, { fulfilment, settings, customer });
  try {
    const init = await initializeTransaction({
      email: customer.email,
      amountKobo,
      reference,
      callbackUrl: invoiceUrl,
      metadata: { invoiceId: record.id, code: record.code, customer: customer.name },
    });
    await saveInvoice(record);
    return ok(res, { invoiceId: record.id, invoiceUrl, authorizationUrl: init.authorizationUrl });
  } catch (e) {
    console.error("Paystack initialize failed:", e.message);
    return fail(res, 502, "We couldn't reach the payment provider. Please try again, or order on WhatsApp.");
  }
}
