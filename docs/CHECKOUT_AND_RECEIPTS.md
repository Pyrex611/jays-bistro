# Checkout, invoices and receipts

## The buttons
Tray footer: **[ round WhatsApp ]  [ Checkout ]**
- **Checkout** → details step (pickup/delivery, name, phone, email, address, note) → **Pay ₦X** → Paystack's hosted page (card, bank transfer, USSD) → back to `/invoice/<id>` → receipt.
- **Round WhatsApp button** → creates an expiring invoice, opens WhatsApp with the order and an invoice link. The customer (or the merchant on their behalf) can pay from that link at any time within 24 h.

## One URL, three lives: `/invoice/<id>`
```
pending ──(Paystack confirms exact amount)──▶ paid (receipt)
   └──(24 h, unpaid)──▶ expired (410; file auto-deleted by S3 lifecycle after 3 days)
```
- **Pending:** itemised invoice, countdown ("Valid for 23h 12m"), choose pickup/delivery, enter details, pay.
- **Paid:** success animation (check ring + confetti, motion-reduced for sensitive users) → receipt paper (torn edge, PAID stamp, code like `JB-K3F9Q`, Lagos date/time, items, subtotal, delivery, total, payment method, Paystack reference, customer, pickup/delivery details) → *Save PDF* (browser print), *Share*, *Message us* on WhatsApp → "What happens next".
- **Expired / missing:** friendly page with *Back to the menu* and *Chat with us*.
- The id is 80 random bits, so the link is the access token; pages are `noindex`.

## Correctness rules (all enforced server-side and unit-tested)
1. Prices, availability, delivery fee and minimum order are decided **by the server** from the live menu. The browser sends only `{id, quantity}`.
2. Paystack is the only authority on payment. The return page and the webhook merely say *which reference to ask Paystack about*; `verify` decides.
3. A payment settles only if **status = success, currency = NGN, and amount = the exact kobo we requested for that attempt**. Anything else leaves the invoice pending.
4. Settling is idempotent (webhook and browser can race safely).
5. If the customer switches pickup↔delivery on the invoice page, the total is re-priced and each attempt records its own amount and reference (`<id>-1`, `<id>-2`).
6. Paused store, sold-out items and below-minimum orders are rejected with clear messages (HTTP 403/409/400).
7. If our API is unreachable when the WhatsApp button is tapped, a plain WhatsApp order still opens: ordering never depends on our backend. Business-rule rejections (paused, sold out) are shown instead of bypassed.

## Payment modes
| Mode | When | Behaviour |
|---|---|---|
| **live** | `PAYSTACK_SECRET_KEY` set (`sk_test_…` or `sk_live_…`) | Real Paystack. Test keys + Paystack test cards cost nothing |
| **mock** | no key, not production (local dev, Vercel previews) | Skips Paystack; "pays" instantly; receipts are stamped **TEST** |
| **off** | no key in production | Checkout says payments aren't on yet; WhatsApp invoices still work |

## Webhook
Dashboard → Settings → API Keys & Webhooks → webhook URL `https://jays-bistro.vercel.app/api/paystack/webhook`. It settles invoices when the customer closes the tab before returning. It verifies with Paystack's API instead of trusting the payload.
