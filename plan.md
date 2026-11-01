# PLAN — Jay's Bistro Ordering Platform

> *How and when.* Reads with [INTENT.md](INTENT.md). Update at the end of **every** sprint. ✅ done · 🟡 in progress · ⬜ not started.

**Plan version:** 2.1 — 2026-11-01 · **Current:** Sprint 3 demo build delivered (pending real-device QA and owner approval) → go-live integration next

## 1. Roadmap
| Sprint | Theme | Outcome | Status |
|---|---|---|---|
| S0 | Planning | INTENT, PLAN, CLAUDE, docs | ✅ |
| S1 | Layout migration | Bonti layout + chatbot (live at jays-bistros.vercel.app) | ✅ |
| **S2** | **Brand, commerce, merchant console** | Logo theme · 64 items + search · Paystack · invoices/receipts · `/merchant` | ✅ (pending real-device + Paystack test-card QA) |
| **S3** | **Demo build + look & first screen + business settings** | Pastel theme · scroll-aware menu · stepper · info sheet · delivery zones/fees/hours · console Overview/Orders/Settings · simulated alerts · demo payments · photo tooling | ✅ (pending real-device QA; see §3) |
| S3b | Go-live integration | Vercel Blob driver · order status + notifications endpoints · email channel · retention cron · domain move | ⬜ (on approval; docs/DEMO_MODE.md) |
| S3c | SEO + concierge | Prerender or Next.js decision · concierge behind `/api` · per-host canonical/noindex | ⬜ |
| S4 | Growth | Popular row from data · reorder · item options · promo slides | ⬜ |
| S5 | Hardening | Playwright E2E · Lighthouse CI · axe a11y · monitoring · owner handbook | ⬜ |

## 2. Sprint 2 — delivered
### Tasks
- [x] T2.1 Logo palette sampled → Tailwind tokens (`leaf`, `sun`, `cream`, `ink`), restyled every component
- [x] T2.2 Line-art icon set (7 categories + WhatsApp glyph); logo emblem crop for avatars/favicon
- [x] T2.3 Full catalogue (64), stable image paths (`public/menu`), `npm run images:migrate`
- [x] T2.4 Search (`lib/search.js`), grouped sections, sticky pills, open/closed strip, sticky tray bar
- [x] T2.5 Canonical domain everywhere (config, OG, sitemap, robots)
- [x] T2.6 Storage abstraction (S3 / filesystem / memory) + `dev/apiPlugin.js` so `npm run dev` serves `/api`
- [x] T2.7 Password lock: scrypt hash in private storage, signed HttpOnly cookie, throttle, CSRF header, forced first-login change
- [x] T2.8 Menu document: validation (shared), versioned publish, 409 conflict handling, public `/api/menu` with fallback
- [x] T2.9 Image upload (browser compress → server byte-sniff → S3 `images/`)
- [x] T2.10 Checkout: server pricing, availability, delivery fee, minimum order, paused store
- [x] T2.11 Paystack: initialize, verify (exact kobo/NGN), webhook, mock mode
- [x] T2.12 Invoice → receipt lifecycle with expiry; `/invoice/:id` (pending, paid, expired, missing)
- [x] T2.13 Success animation + receipt (torn edge, stamp, print/share/WhatsApp, next steps)
- [x] T2.14 Merchant console: Menu, Home (live preview), Orders (KPIs), Settings, quick pause switch
- [x] T2.15 Tray persistence; WhatsApp tab-open fix for iOS; sold-out handling in chat
- [x] T2.16 Tests: **100 passing** (13 files) incl. 33 API tests for auth, publishing, payments, webhook, orders
- [x] T2.17 Docs: UX research, merchant portal, checkout, AWS setup, ADRs 0005–0006, runbook
- [ ] T2.18 **Owner QA** (checklist below) · [ ] T2.19 **Cloud setup** (`docs/AWS_SETUP.md`) · [ ] T2.20 Replace the 56 stock photos over time

