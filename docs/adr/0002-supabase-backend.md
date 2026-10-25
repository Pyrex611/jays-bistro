# ADR-0002: Supabase for Phase 2 backend

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
Needs: relational data (menu, orders), authentication with roles, image storage, row-level authorisation, and a small serverless function (AI proxy, order RPC). Free-tier friendly; the lead engineer already uses Supabase.

## Decision
Use Supabase: Postgres + RLS, Auth, Storage, Edge Functions, SQL RPCs.

## Alternatives
Firebase (weaker relational/analytics queries, rules language) · custom Node API + Postgres (more ops, no free auth/storage) · headless CMS (menu only; no orders/analytics path).

## Consequences
- ✅ One platform for all of Phases 2–3; RLS makes the public anon key safe by design.
- ⚠️ Free projects can pause after inactivity → mitigated by static snapshot fallback and client cache.
- ⚠️ RLS mistakes are security bugs → every table ships with policy tests (PLAN S3 T3.8).
