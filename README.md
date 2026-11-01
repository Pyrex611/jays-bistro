# Jay's Bistro — ordering platform

Mobile-first ordering for Jay's Bistro (Makurdi, NG) — live at **jays-bistro.vercel.app**.
Customers browse 64 dishes, search, and either pay with **Paystack** or send the order on **WhatsApp** (as an expiring invoice that becomes a receipt). The owner runs everything from a password-locked console at `/merchant`.

React 19 · Vite · Tailwind 3 · Vercel Functions · S3 (Vercel Blob proposed) · Paystack · Vitest.

```
npm install
npm run images:migrate   # once
npm run dev              # storefront + /api, no AWS or Paystack needed locally
set DEMO_MODE=1          # (Windows CMD, before npm run dev) browser-only demo: every feature, nothing connected; console password jays-setup
npm run lint && npm test && npm run build
```

- Why/what: [INTENT.md](INTENT.md) · How/when: [PLAN.md](PLAN.md) · **Open work: [TASK.md](TASK.md)** · Agent rules: [CLAUDE.md](CLAUDE.md)
- **Apply, demo and deploy Sprint 3 (Windows): [docs/SPRINT-3-RUNBOOK.md](docs/SPRINT-3-RUNBOOK.md)** · Demo mode and go-live checklist: [docs/DEMO_MODE.md](docs/DEMO_MODE.md) · Storage decision: [ADR-0007](docs/adr/0007-vercel-blob-and-demo-mode.md)
- Apply and deploy Sprint 2 (Windows): [docs/SPRINT-2-RUNBOOK.md](docs/SPRINT-2-RUNBOOK.md) · Cloud setup: [docs/AWS_SETUP.md](docs/AWS_SETUP.md)
- Merchant console + password lock: [docs/MERCHANT_PORTAL.md](docs/MERCHANT_PORTAL.md) · Checkout/receipts: [docs/CHECKOUT_AND_RECEIPTS.md](docs/CHECKOUT_AND_RECEIPTS.md)
- UX research & three-version comparison: [docs/UX_RESEARCH.md](docs/UX_RESEARCH.md)
- Architecture, data, design system, decisions: [docs/](docs)
- Env vars: copy `.env.example` to `.env.local`.

Designed and built by Pyrexx.
