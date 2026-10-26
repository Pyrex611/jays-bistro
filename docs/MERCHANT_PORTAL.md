# Merchant portal (`/merchant`) — "Kitchen Console"

## Why this design
The owner works from a phone between customers, so the console is **mobile-first**, one-handed, with four bottom tabs and the few controls that matter at the top.

| Tab | What it does |
|---|---|
| **Menu** | Search/filter all dishes · flip **In stock / Sold out** per dish · tap a dish to edit · **Add dish** · Edit categories |
| **Home** | Choose what appears in the hero carousel (up to 6) and the two feature cards, reorder with arrows, **live preview** that uses the real storefront components |
| **Orders** | Paid orders only. Today / 7 / 30 days. Sales, orders, average order, sales-per-day bars, top sellers, order list with call/WhatsApp buttons |
| **Settings** | Delivery on/off, delivery fee, minimum order, change password, sign out |

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
