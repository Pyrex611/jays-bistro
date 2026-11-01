# Merchant portal (`/merchant`) — "Kitchen Console"

## Why this design
The owner works from a phone between customers, so the console is **mobile-first**, one-handed, with five bottom tabs and the few controls that matter at the top.

| Tab | What it does |
|---|---|
| **Overview** | Greeting and open/closed status · pause/resume orders · today's sales, orders, average · **Needs attention** (orders in the kitchen with a one-tap next step) · sold-out chips · quick actions · **Going live** progress |
| **Menu** | Search/filter all dishes · flip **In stock / Sold out** per dish · tap a dish to edit · **Add dish** · Edit categories |
| **Home** | Choose the hero carousel (up to **12**) and the two feature cards, reorder with arrows, **live preview** using the real storefront components |
| **Orders** | Paid orders. Today / 7 / 30 days. Sales, orders, average, sales per day, **busiest hours**, **pickup vs delivery**, **payment methods**, top sellers, and the **kitchen workflow** New → Preparing → Ready → Completed with filters. Test payments are hidden from sales unless you include them |
| **Settings** | Eight cards with a section strip: **Ordering** · **Delivery** (areas with fee/minimum/ETA, free-delivery threshold, note) · **Fees** (online payment fee + live calculator) · **Hours** (per day + closures) · **Business** (WhatsApp, phone, address, pickup note, announcement) · **Alerts** (recipients, events, test alert preview, log) · **Go live** (status of each integration, checklist, reset demo data) · **Security** (password, sign out) |

Public settings (Ordering, Delivery, Fees, Hours, Business) edit the **draft** and go live with **Publish**. Alerts and Security are private and save on their own. Settings are normalised on publish: an invalid day (closing before opening) is closed, an invalid WhatsApp number falls back to the default; the console warns while you type.

**Demo mode:** with no storage connected the console opens with the setup password `jays-setup`, shows a demo banner, and keeps everything in this browser ([DEMO_MODE.md](DEMO_MODE.md)). Orders, statuses and alerts are simulated; nothing is sent.

Header: **Taking orders** switch. It publishes *immediately and alone* (it never publishes other half-finished edits), because "we're closed/overwhelmed" can't wait.

Everything else is edited as a **draft**; a sticky "Unpublished changes — Discard / Publish" bar appears. Publishing is explicit (nobody wrecks the live menu with a half-typed price), validated server-side, and versioned: if another device published meanwhile you choose *Load latest* or *Publish mine anyway*.

Safeguards: confirm-by-second-tap delete · price must be whole naira · name/description limits match the card layout · photos are compressed in the browser and checked by byte-signature on the server · leaving with unpublished edits triggers the browser's warning.

## How the password lock works without an auth provider

**Your idea** (store the password in an S3 bucket and compare) is sound *if the comparison happens on the server*. If the browser fetched the password and compared it itself, the password would be public and the check bypassable. So:

```
Browser ──password (HTTPS)──▶ /api/merchant/auth (Vercel function)
                                  │ reads config/merchant.json from the PRIVATE bucket (scrypt hash + salt)
                                  │ compares in constant time
                                  ▼
            ◀── Set-Cookie: jb_merchant=<signed token>; HttpOnly; Secure; SameSite=Strict; Path=/api
```

- The bucket stays private except `images/*`. Only the server holds the AWS keys.
- Only a **scrypt hash** is stored (never the password). A leaked bucket object is useless without brute-forcing a slow hash.
- **First login:** the starter password from the `MERCHANT_BOOTSTRAP_PASSWORD` env var works until you set your own; the console then forces a change. After that the env var is ignored.
- **Session:** an HMAC-signed token (secret = `SESSION_SECRET`), 12 hours, in an HttpOnly cookie that JavaScript cannot read. It embeds a fingerprint of the current password hash, so **changing the password signs out every other device**.
- **Brute force:** 5 wrong attempts per IP per 15 minutes → locked (stored in the bucket, auto-cleaned by lifecycle), plus a fixed delay per attempt.
- **CSRF:** `SameSite=Strict` cookie **and** a required custom header (`X-Requested-With: jb-portal`) on every write.
- **Not discoverable:** `robots.txt` disallows `/merchant`, the page sends `noindex`, nothing links to it.
- Every protected endpoint calls `requireMerchant()` first; there is no client-side-only gate.

**Honest limits:** one shared password (no per-person audit trail), and no 2FA. That is the trade-off of "no auth provider". If staff ever need their own access, the upgrade path is a real provider (see ADR-0005).

## Storage layout (S3)
```
config/merchant.json           password hash (private)
config/attempts/<ip-hash>.json login throttle (private, 1-day lifecycle)
data/menu.json                 the published menu document (private; served via /api/menu)
images/<time>-<rand>.webp      uploaded dish photos (public-read, immutable cache)
invoices/pending/<id>.json     unpaid invoices (private, 3-day lifecycle)
receipts/<yyyy>/<mm>/<id>.json paid receipts (private, kept)
```
