import { SITE } from "../config/site.js";

/** Format a naira amount, e.g. 3500 -> "₦3,500". */
export const formatPrice = (amount) => `₦${Number(amount).toLocaleString("en-NG")}`;

/**
 * Generates the direct URL for a meal that leads to the menu with its modal open.
 * Uses window.location.origin in the browser, falling back to SITE.url in SSR/node.
 */
export function getDishUrl(id) {
  const base = typeof window !== "undefined" && window.location?.origin ? window.location.origin : SITE.url;
  return `${base}/menu?dish=${encodeURIComponent(id)}`;
}