# PLAN — Jay's Bistro Ordering Platform

> *How and when.* Reads with [INTENT.md](INTENT.md). Update at the end of **every** sprint. ✅ done · 🟡 in progress · ⬜ not started.

**Plan version:** 2.0 — 2026-10-26 · **Current:** Sprint 2 delivered → Sprint 3 next

## 1. Roadmap
| Sprint | Theme | Outcome | Status |
|---|---|---|---|
| S0 | Planning | INTENT, PLAN, CLAUDE, docs | ✅ |
| S1 | Layout migration | Bonti layout + chatbot (live at jays-bistros.vercel.app) | ✅ |
| **S2** | **Brand, commerce, merchant console** | Logo theme · 64 items + search · Paystack · invoices/receipts · `/merchant` | ✅ (pending real-device + Paystack test-card QA) |
| S3 | SEO + concierge + notifications | Prerender or Next.js decision · concierge behind `/api` · kitchen alerts · order statuses | ⬜ |
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

## 3. Sprint 3 — next
- [ ] T3.1 Move the concierge behind `/api` (key server-side, rate limit) — ADR-0003
- [ ] T3.2 SEO: decide prerender vs Next.js; real HTML for `/` and `/menu`
- [ ] T3.3 Notify the kitchen when an order is paid (WhatsApp/email/SMS — owner picks, Q10)
- [ ] T3.4 Order status in the console (preparing → ready → delivered) and on the receipt
- [ ] T3.5 Delivery zones / estimated time (Q9, Q11)
- [ ] T3.6 Replace stock photos; photo guidelines card in the console
- [ ] T3.7 Receipt/invoice e-mail (Paystack already has the customer's e-mail; use a transactional provider)

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

## 6. Risks (live)
| Risk | Mitigation |
|---|---|
| Owner forgets the password | Delete `config/merchant.json` in S3 → starter password works again (runbook) |
| Single shared password | Strong-password rule, throttle, session revocation on change; upgrade path in ADR-0005 |
| Paystack delay on bank transfers | Page polls ~30 s; webhook settles regardless |
| JSON-in-S3 won't scale to thousands of orders/month | Revisit when listing slows; receipts are already filed by month |
| 56 dishes use stock photos | T3.6; per-dish photo upload is already in the console |
| Gemini key still browser-exposed | Restrict the key now; T3.1 |
| Client-rendered SPA limits SEO | T3.2 |

## 7. Working agreements
Plan → build → verify → document. Conventional commits. AI agents follow [CLAUDE.md](CLAUDE.md).
