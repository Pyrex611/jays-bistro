# ADR-0001: Keep Vite + React for Sprint 1

- **Status:** Accepted (re-evaluate at the Phase 2 gate)
- **Date:** 2026-10-24

## Context
The existing repo is a Vite + React 19 + Tailwind 3 SPA deployed on Vercel/GitHub Pages. Sprint 1 only changes the layout. The lead engineer's wider toolkit includes Next.js + Supabase, and the Bonti draft is planned as a Next.js build.

## Decision
Migrate the layout inside the existing Vite stack. No framework change in Sprint 1.

## Consequences
- ✅ Smallest blast radius; behaviour parity is easy to verify; no deployment changes.
- ✅ Architecture seams (`useMenu`, `lib/`, `services/`) keep a later move cheap — only `pages/` and routing are framework-specific.
- ⚠️ SPA SEO is weaker than server rendering for a local restaurant. JSON-LD and meta tags are kept, but crawlers see little HTML.

## Gate (revisit in Sprint 3)
Sprint 2 added Vercel Functions (`/api`) and stayed on Vite. The question is now only about SEO prerendering.

## Original gate text
Choose one: **(a)** stay on Vite and add build-time prerender for `/` and `/menu`; **(b)** migrate to Next.js (App Router, ISR for the menu, Route Handlers for the AI proxy). Criteria: organic search matters to the owner · cost of migration (~1 sprint, mostly routing/metadata) · single-repo simplicity for the dashboard. Record the outcome as ADR-0001a.
