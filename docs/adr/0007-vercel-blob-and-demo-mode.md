# ADR-0007: Vercel Blob as the target store; ship a capability-driven demo first

- **Status:** Proposed. Becomes Accepted when the owner approves going live (storage not connected yet by design)
- **Date:** 2026-11-01
- **Supersedes (when accepted):** the S3 default in [ADR-0005](0005-s3-storage-and-password-lock.md). The password lock, cookie, throttle and storage *interface* are unchanged.

## Context
The owner wants everything on one platform (Vercel) and wants to see and approve **all** pages and features before any account
is connected. Storage did not exist yet, so nothing could be shown on the live site.

## Decision
1. **Demo mode first** ([DEMO_MODE.md](../DEMO_MODE.md)): every integration has a real and a demo implementation chosen by `capabilities`.
2. **Vercel Blob replaces S3 as the default store at go-live**, behind the existing `getStorage()` interface (`getJSON/putJSON/remove/list/putBinary/publicUrl`). The S3 driver stays (≈100 lines, tested) as an alternative.
3. **Two Blob stores**: a **public** one for dish photos (and nothing else), a **private** one for the menu document, settings, invoices, receipts, alert log and the password hash. Vercel allows unlimited stores on every plan.
4. Retention: receipts keep totals forever; purge customer phone/address after 12 months (default; owner to confirm).

## Research findings (Vercel docs as read on 2026-09-23 and 2026-11-01: verify again at go-live)
| Topic | Finding | Consequence |
|---|---|---|
| Hobby quota | 1 GB stored; first 10,000 simple ops/month; first 2,000 advanced ops (uploads, list, copy)/month; 10 GB transfer | Plenty: a menu of 64 dishes, ~hundreds of JSON receipts/month |
| Rate limits | Hobby: 20 simple ops/s, 15 advanced ops/s | Fine for one kitchen |
| Over the limit | Blob access is **blocked** until 30 days pass (no overage bill; warning emails) | Stay under 2,000 uploads/month: each order writes ~2 objects (pending → receipt) |
| Caching | Cache hits don't count as simple operations | Serve the menu through the edge-cached `/api/menu` and public photo URLs |
| Writes | Overwrite is opt-in; conditional writes (`ifMatch`) exist | Use them for the versioned menu document |
| Lifecycle | **No TTL** | A daily Vercel Cron job deletes expired pending invoices and attempt files (Hobby cron: once/day, production only) |
| Commercial use | **Hobby is restricted to non-commercial personal use** | **A restaurant taking real payments needs Pro** before go-live |

## Alternatives considered
- Keep S3: works today, but a second vendor, keys to manage, and the AWS console steps in `docs/AWS_SETUP.md`.
- One private store + an image proxy function: fewer stores, but every photo costs a function invocation and cold starts; two stores is simpler.
- Supabase/Postgres: rejected earlier (ADR-0002); JSON documents are enough at this scale.

## Consequences
✅ Customers and owner can try everything now; nothing is built twice. ✅ Go-live is configuration plus a short, listed amount of server work. ⚠️ Demo state is browser-local, so a multi-device demo is not possible until storage exists. ⚠️ Pro plan cost before taking real orders.
