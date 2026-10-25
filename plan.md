# PLAN — Jay's Bistro Ordering Platform

> *How and when.* Reads with [INTENT.md](INTENT.md) (why/what). Update this file at the end of **every** sprint:
> tick tasks, record decisions, adjust the next sprint. Status legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked.

**Plan version:** 1.0 — 2026-10-24 · **Current phase:** 1 (delivered) → starting 2

---

## 1. Roadmap

| Phase | Sprint | Theme | Outcome | Status |
|---|---|---|---|---|
| — | S0 | Planning | INTENT, PLAN, CLAUDE, architecture, data model, ADRs | ✅ |
| 1 | **S1** | **Layout migration** | Bonti layout + Jay's brand, chatbot migrated, tests | ✅ (pending device QA) |
| 2 | S2 | Backend foundation | Supabase project, schema, RLS, seed, read path with cache + fallback, AI proxy | ⬜ |
| 2 | S3 | Dashboard: items | Auth, item/category CRUD, image upload, sold-out toggle, archive | ⬜ |
| 2 | S4 | Dashboard: hero | Hero + sub-hero manager, promo slides, scheduling, live preview | ⬜ |
| 3 | S5 | Orders | Order capture (server-priced), orders inbox, status flow | ⬜ |
| 3 | S6 | Analytics | KPI dashboard, funnel, top items, peak hours, CSV export | ⬜ |
| — | S7 | Hardening | E2E tests, a11y + perf audit, backups, monitoring, runbook | ⬜ |

**Phase gate before S2:** decide Vite SPA vs Next.js (see [ADR-0001](docs/adr/0001-stack-for-sprint-1.md)). Default: stay on Vite.

---

## 2. Sprint 1 — Layout migration (delivered)

**Sprint goal:** the storefront looks and feels like Bonti, wears Jay's brand, and orders exactly as before.

### Tasks
- [x] T1.1 Port Bonti tokens to Tailwind (`ink`, `sprout`, shadows, keyframes, fonts) — `tailwind.config.js`, `src/index.css`
- [x] T1.2 Config module (`SITE`, `CHATBOT`, `assetUrl`) — `src/config/site.js`
- [x] T1.3 Menu catalogue: 64 items, 12 live, `imageStyle`, `isActive` — `src/data/menu.js` (generated from legacy data, then reviewed)
- [x] T1.4 Layout slots (hero ids, sub-hero ids) — `src/data/layout.js`
- [x] T1.5 Pure logic: cart reducer + selectors, WhatsApp link, chat helpers, menu model, formatter
- [x] T1.6 `MenuProvider` / `useMenu` seam for Phase 2
- [x] T1.7 Hooks: `useCart`, `useCarousel`, `useEscapeKey`, `useBodyScrollLock`
- [x] T1.8 Components: Header, HeroCarousel, SubHero, CategoryPills, ProductGrid/Card, ProductModal, CartDrawer, ChatWidget, SeoHead
- [x] T1.9 `StorefrontPage` + routes `/`, `/menu`, catch-all redirect
- [x] T1.10 Concierge service: demo mode, header-based API key, validated actions
- [x] T1.11 Tests: 33 passing (cart, whatsapp/format, chat, menu integrity + model, render smoke)
- [x] T1.12 Tooling: `vitest`, `build:ghpages`, `vercel.json` SPA rewrite, `.env.example`, `.gitignore` hardening
- [x] T1.13 AI SDLC docs
- [ ] T1.14 **Device QA** (owner/dev — checklist below)
- [ ] T1.15 **Legacy cleanup commit** (delete unused files — runbook §6)

### Acceptance criteria
1. Home shows: header (logo, name, Makurdi, tray button) → hero carousel (4) → sub-hero (2) → category pills → grid of 12.
2. Tapping any card/slide opens the product sheet; Add to Tray works from card, sheet and chat; badge pops.
3. Tray totals are correct; "Checkout on WhatsApp" opens `wa.me/2348062624447` with the same message format as before.
4. Chat in demo mode answers politely; with a valid key it can add "2 Jollof Rice" and the tray updates.
5. `/menu` loads directly (Vercel rewrite) and scrolls to the menu.
6. `npm run lint && npm test && npm run build` all pass.
7. No horizontal scroll at 320 px; no zoom jump when focusing the chat input on iPhone.

### Definition of Done (applies to every sprint)
- [ ] Acceptance criteria met and demonstrated
- [ ] `npm run lint`, `npm test`, `npm run build` green locally and in CI/Vercel
- [ ] New logic has unit tests; new screens have at least a render smoke test
- [ ] No secrets committed; new env vars added to `.env.example`
- [ ] Accessibility: keyboard reachable, labelled controls, focus visible, contrast ≥ 4.5:1 for body text
- [ ] Docs updated (INTENT requirement status, this PLAN, ARCHITECTURE / DATA_MODEL if changed, ADR for any significant decision)
- [ ] Deployed to a Vercel preview and checked on a real phone

### Device QA checklist (T1.14)
| Check | iPhone Safari | Android Chrome | Desktop |
|---|:-:|:-:|:-:|
| Home renders with no layout shift on first load and on scroll (URL bar collapse) | ☐ | ☐ | ☐ |
| Hero swipes, dots follow, autoplay advances and pauses after a swipe | ☐ | ☐ | — |
| Cutout PNGs look right on dark cards (no white boxes / halos) | ☐ | ☐ | ☐ |
| Photo items fill their cards cleanly | ☐ | ☐ | ☐ |
| Product sheet opens/closes (X, backdrop, Esc) and body does not scroll behind | ☐ | ☐ | ☐ |
| Tray drawer, quantities, remove, total, WhatsApp opens with message | ☐ | ☐ | ☐ |
| Chat opens as a bottom sheet; input focus does not zoom; keyboard does not hide the input | ☐ | ☐ | ☐ |
| `/menu` direct link works | ☐ | ☐ | ☐ |
| 320 px wide: no horizontal scroll, text not clipped | ☐ | ☐ | — |

