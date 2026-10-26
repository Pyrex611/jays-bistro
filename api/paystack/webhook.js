import { allow, parseBody, send } from "../_lib/http.js";
import { idFromReference, isValidId, loadInvoice, settle } from "../_lib/invoices.js";
import { paystackMode, verifyTransaction } from "../_lib/paystack.js";

/**
 * POST /api/paystack/webhook   (set this URL in Paystack Dashboard → Settings → API Keys & Webhooks)
 *
 * Settles the invoice even if the customer closed the tab before returning to the site.
 * We do NOT trust the payload: it only tells us WHICH reference to look at; the verdict comes from
 * Paystack's verify API (server-to-server, authenticated with the secret key). Always answers 200 so Paystack doesn't retry endlessly.
 */
export default async function handler(req, res) {
  if (!allow(req, res, ["POST"])) return;
  try {
    const event = parseBody(req);
    const reference = event?.data?.reference;
    if (event?.event === "charge.success" && reference && paystackMode() === "live") {
      const id = idFromReference(reference);
      if (isValidId(id)) {
        const record = await loadInvoice(id);
        if (record && record.status !== "paid") {
          const verification = await verifyTransaction(reference);
          await settle(record, reference, verification, { mode: "live" });
        }
      }
    }
  } catch (e) {
    console.error("Webhook error:", e.message);
  }
  send(res, 200, { received: true });
}