### Acceptance criteria
1. Home: header (logo emblem, name, "Arabian Tea · Makurdi") → open/closed strip → hero (4) → sub-hero (orange + green) → search → sticky pills → menu sections for all 6 categories (64 dishes).
2. Search "jollof" shows only matching dishes with a count; clearing returns to sections.
3. Tray bar appears after the first add; tray footer shows round WhatsApp button left of Checkout.
4. Checkout → details → Pay → (Paystack) → receipt with correct totals; receipt URL still works later.
5. WhatsApp button opens WhatsApp with the order and an invoice link; the link pays and becomes the receipt; after 24 h it says expired.
6. `/merchant`: wrong password rejected; 5 wrong tries lock out; starter password forces a new one; after publishing, `/` reflects it within ~30 s.
7. Sold-out dish: greyed on the menu, cannot be added, rejected by the server if forced.
8. Pause orders: banner on the site, both checkout buttons disabled, API refuses.
9. `npm run lint && npm test && npm run build` pass. Home JS ≤ 150 KB gzip (112 KB).

### Owner QA checklist
| Check | iPhone Safari | Android Chrome |
|---|:-:|:-:|
| Theme feels like the logo; text legible on green and orange | ☐ | ☐ |
| Cutout dishes look right on the green tiles; photo dishes fill their cards | ☐ | ☐ |
| Sticky pills stay under the header; no layout jump when the URL bar collapses | ☐ | ☐ |
| Search keyboard shows "search"; no zoom on focus | ☐ | ☐ |
| Tray persists after refresh and after returning from Paystack | ☐ | ☐ |
| WhatsApp button opens WhatsApp (not blocked) with the invoice link | ☐ | ☐ |
| Paystack test card, test bank transfer and USSD (if enabled on your account) all reach the receipt | ☐ | ☐ |
| Receipt: Save PDF, Share, Message us all work | ☐ | ☐ |
| `/merchant` is usable one-handed; photo upload from camera/gallery works | ☐ | ☐ |
| Console publish → storefront updates; sold-out switch works | ☐ | ☐ |

### Definition of Done (every sprint)
Acceptance met · lint/test/build green · new logic has unit tests, new screens a render test, new endpoints API tests · no secrets committed (new env vars in `.env.example`) · keyboard + labels + contrast ≥ 4.5:1 · docs updated · Vercel preview checked on a real phone.

## 3. Sprint 3: demo build (delivered) and go-live (next)

> The authoritative task list with decisions is [TASK.md](TASK.md). Direction: **demo first**: every page and feature usable now, integrations mocked behind the real interfaces ([docs/DEMO_MODE.md](docs/DEMO_MODE.md), [ADR-0007](docs/adr/0007-vercel-blob-and-demo-mode.md)).

### Delivered
- [x] T3.1 Eucalyptus pastel surfaces + apricot left sub-hero, contrast test, no-photo icon tiles (A1–A3, A11, A13)
- [x] T3.2 Continuous menu, scroll-spy pills (no "All"), search collapsing into a magnifier, in-place quantity control, suya-skewer protein icon (A4–A6, A9)
- [x] T3.3 Tighter first screen; info sheet replaces the open/pickup strip; hero up to 12; teas in the sub-hero (A7, A8, A10)
- [x] T3.4 Delivery zones (fee/minimum/ETA), free-delivery threshold, prep time, service-fee line with calculator, hours + closures, business details, announcement (B1–B6, D5)
- [x] T3.5 Demo layer: capabilities, browser-local backend, seeded orders, demo payment page, order status workflow, simulated alerts (C1–C8 UI, F)
- [x] T3.6 Console: Overview, Menu, Home, Orders (workflow + peak hours + splits), Settings (8 cards incl. Alerts and Go-live)
- [x] T3.7 Payment modes demo/mock/test/live, TEST/DEMO stamps, test orders excluded from KPIs (D1)
- [x] T3.8 Photo curation + apply tooling, "no two dishes share a photo" test (images)
- [x] T3.9 Docs, runbook ([SPRINT-3-RUNBOOK](docs/SPRINT-3-RUNBOOK.md)); tests green

