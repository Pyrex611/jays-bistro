# ADR-0003: Move the AI concierge behind a server-side proxy

- **Status:** Proposed (interim mitigation shipped in Sprint 1)
- **Date:** 2026-10-24

## Context
The concierge calls the Gemini API from the browser. Any `VITE_*` key is public, so anyone can copy it and spend the quota.

## Decision
- **Now (S1):** key via env var, sent in the `x-goog-api-key` header (not the URL), demo mode when absent; restrict the key by HTTP referrer and API.
- **Phase 2 (S2):** Supabase Edge Function `concierge` holds the key, applies per-IP rate limits and a max message/token budget, builds the prompt from the DB menu, and returns the same `{message, actions}` JSON. `services/concierge.js` swaps its URL; `lib/chat.js` sanitisation stays client- and server-side.

## Consequences
✅ Key never ships to browsers; abuse is rate-limited. ⚠️ Adds ~100–300 ms hop and an Edge Function to maintain.
