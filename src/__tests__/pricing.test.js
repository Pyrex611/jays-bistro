import { describe, expect, it } from "vitest";
import { computeTotals, toKobo } from "../lib/pricing.js";
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
