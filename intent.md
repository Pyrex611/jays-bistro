# INTENT — Jay's Bistro Ordering Platform

> **Purpose of this file:** the single source of truth for *why* this product exists, *who* it serves,
> and *what "done" means*. Humans and AI agents read this before changing anything.
> If code and INTENT disagree, either the code is wrong or INTENT needs an explicit, dated amendment (see §12).
>
> Companion files: [PLAN.md](PLAN.md) (how and when) · [CLAUDE.md](CLAUDE.md) (agent rules) ·
> [docs/CONCEPTS.md](docs/CONCEPTS.md) (deep-dive on dashboard, hero management, analytics) ·
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/DATA_MODEL.md](docs/DATA_MODEL.md) · [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [docs/adr/](docs/adr)

- **Product:** Jay's Bistro online ordering (Makurdi, Benue State, Nigeria)
- **Repo:** `github.com/Pyrex611/jays-bistro` · **Live:** `jays-bistro.vercel.app`
- **Owner / lead engineer:** Pyrexx
- **Intent version:** 1.1 — 2026-10-26

---

## 1. Problem

Jay's Bistro takes food orders over WhatsApp. The current storefront works, but:

1. **The layout under-performs.** The owner finds it unsatisfactory. A previous project (Bonti, a boba/food ordering draft) has a layout that is preferred: a compact, mobile-first, image-forward home with a hero carousel, sub-hero, category pills and a dense product grid.
2. **The menu is hard-coded.** Changing a price, adding a dish, or swapping the hero requires a developer and a redeploy.
3. **Sales are invisible.** Orders end in WhatsApp, so nobody can see what sells, when, or how well the storefront converts.

## 2. Vision

> A fast, beautiful, mobile-first ordering experience for Jay's customers, and a simple control room
> where the owner runs the menu and understands the business — without ever calling a developer.

## 3. Users

| Persona | Context | Needs |
|---|---|---|
| **Customer** ("Snackie") | Phone (iPhone / mid-range Android), often 3G/4G, in Makurdi, hungry, impatient | See food instantly, find it in ≤2 taps, build a tray, order via WhatsApp in <60 s |
| **Owner** (Jay) | Phone first, occasionally laptop. Non-technical | Add/edit/hide dishes in under a minute, feature the right dishes, know best sellers and revenue |
| **Staff** (future) | Shift staff on a phone | Mark items sold out; see incoming orders. No access to prices or analytics |
| **Developer** (Pyrexx) | Windows, Node, Git, Vercel | Clean, tested, documented code; safe deploys; AI-assistable workflow |

## 4. Goals and non-goals by phase

### Phase 1 — Layout migration (Sprint 1) ✅ delivered
**Goal:** Replace the layout with the Bonti design, keeping Jay's brand, menu options and AI concierge. Zero regression in ordering.

**Non-goals:** any backend, auth, dashboard, analytics, payments, new routes beyond `/` and `/menu`.

### Phase 2 — Brand, commerce and merchant portal (Sprint 2) ✅ delivered
**Goal:** theme from the logo; the full 64-item catalogue with search; pay online with Paystack; WhatsApp orders become expiring invoices that turn into receipts; a password-locked merchant console to run the menu, home layout, store switches and see paid orders. No customer accounts and no third-party auth provider.

**Non-goals:** customer accounts, order-status tracking, loyalty, multi-branch.

### Phase 3 — Hardening, SEO and growth (Sprint 3+)
SEO prerendering decision, AI concierge behind the API, kitchen notifications, order statuses, reorder, popular row, E2E/Lighthouse CI. See PLAN.md.

### (Original Phase 2/3 text, kept for history)
### Phase 2 (original) — Menu management backend + dashboard
**Goal:** Owner can add, edit, hide, archive and reorder items, upload photos, and control hero / sub-hero content from an authenticated dashboard. Customers see changes within a minute.

**Non-goals:** payments, delivery logistics, multi-branch.

### Phase 3 (original) — Orders and sales analytics
**Goal:** Capture every order the storefront produces and turn it into trustworthy sales analytics (revenue, top items, funnel, peak times).

**Non-goals:** automated payment reconciliation (a later option via Paystack), loyalty programmes.

## 5. Success metrics

| Metric | Baseline | Target | Phase |
|---|---|---|---|
| Lighthouse mobile Performance (home) | not measured | ≥ 90 | 1 |
| Lighthouse Accessibility | not measured | ≥ 95 | 1 |
| Taps from landing to "item in tray" | 2 | ≤ 2 (no regression) | 1 |
| Time for owner to add a dish | ∞ (needs developer) | < 60 s | 2 |
| Time for owner to change a price | ∞ | < 20 s | 2 |
| Menu change visible to customers | redeploy | < 60 s | 2 |
| Share of orders captured in system | 0% | ≥ 95% | 3 |
| Owner opens analytics weekly | n/a | ≥ 1×/week | 3 |

## 6. Scope — Phase 1 requirements (traceable)

| ID | Requirement | Status |
|---|---|---|
| R1.1 | Layout matches the Bonti design: sticky header, hero carousel, sub-hero pair, category pills, 2-column product grid, product sheet, tray drawer | ✅ |
| R1.2 | Mobile-first; on wide screens the app is a centred `max-w-md` column (as in Bonti) | ✅ |
| R1.3 | Jay's identity: logo, name, location, charcoal + lime palette, Outfit / Plus Jakarta Sans | ✅ |
| R1.4 | Menu options preserved: same 12 live items, same prices, same 6 categories + All | ✅ |
| R1.5 | Tray + "Checkout on WhatsApp" with the existing message format and number | ✅ |
| R1.6 | AI concierge migrated: same behaviour (answers, add/remove tray items), restyled to the new design | ✅ |
| R1.7 | SEO preserved: per-route title/description/canonical, schema.org Restaurant + Menu JSON-LD, `/menu` route | ✅ |
| R1.8 | Dishes can be shown as transparent cutouts (Bonti look) or full-bleed photos, per item | ✅ |
| R1.9 | Data and layout slots are behind a seam (`MenuProvider`, `data/layout.js`) so Phase 2 swaps the source without touching UI | ✅ |
| R1.10 | Pure logic is unit-tested; the page has a render smoke test; lint, test and build pass | ✅ |

### Deliberate differences from the legacy site (Phase 1)
- Bottom pill navigation removed (single-page layout makes it redundant). `/menu` still works.
- Search bar and the "40% off" promo banner are **not** in the Bonti layout. See open questions Q2, Q3.
- Cart state is immutable and validated (fixes a latent double-add bug when React StrictMode runs updaters twice).
- Chatbot actions from the model are validated (unknown items, bad quantities and unknown verbs are dropped).
- Pinch-zoom re-enabled (legacy viewport blocked it — accessibility).

## 6b. Scope — Sprint 2 requirements (traceable)

| ID | Requirement | Status |
|---|---|---|
| R2.1 | Palette, favicon and avatars derived from the logo (green `#286334`, orange `#E4830E`, cream `#FBF8EE`) | ✅ |
| R2.2 | Full catalogue (64) active; menu shown as titled category sections; sticky pills with line-art icons | ✅ |
| R2.3 | Search (accent/case-insensitive, all words must match, ranked) | ✅ |
| R2.4 | Canonical domain `jays-bistro.vercel.app` in config, OG tags, sitemap, robots | ✅ |
| R2.5 | Tray footer: main **Checkout** (Paystack) with a small round **WhatsApp** button to its left | ✅ |
| R2.6 | WhatsApp message carries an expiring (24 h) invoice link; the same URL becomes the receipt when paid | ✅ |
| R2.7 | Success state + receipt (animation, torn-paper receipt, PAID stamp, PDF/share/WhatsApp) | ✅ |
| R2.8 | Paystack key supplied via env var; server-side verification; exact-amount settlement; webhook backstop | ✅ |
| R2.9 | Merchant console at `/merchant`: password lock without an auth provider, S3-backed | ✅ |
| R2.10 | Console: add/edit/delete dishes, photo upload, in-stock switch, categories, hero + sub-hero with live preview, settings, orders + sales analytics, password change | ✅ |
| R2.11 | Open/closed status, pause-orders switch, delivery fee, minimum order | ✅ |
| R2.12 | UX research + audit + three-version comparison documented | ✅ ([docs/UX_RESEARCH.md](docs/UX_RESEARCH.md)) |

## 7. Scope — original Phase 2/3 summary (superseded where Sprint 2 differs; see docs/CONCEPTS.md)

**Menu dashboard (`/admin`)** — Auth (owner, staff) · item CRUD with archive instead of delete · "sold out today" quick toggle ·
category management and ordering · image upload with automatic compression · cutout/photo flag ·
hero and sub-hero manager with live mobile preview, scheduling and promo slides · audit trail.

**Orders and analytics** — Order capture on checkout (server-priced, order code echoed in the WhatsApp message) ·
orders inbox with one-tap status · analytics: revenue, orders, AOV, top items, category mix, peak hours, conversion funnel,
concierge-assisted share, CSV export.

## 8. Constraints

- **Network:** assume slow 3G/4G. Home route ≤ 150 KB gzip JS (currently ≈ 103 KB), images lazy-loaded and compressed.
- **Devices:** iPhone Safari and Android Chrome are primary; test at 320 px width.
- **Ordering channel:** WhatsApp remains the order channel until payments are explicitly scoped.
- **Budget:** free tiers where possible (Vercel Hobby, Supabase Free). Design must stay within them.
- **Security:** no secrets in the repo; browser-exposed keys must be restricted; admin writes only through RLS-protected paths.
- **Privacy:** Nigeria Data Protection Act 2023 — collect the minimum, no third-party trackers, no PII in analytics events.
- **Brand:** Jay's palette, logo and tone are authoritative; copy stays warm and short.

## 9. Assumptions (verify; amend INTENT if wrong)

- A1. `IMG_*.PNG` assets are transparent cutouts; `.jpg` and Unsplash images are photos (the console lets the owner switch per dish). The 56 other dishes use Unsplash stock photos that should be replaced with real photos over time.
- A2. The live menu is the 12 items in the legacy `App.jsx`; the other 52 in the legacy `menu.js` are catalogue only.
- A3. Vercel is the primary host (`jays-bistro.vercel.app`); GitHub Pages is legacy.
- A4. One branch, one kitchen, one WhatsApp number.

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| SPA is weak for SEO vs server rendering | Fewer organic visits | JSON-LD kept; Phase 2 gate re-evaluates Next.js or prerendering ([ADR-0001](docs/adr/0001-stack-for-sprint-1.md)) |
| Gemini key exposed in the browser | Quota theft, cost | Restrict key now; server proxy in Phase 2 ([ADR-0003](docs/adr/0003-ai-concierge-proxy.md)) |
| Owner forgets to confirm orders → analytics undercount | Wrong decisions | Orders inbox with "needs confirmation" nudges; unconfirmed excluded from revenue but shown |
| Image quality varies (cutout vs photo) | Visually inconsistent grid | Per-item `imageStyle`; upload guidelines in DESIGN_SYSTEM |
| Supabase free-tier pause after inactivity | Menu fails to load | Build-time static snapshot fallback + client cache |

## 11. Open questions (owner decisions needed)

| # | Question | Default used in Sprint 1 |
|---|---|---|
| Q1 | Full catalogue or live 12? | ✅ **Decided 2026-10-26: full catalogue** |
| Q2 | Keep a search bar? | ✅ **Decided: yes, back** |
| Q3 | Keep the "40% discount" banner? | Not included; becomes a **promo slide** in Phase 2 |
| Q4 | Are the `IMG_*.PNG` files transparent cutouts? | Assumed yes (A1) |
| Q5 | Canonical domain | ✅ **Decided: `jays-bistro.vercel.app`** |
| Q6 | Who gets dashboard access, and should staff see prices? | Owner only (Phase 2 design supports staff) |
| Q7 | Delivery or pickup, delivery fee, minimum order? | Not modelled |
| Q8 | Payments (Paystack) timeline? | ✅ **Built in Sprint 2** (test key first, then live) |
| Q9 | Delivery or pickup? Fee and minimum? | Both offered; fee/minimum default to ₦0 and are set in the console. **Owner to confirm real values and delivery area** |
| Q10 | Who is told when an order is paid? | Nobody automatically yet: the Orders tab shows it. Options: WhatsApp/email/SMS alert to the kitchen |
| Q11 | Delivery area/zones and prep time to show customers? | Not modelled |

## 12. Change control
Amend this file with a dated entry below; never silently edit history.

| Date | Change | By |
|---|---|---|
| 2026-10-24 | v1.0 created: Phase 1 delivered, Phases 2–3 defined | Pyrexx + AI |
| 2026-10-26 | v1.1: Supabase plan replaced by S3 + password-locked console (ADR-0005); Paystack, invoices, receipts (ADR-0006); full catalogue, search, canonical domain decided; logo-based theme | Pyrexx + AI |
