import { describe, expect, it } from "vitest";
import { computeServiceFee, computeTotals, toKobo } from "../lib/pricing.js";
import { DEFAULT_SETTINGS, normalizeSettings } from "../lib/settings.js";

const lines = [{ unitPrice: 1500, quantity: 2 }, { unitPrice: 6000, quantity: 1 }];

describe("computeTotals", () => {
  it("adds the delivery fee only for delivery", () => {
    const s = { ...DEFAULT_SETTINGS, deliveryFee: 1000 };
    expect(computeTotals(lines, "pickup", s)).toMatchObject({ subtotal: 9000, deliveryFee: 0, total: 9000 });
    expect(computeTotals(lines, "delivery", s)).toMatchObject({ subtotal: 9000, deliveryFee: 1000, total: 10000 });
  });

  it("flags orders under the minimum and says by how much", () => {
    const t = computeTotals([{ unitPrice: 1500, quantity: 1 }], "pickup", { ...DEFAULT_SETTINGS, minOrder: 2500 });
    expect(t).toMatchObject({ belowMinimum: true, shortBy: 1000 });
    expect(computeTotals(lines, "pickup", { ...DEFAULT_SETTINGS, minOrder: 2500 }).belowMinimum).toBe(false);
  });
});

describe("toKobo", () => {
  it("converts naira to kobo without float drift", () => {
    expect(toKobo(9000)).toBe(900000);
    expect(toKobo(1499.99)).toBe(149999);
  });
});

describe("normalizeSettings", () => {
  it("fills defaults and coerces junk safely", () => {
    expect(normalizeSettings()).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ deliveryFee: "-5", minOrder: "abc", acceptingOrders: false })).toMatchObject({ deliveryFee: 0, minOrder: 0, acceptingOrders: false });
    expect(normalizeSettings({ deliveryFee: 999999999 }).deliveryFee).toBeLessThanOrEqual(100000);
  });
});

const ZONES = [
  { id: "a", name: "Zone A", fee: 500, minOrder: 0, etaMins: [20, 30], enabled: true },
  { id: "b", name: "Zone B", fee: 900, minOrder: 6000, etaMins: [30, 45], enabled: true },
  { id: "c", name: "Zone C", fee: 300, minOrder: 0, etaMins: [0, 0], enabled: false },
];

describe("computeTotals with zones", () => {
  const settings = { ...DEFAULT_SETTINGS, zones: ZONES };

  it("uses the chosen zone's fee and flags a missing or disabled zone", () => {
    expect(computeTotals(lines, "delivery", settings, { zoneId: "a" })).toMatchObject({ deliveryFee: 500, total: 9500, zoneRequired: false });
    expect(computeTotals(lines, "delivery", settings, { zoneId: "c" }).zoneRequired).toBe(true);
    expect(computeTotals(lines, "delivery", settings, {}).zoneRequired).toBe(true);
    expect(computeTotals(lines, "pickup", settings, {}).zoneRequired).toBe(false);
  });

  it("applies the zone's own minimum on top of the global one", () => {
    const t = computeTotals([{ unitPrice: 5000, quantity: 1 }], "delivery", settings, { zoneId: "b" });
    expect(t).toMatchObject({ belowMinimum: true, shortBy: 1000, minOrder: 6000 });
    expect(computeTotals([{ unitPrice: 5000, quantity: 1 }], "pickup", settings).belowMinimum).toBe(false);
  });

  it("makes delivery free above the threshold", () => {
    const t = computeTotals(lines, "delivery", { ...settings, freeDeliveryAbove: 8000 }, { zoneId: "a" });
    expect(t).toMatchObject({ deliveryFee: 0, freeDelivery: true, total: 9000 });
    expect(computeTotals(lines, "delivery", { ...settings, freeDeliveryAbove: 20000 }, { zoneId: "a" }).deliveryFee).toBe(500);
  });

  it("falls back to the flat fee when no zone is enabled", () => {
    expect(computeTotals(lines, "delivery", { ...DEFAULT_SETTINGS, deliveryFee: 700 }).deliveryFee).toBe(700);
  });
});

describe("computeServiceFee", () => {
  const cfg = { enabled: true, percent: 1.5, flat: 100, flatWaivedBelow: 2500, cap: 2000 };

  it("charges percent, adds the flat part only from the threshold up, and caps", () => {
    expect(computeServiceFee(1000, cfg)).toBe(15);
    expect(computeServiceFee(2500, cfg)).toBe(138); // 37.5 + 100 → 138
    expect(computeServiceFee(9000, cfg)).toBe(235);
    expect(computeServiceFee(10_000_000, cfg)).toBe(2000);
  });

  it("is zero when disabled or for empty orders", () => {
    expect(computeServiceFee(9000, { ...cfg, enabled: false })).toBe(0);
    expect(computeServiceFee(0, cfg)).toBe(0);
  });

  it("is added only for online payment and shows in the total", () => {
    expect(computeTotals(lines, "pickup", DEFAULT_SETTINGS, { payOnline: true })).toMatchObject({ serviceFee: 235, total: 9235 });
    expect(computeTotals(lines, "pickup", DEFAULT_SETTINGS)).toMatchObject({ serviceFee: 0, total: 9000 });
  });

  it("applies the fee to items plus delivery", () => {
    const t = computeTotals(lines, "delivery", { ...DEFAULT_SETTINGS, deliveryFee: 1000 }, { payOnline: true });
    expect(t.serviceFee).toBe(computeServiceFee(10_000, DEFAULT_SETTINGS.serviceFee));
  });
});

