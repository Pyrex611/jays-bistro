/**
 * Order pricing — ONE implementation shared by the storefront (display) and the API (authoritative).
 * Money is integer naira. Paystack wants kobo: use toKobo().
 */

export const toKobo = (naira) => Math.round(Number(naira) * 100);

/**
 * @param {Array<{unitPrice:number, quantity:number}>} lines
 * @param {"pickup"|"delivery"} fulfilment
 * @param {{deliveryFee:number, minOrder:number, deliveryEnabled:boolean}} settings
 */
export function computeTotals(lines, fulfilment, settings) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const deliveryFee = fulfilment === "delivery" ? settings.deliveryFee : 0;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    belowMinimum: subtotal < settings.minOrder,
    shortBy: Math.max(0, settings.minOrder - subtotal),
  };
}
