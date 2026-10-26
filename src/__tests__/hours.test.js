import { describe, expect, it } from "vitest";
import { getOpenStatus } from "../lib/hours.js";
import { SITE } from "../config/site.js";

// Lagos is UTC+1 all year. 2026-10-26 is a Monday.
const at = (iso) => new Date(iso);

describe("getOpenStatus (Africa/Lagos)", () => {
  it("is open during trading hours and says when it closes", () => {
    expect(getOpenStatus(SITE.hours, at("2026-10-26T10:00:00Z"))).toEqual({ open: true, label: "Open · until 10 PM" }); // 11:00 Lagos
  });

  it("is closed before opening and says when it opens today", () => {
    expect(getOpenStatus(SITE.hours, at("2026-10-26T05:30:00Z"))).toEqual({ open: false, label: "Closed · opens today at 8 AM" }); // 06:30 Lagos
  });

  it("is closed after closing and points to tomorrow", () => {
    expect(getOpenStatus(SITE.hours, at("2026-10-26T22:30:00Z"))).toEqual({ open: false, label: "Closed · opens tomorrow at 8 AM" }); // 23:30 Lagos Mon
  });

  it("uses Saturday and Sunday hours", () => {
    expect(getOpenStatus(SITE.hours, at("2026-10-31T21:30:00Z")).label).toBe("Open · until 11 PM"); // Sat 22:30 Lagos
    expect(getOpenStatus(SITE.hours, at("2026-11-01T08:00:00Z")).label).toBe("Closed · opens today at 10 AM"); // Sun 09:00 Lagos
  });

  it("handles a business with no hours listed", () => {
    expect(getOpenStatus([], at("2026-10-26T10:00:00Z"))).toEqual({ open: false, label: "Closed" });
  });
});
