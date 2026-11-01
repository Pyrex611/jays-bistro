# ADR-0006: Paystack hosted checkout, expiring invoices, receipts

- **Status:** Accepted
- **Date:** 2026-10-26

## Decision
- **Paystack redirect flow** (server `initialize` → hosted page → callback to `/invoice/<id>`). No Paystack public key or card UI in our bundle; the secret key lives in `PAYSTACK_SECRET_KEY` (server env only).
- **Invoice lifecycle:** `invoices/pending/<id>.json` (24 h validity; S3 lifecycle deletes at 3 days) → on verified payment `receipts/<yyyy>/<mm>/<id>.json`. One URL serves invoice, receipt and expired states.
- **Trust model:** only Paystack's `verify` API settles a payment, and only for the exact kobo amount of that attempt in NGN. Webhook and redirect are triggers, never evidence.
- **WhatsApp checkout** creates the same invoice and shares its link, so WhatsApp orders can also be paid online and become receipts.
- **Mock mode** (no key, not production) enables full end-to-end testing without Paystack; receipts are stamped TEST.

## Alternatives
Paystack Inline popup (needs public key + more client code, weaker on some mobile browsers) · Payment links without invoices (no itemised receipt, no analytics) · Webhook-only settlement (fails if the webhook is delayed while the customer is staring at the page).

## Consequences
✅ Real receipts and sales analytics. ✅ No payment data touches our servers. ⚠️ Verification needs Paystack reachable; the page keeps polling and the webhook is the backstop. ⚠️ Raw-body signature checking isn't available on Vercel's parsed body, which is why verification goes through the API.
