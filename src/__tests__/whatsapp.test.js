import { describe, expect, it } from "vitest";
import { buildWhatsAppLink } from "../lib/whatsapp.js";
import { formatPrice } from "../lib/format.js";

describe("formatPrice", () => {
  it("formats naira with thousands separators", () => {
    expect(formatPrice(3500)).toBe("₦3,500");
    expect(formatPrice(500)).toBe("₦500");
    expect(formatPrice(30000)).toBe("₦30,000");
  });
});

describe("buildWhatsAppLink", () => {
  it("returns the bare chat link for an empty cart", () => {
    expect(buildWhatsAppLink([], "2348062624447")).toBe("https://wa.me/2348062624447");
  });

  it("encodes the order message with line items and total", () => {
    const lines = [
      { item: { name: "Party Jollof Rice" }, quantity: 2, lineTotal: 3000 },
      { item: { name: "Isi-ewu" }, quantity: 1, lineTotal: 6000 },
    ];
    const url = buildWhatsAppLink(lines, "2348062624447");
    expect(url.startsWith("https://wa.me/2348062624447?text=")).toBe(true);

    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("Hello Jay's Bistro, I would like to place an order:");
    expect(text).toContain("▪ 2x Party Jollof Rice - ₦3,000");
    expect(text).toContain("▪ 1x Isi-ewu - ₦6,000");
    expect(text).toContain("*Total Order Value: ₦9,000*");
  });

  it("appends the expiring invoice link and honours a total that includes delivery", () => {
    const lines = [{ item: { name: "Isi-ewu" }, quantity: 1, lineTotal: 6000 }];
    const url = buildWhatsAppLink(lines, "2348062624447", { invoiceUrl: "https://jays-bistro.vercel.app/invoice/abc", total: 7000 });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("*Total Order Value: ₦7,000*");
    expect(text).toContain("Invoice (valid 24h, pay online): https://jays-bistro.vercel.app/invoice/abc");
  });
});
