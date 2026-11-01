/**
 * Analytics seam. Sprint 1: logs to the console in development only.
 * Phase 3 replaces the body with a write to the `events` table (docs/DATA_MODEL.md)
 * — call sites do not change.
 *
 * Event names in use:
 *   product_view, add_to_cart, cart_open, checkout_click, chat_open, chat_message
 */
export function track(event, props = {}) {
  if (import.meta.env.DEV) {
    console.debug("[track]", event, props);
  }
}
