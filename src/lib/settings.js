/**
 * Store settings the merchant controls from /merchant → Settings. PUBLIC: they ship to browsers inside the menu document,
 * so nothing private (recipient emails, keys, passwords) may ever live here.
 * This file must stay free of browser-only imports: the API imports it too.
 */

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_HOURS = DAYS.map((day) =>
  day === "Saturday" ? { day, open: "09:00", close: "23:00", closed: false }
  : day === "Sunday" ? { day, open: "10:00", close: "22:00", closed: false }
  : { day, open: "08:00", close: "22:00", closed: false },
);

export const DEFAULT_SETTINGS = Object.freeze({
  acceptingOrders: true, // master switch: false pauses Paystack and WhatsApp checkout
  autoPauseOutsideHours: false, // true = refuse orders outside opening hours
  deliveryEnabled: true,
  deliveryFee: 0, // flat fee, used only when no delivery zones are defined
  freeDeliveryAbove: 0, // items subtotal at/above which delivery is free (0 = off)
  minOrder: 0,
  prepMins: [20, 30], // pickup "ready in" estimate; [0, 0] hides it
  deliveryNote: "",
  zones: [], // [{ id, name, fee, minOrder, etaMins:[a,b], enabled }]
  serviceFee: { enabled: true, percent: 1.5, flat: 100, flatWaivedBelow: 2500, cap: 2000 }, // online-payment fee line (verify vs your Paystack plan)
  business: {
    whatsapp: "2348062624447",
    phone: "",
    address: "Precious Events Centre, Makurdi, Benue",
    pickupNote: "",
    announcement: "",
    announcementEnabled: false,
  },
  hours: DEFAULT_HOURS,
  closures: [], // [{ date: "YYYY-MM-DD", note }]
});

const int = (value, fallback, max = 1_000_000) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback;
};
const num = (value, fallback, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n * 100) / 100, max) : fallback;
};
const text = (value, max, fallback = "") => (typeof value === "string" ? value.trim().slice(0, max) : fallback);
const time = (value, fallback) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value)) ? value : fallback);
const slug = (name) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "zone";
const range = (value, fallback, max = 300) => {
  const a = int(value?.[0], fallback[0], max);
  const b = int(value?.[1], fallback[1], max);
  return [Math.min(a, b), Math.max(a, b)];
};

export function normalizeZones(input) {
  const out = [];
  const seen = new Set();
  for (const z of Array.isArray(input) ? input.slice(0, 30) : []) {
    const name = text(z?.name, 40);
    if (name.length < 2) continue;
    let id = text(z?.id, 30) || slug(name);
    while (seen.has(id)) id = `${id}-${seen.size + 1}`;
    seen.add(id);
    out.push({ id, name, fee: int(z?.fee, 0, 100_000), minOrder: int(z?.minOrder, 0), etaMins: range(z?.etaMins, [0, 0]), enabled: z?.enabled !== false });
  }
  return out;
}

export function normalizeHours(input) {
  const byDay = new Map((Array.isArray(input) ? input : []).map((h) => [h?.day, h]));
  return DAYS.map((day, i) => {
    const d = DEFAULT_HOURS[i];
    const h = byDay.get(day);
    if (!h) return { ...d };
    const open = time(h.open, d.open);
    const close = time(h.close, d.close);
    const closed = Boolean(h.closed) || close <= open;
    return { day, open, close: close <= open ? d.close : close, closed };
  });
}

/** Coerce unknown input into a complete, safe settings object. */
export function normalizeSettings(input = {}) {
  const s = input && typeof input === "object" ? input : {};
  const f = s.serviceFee ?? {};
  const b = s.business ?? {};
  const d = DEFAULT_SETTINGS;
  const whatsapp = String(b.whatsapp ?? "").replace(/\D/g, "");

  return {
    acceptingOrders: s.acceptingOrders !== false,
    autoPauseOutsideHours: Boolean(s.autoPauseOutsideHours),
    deliveryEnabled: s.deliveryEnabled !== false,
    deliveryFee: int(s.deliveryFee, d.deliveryFee, 100_000),
    freeDeliveryAbove: int(s.freeDeliveryAbove, 0),
    minOrder: int(s.minOrder, d.minOrder),
    prepMins: range(s.prepMins, d.prepMins),
    deliveryNote: text(s.deliveryNote, 240),
    zones: normalizeZones(s.zones),
    serviceFee: {
      enabled: f.enabled === undefined ? d.serviceFee.enabled : Boolean(f.enabled),
      percent: num(f.percent, d.serviceFee.percent, 10),
      flat: int(f.flat, d.serviceFee.flat, 5000),
      flatWaivedBelow: int(f.flatWaivedBelow, d.serviceFee.flatWaivedBelow),
      cap: int(f.cap, d.serviceFee.cap, 100_000),
    },
    business: {
      whatsapp: whatsapp.length >= 10 && whatsapp.length <= 15 ? whatsapp : d.business.whatsapp,
      phone: text(b.phone, 20),
      address: text(b.address, 120, d.business.address) || d.business.address,
      pickupNote: text(b.pickupNote, 200),
      announcement: text(b.announcement, 160),
      announcementEnabled: Boolean(b.announcementEnabled),
    },
    hours: normalizeHours(s.hours),
    closures: (Array.isArray(s.closures) ? s.closures : [])
      .filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(String(c?.date)))
      .slice(0, 30)
      .map((c) => ({ date: c.date, note: text(c.note, 60) })),
  };
}