---

## 3. Sprint 2 — Backend foundation (next)

**Goal:** menu and layout come from a database; the storefront stays fast and works offline-ish.

- [ ] T2.1 Decide stack gate (ADR-0001 review); create Supabase project; record URL/anon key in Vercel env
- [ ] T2.2 Migrations from [docs/DATA_MODEL.md](docs/DATA_MODEL.md): `categories`, `menu_items`, `layout_slots`, `profiles`, `audit_log`
- [ ] T2.3 RLS: public read of active rows; writes owner/staff only
- [ ] T2.4 Seed script from `src/data/menu.js` (+ upload local images to Storage, rewrite URLs)
- [ ] T2.5 `MenuProvider` fetch with: loading skeleton, 60 s stale-while-revalidate, localStorage cache, **static snapshot fallback**
- [ ] T2.6 Edge Function `concierge` (server-held key, per-IP rate limit, same JSON contract) — [ADR-0003](docs/adr/0003-ai-concierge-proxy.md)
- [ ] T2.7 Tests: model mapping from DB rows; fallback behaviour; contract test for the Edge Function

**Exit criteria:** editing a row in Supabase changes the live site within 60 s; killing the network still shows the last good menu.

## 4. Sprint 3 — Dashboard: items
- [ ] T3.1 `/admin` lazy-loaded route + auth (Supabase Auth, email + password; owner/staff roles)
- [ ] T3.2 Items list: search, filter by category/status, inline price edit, sold-out toggle
- [ ] T3.3 Item form: name, category, price, description, tags, featured, `imageStyle`, active
- [ ] T3.4 Image upload: client-side resize to ≤ 1000 px, WebP, size/type validation, preview as card
- [ ] T3.5 Archive (soft delete) with confirm; restore; hard delete only if never ordered
- [ ] T3.6 Category CRUD + drag reorder
- [ ] T3.7 Audit log entries for every write
- [ ] T3.8 Tests: form validation, RLS policy tests, staff cannot edit prices

## 5. Sprint 4 — Dashboard: hero
- [ ] T4.1 Slot editor: hero (1–6) and sub-hero (exactly 2), drag reorder
- [ ] T4.2 Slot types: **item** and **promo** (title, subtitle, image, CTA → item/category/link)
- [ ] T4.3 Scheduling (`starts_at`, `ends_at`) and active toggle
- [ ] T4.4 Live mobile preview using the real storefront components
- [ ] T4.5 Storefront renders promo slides; analytics events for promo clicks
- [ ] T4.6 Re-introduce the "40% off" banner as a promo slide if the owner wants it (Q3)

## 6. Sprint 5 — Orders
- [ ] T5.1 `orders`, `order_items` tables; `create_order` RPC computes prices server-side
- [ ] T5.2 Checkout click: create order → append order code to WhatsApp message → open WhatsApp; offline-safe fallback opens WhatsApp anyway
- [ ] T5.3 Orders inbox: new / confirmed / delivered / cancelled, one-tap transitions, "needs confirmation" badge
- [ ] T5.4 Optional customer name/phone prompt (explicit consent text)
- [ ] T5.5 Tests: server price tampering rejected; status transitions; idempotent create

## 7. Sprint 6 — Analytics
- [ ] T6.1 `events` table + `track()` implementation (anonymous session id, batched, `sendBeacon`)
- [ ] T6.2 Metrics views/functions: revenue, orders, AOV, units, top items, category mix, hourly/day heatmap
- [ ] T6.3 Funnel: visit → product_view → add_to_cart → cart_open → checkout_click → confirmed
- [ ] T6.4 Dashboard UI with date range + previous-period comparison; CSV export
- [ ] T6.5 Insight cards (rule-based first): "X never ordered in 30 days", "Peak hour is …"
- [ ] T6.6 Tests: metric SQL against fixtures; empty-state UI

## 8. Sprint 7 — Hardening
- [ ] Playwright E2E for the golden paths · [ ] Lighthouse CI budgets · [ ] axe a11y checks · [ ] Sentry (or similar) · [ ] Supabase backups + restore drill · [ ] Owner handbook (1 page)

---

## 9. Decision log
| Date | Decision | Where |
|---|---|---|
| 2026-10-24 | Stay on Vite + React for Sprint 1 (migrate layout only) | [ADR-0001](docs/adr/0001-stack-for-sprint-1.md) |
| 2026-10-24 | Supabase proposed for Phase 2 | [ADR-0002](docs/adr/0002-supabase-backend.md) |
| 2026-10-24 | AI concierge key moves server-side in Phase 2 | [ADR-0003](docs/adr/0003-ai-concierge-proxy.md) |
| 2026-10-24 | Capture orders in-system before opening WhatsApp | [ADR-0004](docs/adr/0004-order-capture.md) |

## 10. Risk register (live)
See INTENT §10. Add sprint-specific risks here as they appear.

## 11. Working agreements (human + AI)
- Plan → build → verify → document, in that order, every sprint.
- Small commits with conventional messages (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- AI agents follow [CLAUDE.md](CLAUDE.md); anything that changes INTENT, DATA_MODEL or an ADR needs an explicit note in the PR.
