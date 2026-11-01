import { describe, expect, it } from "vitest";
import { DAYS, DEFAULT_SETTINGS, normalizeHours, normalizeSettings, normalizeZones } from "../lib/settings.js";

describe("normalizeZones", () => {
  it("drops nameless zones, clamps numbers, orders the ETA range and de-duplicates ids", () => {
    const zones = normalizeZones([
      { name: "High Level", fee: 500, etaMins: [40, 20] },
      { name: "High Level", fee: -5, minOrder: "abc" },
      { name: "X" },
      { name: "North Bank", fee: 999999999, enabled: false },
      null,
    ]);
    expect(zones.map((z) => z.name)).toEqual(["High Level", "High Level", "North Bank"]);
    expect(new Set(zones.map((z) => z.id)).size).toBe(3);
    expect(zones[0].etaMins).toEqual([20, 40]);
    expect(zones[1]).toMatchObject({ fee: 0, minOrder: 0 });
    expect(zones[2]).toMatchObject({ fee: 100000, enabled: false });
  });

  it("caps the list at 30 zones and survives non-arrays", () => {
    expect(normalizeZones(Array.from({ length: 50 }, (_, i) => ({ name: `Area ${i}` })))).toHaveLength(30);
    expect(normalizeZones("nope")).toEqual([]);
  });
});

describe("normalizeHours", () => {
  it("returns all seven days in order with defaults for anything invalid", () => {
    const hours = normalizeHours([{ day: "Monday", open: "25:00", close: "22:00" }, { day: "Sunday", closed: true, open: "10:00", close: "20:00" }]);
    expect(hours.map((h) => h.day)).toEqual(DAYS);
    expect(hours[0]).toMatchObject({ open: "08:00", close: "22:00", closed: false });
    expect(hours[6].closed).toBe(true);
  });

  it("treats a closing time at or before opening as closed", () => {
    expect(normalizeHours([{ day: "Tuesday", open: "10:00", close: "09:00" }])[1].closed).toBe(true);
  });
});

describe("normalizeSettings", () => {
  it("is idempotent and complete for empty input", () => {
    const once = normalizeSettings({});
    expect(normalizeSettings(once)).toEqual(once);
    expect(once.hours).toHaveLength(7);
    expect(once.serviceFee).toEqual(DEFAULT_SETTINGS.serviceFee);
  });

  it("validates the business details", () => {
    expect(normalizeSettings({ business: { whatsapp: "+234 806 262 4447" } }).business.whatsapp).toBe("2348062624447");
    expect(normalizeSettings({ business: { whatsapp: "123" } }).business.whatsapp).toBe(DEFAULT_SETTINGS.business.whatsapp);
    expect(normalizeSettings({ business: { announcement: "x".repeat(500) } }).business.announcement).toHaveLength(160);
  });

  it("bounds the service fee", () => {
    const f = normalizeSettings({ serviceFee: { percent: 99, flat: 999999, cap: -1 } }).serviceFee;
    expect(f.percent).toBeLessThanOrEqual(10);
    expect(f.flat).toBeLessThanOrEqual(5000);
    expect(f.cap).toBeGreaterThanOrEqual(0);
  });

  it("keeps only valid closure dates", () => {
    const s = normalizeSettings({ closures: [{ date: "2026-12-25", note: "Christmas" }, { date: "tomorrow" }, { date: "2026-13-01x" }] });
    expect(s.closures).toEqual([{ date: "2026-12-25", note: "Christmas" }]);
  });
});
