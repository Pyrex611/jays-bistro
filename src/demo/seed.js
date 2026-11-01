import { computeServiceFee } from "../lib/pricing.js";

/**
 * Deterministic mock orders so every console page (overview, orders, analytics, alerts) looks lived-in in demo mode.
 * Same inputs → same orders, so screenshots and tests are stable.
 */
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NAMES = ["Ada Obi", "Tersoo Akpen", "Hannah Ityo", "Emeka Okafor", "Zainab Musa", "Terkimbi Adi", "Blessing Agbo", "Ibrahim Sule", "Mercy Ankeli", "David Iorkyaa", "Ngozi Eze", "Samuel Ogbole", "Rita Aondo", "Joseph Ugbede"];
const STREETS = ["12 High Level", "7 North Bank Road", "Plot 4 Wurukum Market Rd", "3 Wadata Plaza Lane", "22 Gboko Road", "9 Modern Market Close", "15 Old GRA Avenue"];
const CHANNELS = ["card", "card", "bank_transfer", "bank_transfer", "ussd"];
const NOTES = ["", "", "", "No pepper please", "Extra sauce", "Call when you arrive", "Leave at the gate"];
const HOURS = [11, 12, 12, 13, 13, 14, 15, 17, 18, 19, 19, 20, 20, 21]; // lunch + evening peaks (Lagos)

const code = (rand) => `JB-${Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rand() * 32)]).join("")}`;

/**
 * @param {{ items: object[], settings: object, now?: Date, days?: number }} input  items = active menu items
 */
export function generateSeedOrders({ items, settings, now = new Date(), days = 30 }) {
  const rand = mulberry32(20261027);
  const active = items.filter((i) => i.isActive !== false && i.isAvailable !== false);
  const weighted = active.flatMap((i, idx) => Array(idx < 12 ? (i.id === 1 ? 6 : 4) : 1).fill(i));
  const zones = (settings.zones ?? []).filter((z) => z.enabled);
  const orders = [];

  const makeOrder = (paidAt) => {
    const lineCount = 1 + Math.floor(rand() * 3);
    const chosen = new Map();
    for (let n = 0; n < lineCount; n += 1) {
      const item = weighted[Math.floor(rand() * weighted.length)];
      chosen.set(item.id, { item, quantity: 1 + Math.floor(rand() * 2) });
    }
    const lines = [...chosen.values()].map(({ item, quantity }) => ({ id: item.id, name: item.name, unitPrice: item.price, quantity, lineTotal: item.price * quantity }));
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

    const delivery = rand() < 0.58;
    const zone = delivery && zones.length ? zones[Math.floor(rand() * zones.length)] : null;
    const deliveryFee = delivery ? (zone ? zone.fee : settings.deliveryFee) : 0;
    const serviceFee = computeServiceFee(subtotal + deliveryFee, settings.serviceFee);
    const total = subtotal + deliveryFee + serviceFee;
    const name = NAMES[Math.floor(rand() * NAMES.length)];
    const phone = `23480${3 + Math.floor(rand() * 6)}${String(Math.floor(rand() * 9_000_000) + 1_000_000)}`;
    const id = `demo-seed-${orders.length + 1}`;

    return {
      id,
      code: code(rand),
      status: "paid",
      channel: rand() < 0.35 ? "whatsapp" : "web",
      createdAt: new Date(paidAt.getTime() - 4 * 60_000).toISOString(),
      expiresAt: new Date(paidAt.getTime() + 24 * 3_600_000).toISOString(),
      items: lines,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      fulfilment: delivery ? "delivery" : "pickup",
      zone: zone ? { id: zone.id, name: zone.name, fee: zone.fee, etaMins: zone.etaMins } : null,
      prepMins: settings.prepMins,
      customer: { name, email: `${name.split(" ")[0].toLowerCase()}@example.com`, phone, address: delivery ? STREETS[Math.floor(rand() * STREETS.length)] : "", note: NOTES[Math.floor(rand() * NOTES.length)] },
      attempts: [],
      payment: { reference: `${id}-1`, channel: CHANNELS[Math.floor(rand() * CHANNELS.length)], paidAt: paidAt.toISOString(), amount: total, currency: "NGN", mode: "demo" },
      fulfilmentStatus: "completed",
      alert: { channel: "email", status: "simulated", at: paidAt.toISOString() },
    };
  };

  for (let d = days - 1; d >= 0; d -= 1) {
    const day = new Date(now.getTime() - d * 86_400_000);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Lagos", weekday: "short" }).format(day);
    const perDay = 2 + Math.floor(rand() * 4) + (["Fri", "Sat", "Sun"].includes(weekday) ? 2 : 0) + (d === 0 ? 1 : 0);

    for (let k = 0; k < perDay; k += 1) {
      const lagosHour = HOURS[Math.floor(rand() * HOURS.length)];
      const paidAt = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), lagosHour - 1, Math.floor(rand() * 60)));
      if (paidAt > now) continue;
      orders.push(makeOrder(paidAt));
    }
  }

  // Whatever the time of day, the demo always has a few orders from the last hour so the kitchen pipeline isn't empty.
  for (let i = 0; i < 5; i += 1) orders.push(makeOrder(new Date(now.getTime() - (i + 1) * 11 * 60_000)));

  // The five most recent orders are still moving through the kitchen.
  const sorted = orders.sort((a, b) => new Date(a.payment.paidAt) - new Date(b.payment.paidAt));
  const pipeline = ["ready", "preparing", "preparing", "new", "new"];
  sorted.slice(-pipeline.length).forEach((o, i) => {
    o.fulfilmentStatus = pipeline[i];
  });
  return sorted;
}
