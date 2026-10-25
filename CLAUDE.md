# CLAUDE.md — Agent instructions for Jay's Bistro

Read [INTENT.md](INTENT.md) and [PLAN.md](PLAN.md) before changing code. Work only on the current sprint's tasks unless told otherwise.

## Project snapshot
Mobile-first food-ordering storefront for Jay's Bistro (Makurdi, NG). Orders are sent through WhatsApp.
Phase 1 (layout) is done; Phase 2 adds a Supabase backend + admin dashboard; Phase 3 adds orders + analytics.

## Stack
React 19 · Vite (`rolldown-vite` alias) · Tailwind CSS 3 · react-router-dom 7 · react-helmet · lucide-react · Vitest.
No TypeScript yet (JSX/JS, ESLint 9 flat config). Do not add a dependency without a reason recorded in the PR.

## Commands (Windows CMD or any shell)
```
npm install
npm run dev            # http://localhost:5173 (also on LAN via --host)
npm run lint
npm test               # vitest run
npm run build          # Vercel build (base "/")
npm run build:ghpages  # GitHub Pages build (base "/jays-bistro/")
```
**Before declaring any task done:** `npm run lint && npm test && npm run build` must pass.

## Architecture rules
1. **Layers:** `lib/` = pure functions (no React, no I/O) · `services/` = network I/O · `hooks/` = React state · `components/` = presentation · `pages/` = composition · `data/` = static data · `config/` = constants.
2. **Menu data only through `useMenu()`.** Never import `data/menu.js` in components. This is the Phase 2 seam.
3. **Cart lines store `{ id, quantity }` only.** Name/price/image are resolved from the menu at read time.
4. **Reducers are immutable.** Never mutate state objects (StrictMode double-invokes updaters).
5. **Never trust model output.** Chatbot actions go through `sanitizeActions` before touching the cart.
6. **Prices are integer naira.** Format with `formatPrice` only at the edge (UI, WhatsApp message).
7. **Brand tokens, not hex codes.** Use `ink-*` and `sprout-*` Tailwind tokens; add new tokens to `tailwind.config.js`, not inline.
8. **Analytics via `track()` only.** Do not call third-party trackers.
9. **Images:** `imageStyle: "cutout"` (transparent PNG, contained, drop shadow) or `"photo"` (cover). Use `FoodImage`; never a bare `<img>` for food.

## UI conventions
- Mobile-first; verify at 320 px. App column is `max-w-md` centred on larger screens.
- Use `svh`, not `vh`/`dvh`, for viewport-relative heights (no layout shift when the mobile URL bar collapses).
- Inputs on mobile are ≥ 16 px font (prevents iOS zoom).
- Tap targets ≥ 36 px; every icon-only button has an `aria-label`.
- Overlays: `role="dialog"`, `aria-modal`, Esc to close, `useBodyScrollLock`, focus moved in on open.
- Respect `prefers-reduced-motion` (CSS does this globally; JS animations must check it too).
- Stretched-button pattern for clickable cards (button overlay), never a `<button>` wrapping headings.

## Security & privacy
- No secrets in the repo. `VITE_*` variables are **public** — only put restricted/public keys there.
- Supabase (Phase 2): the anon key is public by design; **RLS is the security boundary**. Every table gets RLS enabled in the same migration that creates it. Never use the service-role key in the browser.
- Collect minimum PII; no PII in analytics events (Nigeria Data Protection Act 2023).

## Testing rules
- New `lib/` code → unit tests in `src/__tests__/`.
- New screens → at least a server-render smoke test (`renderToStaticMarkup`).
- Bug fix → a failing test first.
- Data changes → `menu.test.js` integrity tests must stay green (unique ids, valid categories, hero/sub-hero reference active items).

## Git & docs
- Conventional commits. One concern per commit.
- When behaviour changes: update INTENT (requirement status), PLAN (tick tasks, decision log), and ARCHITECTURE/DATA_MODEL if touched. Significant choices get an ADR in `docs/adr/`.
- Do not delete user content or assets without being asked. Legacy files are removed only in the dedicated cleanup commit (see `docs/SPRINT-1-RUNBOOK.md` §6).

## Known gotchas
- `base` is `"/"`; routes use `BrowserRouter` with `basename` from `import.meta.env.BASE_URL`. Vercel needs the SPA rewrite in `vercel.json`.
- `SITE.url`, `public/sitemap.xml`, `public/robots.txt` and the OG tags in `index.html` still point to GitHub Pages — change together (INTENT Q5).
- The Gemini key is browser-exposed until the Phase 2 proxy ships; keep it restricted.
- `react-helmet` (v6) logs a legacy-lifecycle warning under React 19 in dev; harmless. Candidate swap: `react-helmet-async` or React 19 native metadata.
