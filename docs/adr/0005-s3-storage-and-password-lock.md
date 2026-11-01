# ADR-0005: S3 for storage; password-locked merchant portal with no auth provider

- **Status:** Accepted
- **Date:** 2026-10-26

## Context
The owner wants a merchant portal on its own page, protected by a password, without an auth provider, and suggested keeping the password in an S3 bucket and comparing against it. The site is a Vite SPA on Vercel; we need server-side code for Paystack anyway.

## Decision
- **Vercel Functions** (`/api`) are the only code that touches storage and secrets.
- **One S3 bucket** holds everything. Only `images/*` is public-read; all else is private (layout in `docs/MERCHANT_PORTAL.md`).
- **Password check on the server**, against a **scrypt hash** in `config/merchant.json` (never plain text, never readable by the browser). Starter password from env; forced change on first login.
- **Session**: HMAC-signed, HttpOnly, SameSite=Strict cookie, 12 h, bound to the password-hash fingerprint (changing the password revokes all sessions).
- **Throttle**: 5 failures / IP / 15 min.
- **Storage interface** with S3, local-file and in-memory drivers, so dev needs no AWS and tests are fast.
- **Menu = one versioned JSON document** (`data/menu.json`) with optimistic concurrency; the bundled catalogue is the fallback.

## Why not the browser-side check
Anything the browser can read, anyone can read; anything the browser decides, anyone can bypass. The check must live where the secret lives.

## Consequences
- ✅ No third-party auth, no monthly cost beyond S3 pennies; simple mental model.
- ✅ Free local dev (`.local-data/`), 100 automated tests including the lock, CSRF header, throttling and password change.
- ⚠️ Single shared password, no 2FA, no per-person audit trail.
- ⚠️ JSON-in-S3 has no queries: orders listing reads receipt files by month (fine for hundreds per month; revisit around a few thousand).
- ⚠️ Last-write-wins on S3 beyond the version check (acceptable for one merchant).
- Upgrade path: swap `requireMerchant` for a real provider and move receipts to a database; the API shapes stay.
