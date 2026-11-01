import { describe, expect, it } from "vitest";
import { renderOrderPaidAlert } from "../lib/alertTemplate.js";
import { nextAction, STATUSES } from "../lib/orderStatus.js";

const order = {
  code: "JB-ABCDE", fulfilment: "delivery", subtotal: 9000, deliveryFee: 500, serviceFee: 235, total: 9735,
  zone: { name: "High Level" },
  items: [{ id: 1, name: "Party Jollof Rice", quantity: 2, lineTotal: 3000 }, { id: 2, name: "Isi-ewu <b>", quantity: 1, lineTotal: 6000 }],
  customer: { name: "Ada Obi", phone: "2348062624447", address: "12 High Level", note: "No pepper" },
  payment: { paidAt: "2026-10-25T10:00:00Z", channel: "bank_transfer" },
};

describe("renderOrderPaidAlert", () => {
  const out = renderOrderPaidAlert(order, { consoleUrl: "https://jays-bistro.vercel.app/merchant" });

  it("builds a scannable subject", () => {
    expect(out.subject).toBe("New paid order JB-ABCDE · ₦9,735 · Delivery");
  });

  it("includes everything the kitchen needs in plain text", () => {
    ["JB-ABCDE", "2x Party Jollof Rice", "TOTAL ₦9,735", "High Level — 12 High Level", "Ada Obi", "+2348062624447", "Note: No pepper", "Service fee ₦235", "/merchant"].forEach((t) => expect(out.text).toContain(t));
  });

  it("escapes customer-supplied text in the HTML version", () => {
    expect(out.html).toContain("Isi-ewu &lt;b&gt;");
    expect(out.html).not.toContain("<b>");
    expect(out.html).toContain('href="tel:+2348062624447"');
  });

  it("words pickup orders correctly", () => {
    const pickup = renderOrderPaidAlert({ ...order, fulfilment: "pickup", zone: null });
    expect(pickup.subject).toContain("Pickup");
    expect(pickup.text).toContain("PICKUP: Pickup at the restaurant");
  });
});

describe("order status workflow", () => {
  it("walks new → preparing → ready → completed and then stops", () => {
    let status = STATUSES[0];
    const seen = [status];
    for (let a = nextAction(status, "pickup"); a; a = nextAction(status, "pickup")) {
      status = a.to;
      seen.push(status);
    }
    expect(seen).toEqual(["new", "preparing", "ready", "completed"]);
  });

  it("words the last steps for delivery vs pickup", () => {
    expect(nextAction("ready", "delivery").label).toBe("Mark delivered");
    expect(nextAction("ready", "pickup").label).toBe("Mark collected");
  });
});
