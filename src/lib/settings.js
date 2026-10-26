/** Store-wide switches the merchant controls from /merchant → Settings. Public (safe to ship to browsers). */
export const DEFAULT_SETTINGS = Object.freeze({
  acceptingOrders: true, // master switch: false pauses Paystack and WhatsApp checkout
  deliveryEnabled: true, // false hides the Delivery option
  deliveryFee: 0, // integer naira, added to delivery orders
  minOrder: 0, // integer naira, minimum item subtotal
});

const int = (value, fallback, max = 1_000_000) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback;
};

/** Coerce unknown input into a complete, safe settings object. */
export function normalizeSettings(input = {}) {
  const s = input && typeof input === "object" ? input : {};
  return {
    acceptingOrders: s.acceptingOrders !== false,
    deliveryEnabled: s.deliveryEnabled !== false,
    deliveryFee: int(s.deliveryFee, DEFAULT_SETTINGS.deliveryFee, 100_000),
    minOrder: int(s.minOrder, DEFAULT_SETTINGS.minOrder, 1_000_000),
  };
}