### Owner QA for Sprint 3 (iPhone Safari and Android Chrome, at 360 px and 390 px)
| Check | iPhone | Android |
|---|:-:|:-:|
| Header, hero, sub-hero, pill bar and the first row of dishes are visible on load | ☐ | ☐ |
| Sage and apricot cards feel like the logo colours; text is easy to read on them | ☐ | ☐ |
| Scrolling the menu: the active pill changes and slides into view; tapping a pill jumps smoothly | ☐ | ☐ |
| Magnifier opens search with the keyboard and no page zoom; back arrow restores the pills | ☐ | ☐ |
| **+** becomes **− 1 +** in place; **−** at 1 removes; the tray bar total updates | ☐ | ☐ |
| (i) sheet shows hours, areas, fees, WhatsApp and call buttons | ☐ | ☐ |
| Delivery checkout: area list, fee, ETA and online-payment-fee line are clear; demo payment ends on a DEMO receipt | ☐ | ☐ |
| Console (second tab): new order appears under Needs attention and moves through the four statuses | ☐ | ☐ |
| Settings: change a zone fee and hours → Publish → storefront shows them | ☐ | ☐ |
| Alerts: Send test alert shows the email preview; Go live card lists what is needed | ☐ | ☐ |

### Go-live (needs the owner's approval; Pro plan first)
- [ ] T3.10 Vercel Pro; create Blob stores (public photos, private data); Blob driver behind `getStorage()` (ADR-0007)
- [ ] T3.11 `api/merchant/orders/[id]/status` and `api/merchant/notifications`; email channel (provider decision Q20) called from `settle()`, idempotent
- [ ] T3.12 Daily cron: purge expired pending invoices and attempt files; retention for customer phone/address (Q32)
- [ ] T3.13 Paystack test key → live key; webhook; service-fee numbers checked against the real plan; webhook-reachability check in the go-live card
- [ ] T3.14 Domain move to `jays-bistro.vercel.app`; per-host canonical + `noindex` (Q37); `PUBLIC_BASE_URL`
- [ ] T3.15 Choose real photos (`npm run photos:curate`), then self-host into `public/menu/`
- [ ] T3.16 Concierge behind `/api` (ADR-0003) · SEO prerender decision · receipt email to customers (TASK C9)

## 4. Sprint 4 / 5
S4: popular row from real sales · reorder from receipt · item options (spice/extras) · promo slides in the hero.
S5: Playwright golden-path E2E (browse → pay → receipt; console publish) · Lighthouse CI budgets · axe checks · error monitoring · backups of `data/menu.json` · 1-page owner handbook.

## 5. Decision log
| Date | Decision | Where |
|---|---|---|
| 2026-10-24 | Vite + React kept for the layout sprint | ADR-0001 |
| 2026-10-26 | S3 + password-locked console replaces Supabase | ADR-0005 (supersedes 0002) |
| 2026-10-26 | Paystack redirect + invoices/receipts | ADR-0006 (supersedes 0004) |
| 2026-10-26 | Full catalogue; search back; canonical `jays-bistro.vercel.app`; GitHub Pages deploy removed | INTENT §11 |
| 2026-10-26 | Concierge key move to `/api` scheduled for S3 | ADR-0003 |
| 2026-10-31 | Palette: Eucalyptus green surfaces + apricot left sub-hero; suya skewer protein icon; search collapses into a magnifier | DESIGN_SYSTEM, TASK |
| 2026-11-01 | Demo-first: capability-driven demo layer; Vercel Blob proposed as the go-live store (two stores); Pro plan needed for commercial use | ADR-0007, DEMO_MODE |

## 6. Risks (live)
| Risk | Mitigation |
|---|---|
| Owner forgets the password | Delete `config/merchant.json` in S3 → starter password works again (runbook) |
| Single shared password | Strong-password rule, throttle, session revocation on change; upgrade path in ADR-0005 |
| Paystack delay on bank transfers | Page polls ~30 s; webhook settles regardless |
| JSON-in-S3 won't scale to thousands of orders/month | Revisit when listing slows; receipts are already filed by month |
| Stock photos / nine dishes on icon tiles | `npm run photos:curate`; per-dish upload is in the console |
| Demo data is browser-local (a phone order is not visible on another device) | Documented; connect storage to share across devices (T3.10) |
| Vercel Hobby is non-commercial only | Upgrade to Pro before real orders (ADR-0007) |
| First-screen layout unverified on real phones | Owner QA table above |
| Gemini key still browser-exposed | Restrict the key now; T3.1 |
| Client-rendered SPA limits SEO | T3.2 |

## 7. Working agreements
Plan → build → verify → document. Conventional commits. AI agents follow [CLAUDE.md](CLAUDE.md).
