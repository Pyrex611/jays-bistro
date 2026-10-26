import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import MenuProvider from "../context/MenuProvider.jsx";
import StorefrontPage from "../pages/StorefrontPage.jsx";
import CategoryIcon from "../components/icons/CategoryIcon.jsx";
import Receipt from "../components/invoice/Receipt.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import { DEFAULT_SETTINGS } from "../lib/settings.js";
import { ICON_KEYS } from "../lib/categoryIcons.js";

const render = (props = {}) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <MenuProvider>
        <StorefrontPage {...props} />
      </MenuProvider>
    </MemoryRouter>,
  );

describe("StorefrontPage (server render smoke test)", () => {
  const html = render();

  it("renders the branded header, open/closed strip and the empty tray", () => {
    expect(html).toContain("Jay&#x27;s Bistro");
    expect(html).toContain("Arabian Tea");
    expect(html).toContain("Pickup");
    expect(html).toContain("Your tray is empty");
  });

  it("renders hero, sub-hero, search and sticky category pills with icons", () => {
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain("More from the kitchen");
    expect(html).toContain('aria-label="Search the menu"');
    ["All", "Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"].forEach((name) => expect(html).toContain(`<span>${name}</span>`));
    expect(html.match(/<nav aria-label="Menu categories"[\s\S]*?<\/nav>/)[0].match(/<svg/g)).toHaveLength(7);
  });

  it("renders the FULL catalogue grouped into titled category sections", () => {
    expect(html.match(/aria-label="Add [^"]+ to tray"/g)).toHaveLength(64);
    ["Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"].forEach((c) => expect(html).toContain(`id="cat-${c}"`));
  });

  it("renders the AI concierge entry point and the /menu variant", () => {
    expect(html).toContain("Open AI concierge");
    expect(render({ scrollToMenu: true })).toContain("Jay&#x27;s Bistro");
  });
});

describe("CategoryIcon", () => {
  it("draws every icon key and falls back for unknown ones", () => {
    ICON_KEYS.forEach((k) => expect(renderToStaticMarkup(<CategoryIcon name={k} />)).toMatch(/<(path|circle|ellipse)/));
    expect(renderToStaticMarkup(<CategoryIcon name="nope" />)).toContain("<circle");
  });
});

describe("Receipt", () => {
  const receipt = {
    id: "20261025abcdefghijklmnop", code: "JB-ABCDE", status: "paid", fulfilment: "delivery",
    items: [{ id: 1, name: "Party Jollof Rice", unitPrice: 1500, quantity: 2, lineTotal: 3000 }],
    subtotal: 3000, deliveryFee: 500, total: 3500,
    customer: { name: "Ada Obi", phone: "2348062624447", email: "ada@example.com", address: "12 High Level", note: "No pepper" },
    payment: { reference: "20261025abcdefghijklmnop-1", channel: "bank_transfer", paidAt: "2026-10-25T10:00:00Z", amount: 3500, currency: "NGN", mode: "live" },
  };

  it("shows the code, lines, totals, payment details and a PAID stamp", () => {
    const html = renderToStaticMarkup(<Receipt receipt={receipt} mode="live" />);
    ["JB-ABCDE", "2×", "Party Jollof Rice", "₦3,500", "Bank transfer · Paystack", "12 High Level", "No pepper", ">PAID<"].forEach((t) => expect(html).toContain(t));
  });

  it("stamps test payments as TEST, never PAID", () => {
    const html = renderToStaticMarkup(<Receipt receipt={receipt} mode="mock" />);
    expect(html).toContain(">TEST<");
    expect(html).not.toContain(">PAID<");
  });
});

describe("CartDrawer checkout row", () => {
  const item = { id: 1, name: "Party Jollof Rice", price: 1500, category: "Meals", image: "menu/party-jollof-rice.png", imageStyle: "cutout", isAvailable: true };
  const checkout = { busy: null, error: "", fieldErrors: {}, reset() {}, payOnline() {}, shareOnWhatsApp() {} };
  const drawer = (over = {}) =>
    renderToStaticMarkup(
      <CartDrawer open onClose={() => {}} lines={[{ item, quantity: 2, lineTotal: 3000 }]} subtotal={3000} settings={DEFAULT_SETTINGS} unavailable={[]} iconByCategory={{}} checkout={checkout} onIncrement={() => {}} onDecrement={() => {}} onRemove={() => {}} {...over} />,
    );

  it("puts a round WhatsApp button to the left of the main Checkout button", () => {
    const html = drawer();
    const whatsapp = html.indexOf('aria-label="Order on WhatsApp"');
    const pay = html.indexOf(">Checkout</button>");
    expect(whatsapp).toBeGreaterThan(-1);
    expect(pay).toBeGreaterThan(whatsapp);
    expect(html).toContain("rounded-full bg-[#25D366]");
    expect(html).toContain("₦3,000");
  });

  it("blocks both buttons when orders are paused, an item is sold out, or the minimum isn't met", () => {
    const disabledCount = (html) => (html.match(/<button[^>]*disabled=""[^>]*>/g) ?? []).filter((b) => b.includes("Order on WhatsApp") || b.includes("h-14 flex-1")).length;
    expect(disabledCount(drawer())).toBe(0);
    expect(drawer({ settings: { ...DEFAULT_SETTINGS, acceptingOrders: false } })).toContain("We&#x27;re not taking orders right now.");
    expect(disabledCount(drawer({ settings: { ...DEFAULT_SETTINGS, acceptingOrders: false } }))).toBe(2);
    expect(drawer({ unavailable: [{ item: { ...item, isAvailable: false } }] })).toContain("Sold out today: Party Jollof Rice");
    expect(drawer({ settings: { ...DEFAULT_SETTINGS, minOrder: 5000 } })).toContain("Minimum order is ₦5,000. Add ₦2,000 more.");
  });
});
