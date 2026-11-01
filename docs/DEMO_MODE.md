# Demo mode: everything visible now, real integrations later

> **Purpose:** let the owner (and anyone approving the build) open **every page and feature** and try it end to end before any
> account is connected. Integrations are mocked behind the same interfaces as the real ones, so connecting them later
> is configuration plus a small, listed amount of server work, not a rebuild.

## How the app decides: capabilities
`GET /api/menu` returns the menu **plus** `capabilities`:

```json
{ "storage": false, "payments": "demo", "email": false, "orderStatus": false }
```

| Capability | Meaning | Demo value → live value |
|---|---|---|
| `storage` | A real store (S3 today, Vercel Blob later) is connected | `false` → `true` |
| `payments` | Checkout mode | `"demo"` → `"test"` (sk_test_…) → `"live"` (sk_live_…) |
| `email` | Kitchen alerts really send | `false` → `true` (when the email channel ships) |
| `orderStatus` | Order workflow is stored server-side | `false` → `true` |

`src/services/runtime.js` holds these. `src/services/api.js` sends each call to the real endpoint **or** to `src/demo/demoApi.js`
depending on them. **Nothing in components checks "am I in demo mode?" except to show honest labels**; flipping a capability
switches the behaviour of that integration by itself.

**When is it demo?** `storageConfigured()` in `api/_lib/storage.js` is `false` when there are no storage variables **in production**
(or when `DEMO_MODE=1` is set). Locally, without `DEMO_MODE=1`, `npm run dev` uses the file driver and behaves as *live*.
If `/api/menu` doesn't exist at all (404, e.g. static hosting) the client also falls back to demo. A server error (5xx) never
flips to demo: a real outage must look like an outage.

## What you can do in demo mode
| Area | What works | How it's mocked |
|---|---|---|
| Storefront | Everything: browse, search, scroll-aware pills, add/stepper, tray, checkout, WhatsApp invoice | Real UI; data from the bundled menu or the owner's browser-local edits |
| Pay online | Full journey ending in a receipt stamped **DEMO** | `/pay/demo/:id` stands in for Paystack (card / transfer / USSD, success or failure) |
| Invoices | 24-hour expiry, pay later, re-pricing pickup↔delivery, receipts | Stored in the browser, same state machine and shared pricing code |
| Console | All five tabs: Overview, Menu, Home, Orders, Settings | `demoApi.merchant.*` mirrors the real API incl. validation and 409 conflicts |
| Orders | 30 days of seeded orders; **New → Preparing → Ready → Completed** | Deterministic seed; five newest orders are always still in the kitchen pipeline |
| Analytics | KPIs, daily sales, busiest hours, pickup/delivery split, payment methods, top sellers | Same `summarize()` / `breakdowns()` as production |
| Settings | Ordering, delivery areas, service fee calculator, hours + closures, business details, announcement, password change | Edits go to the draft; **Publish** makes them live (to this browser) |
| Alerts | Recipients, events, test alert, alert log, exact email preview | Rendered by the real template (`lib/alertTemplate.js`); logged as **simulated**, nothing is sent |
| Go-live | Status of each integration, what's needed, step-by-step checklist | `lib/integrations.js` from `capabilities` |

**Setup password:** `jays-setup`. Change it in Settings → Security; the new password is kept in this browser only.
**Reset:** Settings → Go live → *Reset demo data* clears every `jb:demo:*` key.

## Limits you must know about
- **Browser-local.** A customer's order on one phone does **not** appear in the console on another device, and a WhatsApp
  invoice link opened on a different device shows "not found". To demo the full loop, use one browser (storefront in one tab,
  `/merchant` in another).
- Nothing is sent to anyone: no email, no WhatsApp, no real payments.
- Unsplash stock photos are hot-linked for now (accepted). Nine dishes show an honest icon tile until a real photo exists.

## What is shared with production (so demo can't drift)
`lib/pricing.js` (totals, zones, service fee), `lib/menuDoc.js` (validation), `lib/settings.js` (normalisation), `lib/hours.js`,
`lib/orderStatus.js`, `lib/orderStats.js`, `lib/alertTemplate.js`, `lib/invoiceModel.js`. The demo API tests
(`demo.test.js`) assert the same business rules as the server tests.

## Consolidation checklist (when you approve)
**Configuration only** (each flips by itself once the server reports it):
1. Connect storage (see ADR-0007); `capabilities.storage` becomes `true`; the demo menu/orders stop being used.
2. Add `PAYSTACK_SECRET_KEY` (`sk_test_…` first): `payments` becomes `"test"`; receipts say TEST, excluded from sales KPIs unless included.
3. Replace with `sk_live_…` and the live webhook when the business account is approved.

**Small server work still to write** (the UI and contracts already exist):
| Item | Where | Notes |
|---|---|---|
| Order status endpoint | `api/merchant/orders/[id]/status` | Persist `fulfilmentStatus` on the receipt; `capabilities.orderStatus = true` |
| Notifications endpoint | `api/merchant/notifications` | Private config + log; until then, in live mode the client reports “not connected yet” (501) and the UI explains it |
| Email channel | `api/_lib/notify/` | Provider (Brevo / Gmail SMTP); call from `settle()`; idempotent per invoice |
| Blob storage driver | `api/_lib/storage.js` | Same interface as S3/fs/memory; two stores (public photos, private data) |
| Retention job | Vercel Cron, daily | Purge expired pending invoices and old attempt files (Blob has no TTL) |

**Remove or keep:** `src/demo/` and `MockPaymentPage` can stay (they are the staging and training mode) or be deleted; nothing else imports them except `services/api.js`, `MenuProvider` and the router.
