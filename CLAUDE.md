# CLAUDE.md — Agent instructions for Jay's Bistro

Read [INTENT.md](INTENT.md) and [PLAN.md](PLAN.md) before changing code. Work only on the current sprint's tasks unless told otherwise.

## Project snapshot
Mobile-first food-ordering storefront for Jay's Bistro (Makurdi, NG) at `jays-bistro.vercel.app`.
Customers pay with Paystack or send the order on WhatsApp (as an expiring invoice that becomes a receipt). The owner runs the menu from a password-locked console at `/merchant`. Data lives in an S3 bucket via Vercel Functions in `/api`. No customer accounts, no auth provider.

## Stack
React 19 · Vite (`rolldown-vite` alias) · Tailwind CSS 3 · react-router-dom 7 · react-helmet · lucide-react · Vitest · Vercel Functions (`/api`, Node, ESM) · `@aws-sdk/client-s3`.
No TypeScript yet (JSX/JS, ESLint 9 flat config). Do not add a dependency without a reason recorded in the PR.

## Commands (Windows CMD or any shell)
```
npm install
npm run dev            # http://localhost:5173 (+ /api via dev/apiPlugin.js, files in .local-data/)
npm run lint
npm test               # vitest run
npm run build          # Vercel build (base "/")
npm run images:migrate # one-time: copy bundled photos to public/menu
```
**Before declaring any task done:** `npm run lint && npm test && npm run build` must pass.

## Architecture rules
1. **Layers:** `lib/` = pure functions (no React, no I/O) · `services/` = network I/O · `hooks/` = React state · `components/` = presentation · `pages/` = composition · `data/` = static data · `config/` = constants.
2. **Menu data only through `useMenu()`.** Never import `data/menu.js` in components (it is only the seed/fallback; the live menu is `data/menu.json` in storage via `/api/menu`).
3. **Cart lines store `{ id, quantity }` only** (persisted in localStorage). Name/price/image are resolved from the menu at read time.
3a. **The server decides money.** Prices, availability, delivery fee, minimum order come from the live menu in `api/checkout.js`; the browser sends ids and quantities only. `lib/pricing.js` and `lib/menuDoc.js` are shared by both sides.
3b. **Paystack is the only authority on payment.** Settle only via `verifyTransaction` with status success, NGN and the exact kobo of that attempt (`invoices.settle`). Never trust the redirect or webhook payload.
3c. **Every protected handler starts with `requireMerchant`**, and state-changing portal calls require `X-Requested-With: jb-portal`. No client-only gates.
3d. **Storage only through `getStorage()`** (S3/fs/memory). Nothing else touches AWS.
4. **Reducers are immutable.** Never mutate state objects (StrictMode double-invokes updaters).
5. **Never trust model output.** Chatbot actions go through `sanitizeActions` before touching the cart.
6. **Prices are integer naira.** Format with `formatPrice` only at the edge (UI, WhatsApp message).
7. **Brand tokens, not hex codes.** Use `leaf-*` (logo green), `sun-*` (logo orange), `cream-*` (logo background) and `ink-*` (text). Orange never carries white text. WhatsApp green `#25D366` only on WhatsApp buttons.
8. **Analytics via `track()` only.** Do not call third-party trackers.
9. **Images:** `imageStyle: "cutout"` (transparent PNG, contained, drop shadow) or `"photo"` (cover). Use `FoodImage`; never a bare `<img>` for food.

## UI conventions
- Mobile-first; verify at 320 px. Storefront column is `max-w-md` centred on larger screens; the console is `max-w-2xl`.
- Use `svh`, not `vh`/`dvh`, for viewport-relative heights (no layout shift when the mobile URL bar collapses).
- Inputs on mobile are ≥ 16 px font (prevents iOS zoom).
- Tap targets ≥ 36 px; every icon-only button has an `aria-label`.
- Overlays: `role="dialog"`, `aria-modal`, Esc to close, `useBodyScrollLock`, focus moved in on open.
- Respect `prefers-reduced-motion` (CSS does this globally; JS animations must check it too).
- Stretched-button pattern for clickable cards (button overlay), never a `<button>` wrapping headings.

## Security & privacy
- No secrets in the repo. `VITE_*` variables are **public** — only restricted keys there. `PAYSTACK_SECRET_KEY`, `S3_*`, `SESSION_SECRET`, `MERCHANT_BOOTSTRAP_PASSWORD` are server-only (no `VITE_` prefix). Use `S3_*` names, not `AWS_*` (reserved on Vercel).
- The bucket is private except `images/*`. Never log passwords, hashes, tokens or full customer details.
- Passwords: scrypt hash only. Cookie: HttpOnly, SameSite=Strict, Path=/api, signed. Invoice ids are the access token (80 random bits): never log them with customer data.
- Collect minimum PII; no PII in analytics events (Nigeria Data Protection Act 2023).

## Testing rules
- New `lib/` code → unit tests in `src/__tests__/`.
- New screens → at least a server-render smoke test (`renderToStaticMarkup`).
- New endpoints → API tests with the memory driver (`src/__tests__/apiHelpers.js`), including the unhappy paths (unauthenticated, tampered, expired, wrong amount).
- Bug fix → a failing test first.
- Data changes → `menu.test.js` and `menuDoc.test.js` must stay green (unique ids, valid categories/icons/images, hero/sub-hero reference active items).

## Git & docs
- Conventional commits. One concern per commit.
- When behaviour changes: update INTENT (requirement status), PLAN (tick tasks, decision log), and ARCHITECTURE/DATA_MODEL if touched. Significant choices get an ADR in `docs/adr/`.
- Do not delete user content or assets without being asked. Legacy files are removed only in the dedicated cleanup commit (see `docs/SPRINT-1-RUNBOOK.md` §6).

## Known gotchas
- `vercel.json` rewrites every non-`/api`, non-`/menu/` (images), non-`/assets/` path to `index.html`. Dish photos live in `public/menu/` (stable URLs the console can reference); do not rename them.
- The 8 bundled photos reach `public/menu/` via `npm run images:migrate` (one time). Merchant uploads go to S3 `images/`.
- Production without S3 variables: storefront works from the bundled menu; `/merchant`, invoices and orders do not.
- Mock payments only run when there is no Paystack key AND the deployment is not production.
- `react-helmet` (v6) logs a legacy-lifecycle warning under React 19 in dev; harmless.
- The Gemini key is still browser-exposed (ADR-0003, Sprint 3).
