# ADR-0004: Capture orders in-system before opening WhatsApp

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
Sales analytics need orders, but WhatsApp is the order channel and must keep working even if our backend is down.

## Decision
On checkout: (1) call `create_order` (server-side pricing) with a short timeout; (2) append `Order #CODE` to the WhatsApp message; (3) open WhatsApp regardless of the result. Owner confirms orders in the dashboard; revenue counts confirmed/delivered only.

## Consequences
✅ Trustworthy revenue, traceable chats, tamper-proof prices. ⚠️ Depends on owner discipline to confirm → inbox nudges for stale `sent` orders. ⚠️ Captures personal data only if the customer opts in to give name/phone.
