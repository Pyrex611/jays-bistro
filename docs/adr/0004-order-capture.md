# ADR-0004: Capture orders in-system before opening WhatsApp

- **Status:** **Superseded by [ADR-0006](0006-paystack-invoices-receipts.md)** (2026-10-26)
- **Date:** 2026-10-24

Original idea: store an order and echo a code into the WhatsApp message. Sprint 2 goes further: every WhatsApp order becomes an expiring invoice that can be paid online, and paid invoices become receipts, which are the source for analytics.
