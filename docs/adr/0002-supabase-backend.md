# ADR-0002: Supabase for Phase 2 backend

- **Status:** **Superseded by [ADR-0005](0005-s3-storage-and-password-lock.md)** (2026-10-26)
- **Date:** 2026-10-24

The owner chose "no auth provider" with an S3-backed store and a password-locked portal. Supabase (Postgres + Auth) is no longer the plan. The relational schema in `DATA_MODEL.md` §Archive is kept only as a reference for a future migration if the business outgrows JSON-in-S3.
