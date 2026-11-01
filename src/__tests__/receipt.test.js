import { describe, expect, it } from "vitest";
import { channelLabel, formatLagosDateTime, timeLeft } from "../lib/receipt.js";

describe("receipt helpers", () => {
  it("labels Paystack channels for humans", () => {
    expect(channelLabel("bank_transfer")).toBe("Bank transfer");
    expect(channelLabel("ussd")).toBe("USSD");
    expect(channelLabel("mobile_money")).toBe("Mobile money");
    expect(channelLabel("something_new")).toBe("something new");
    expect(channelLabel(undefined)).toBe("Online");
  });

  it("formats paid time in Lagos (UTC+1)", () => {
    const t = formatLagosDateTime("2026-10-25T22:30:00Z"); // 23:30 Lagos
    expect(t.time).toBe("11:30 PM");
    expect(t.date).toMatch(/25 Oct 2026/);
  });

  it("counts down to expiry", () => {
    const now = Date.parse("2026-10-25T10:00:00Z");
    expect(timeLeft("2026-10-26T09:48:00Z", now)).toBe("23h 48m");
    expect(timeLeft("2026-10-25T10:12:00Z", now)).toBe("12m");
    expect(timeLeft("2026-10-25T10:00:20Z", now)).toBe("1m");
    expect(timeLeft("2026-10-25T09:59:00Z", now)).toBeNull();
  });
});
