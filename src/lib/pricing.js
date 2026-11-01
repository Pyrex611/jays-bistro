/**
 * Order pricing — ONE implementation shared by the storefront (display) and the API (authoritative).
 * Money is integer naira. Paystack wants kobo: use toKobo().
 */

export const toKobo = (naira) => Math.round(Number(naira) * 100);

/** Online-payment fee line. `flat` only applies from `flatWaivedBelow` upwards (mirrors Paystack's local-card structure; editable). */
export function computeServiceFee(base, cfg) {
  if (!cfg?.enabled || base <= 0) return 0;
  let fee = (base * cfg.percent) / 100 + (base >= cfg.flatWaivedBelow ? cfg.flat : 0);
  fee = Math.round(fee);
  return cfg.cap > 0 ? Math.min(fee, cfg.cap) : fee;
}

export const activeZones = (settings) => (settings.zones ?? []).filter((z) => z.enabled);

/**
 * @param {Array<{unitPrice:number, quantity:number}>} lines
 * @param {"pickup"|"delivery"} fulfilment
 * @param {object} settings  normalised settings
 * @param {{ zoneId?: string|null, payOnline?: boolean }} [options]
 */
export function computeTotals(lines, fulfilment, settings, { zoneId = null, payOnline = false } = {}) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const delivery = fulfilment === "delivery";
  const zones = activeZones(settings);
  const zone = delivery && zones.length ? zones.find((z) => z.id === zoneId) ?? null : null;
  const zoneRequired = delivery && zones.length > 0 && !zone;

  let deliveryFee = 0;
  let freeDelivery = false;
  if (delivery) {
    deliveryFee = zones.length ? zone?.fee ?? 0 : settings.deliveryFee;
    if (settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove) {
      freeDelivery = deliveryFee > 0;
      deliveryFee = 0;
    }
  }

  const serviceFee = payOnline ? computeServiceFee(subtotal + deliveryFee, settings.serviceFee) : 0;
  const minOrder = Math.max(settings.minOrder, zone?.minOrder ?? 0);

  return {
    subtotal,
    deliveryFee,
    serviceFee,
    total: subtotal + deliveryFee + serviceFee,
    zone,
    zoneRequired,
    freeDelivery,
    minOrder,
    belowMinimum: subtotal < minOrder,
    shortBy: Math.max(0, minOrder - subtotal),
  };
}
