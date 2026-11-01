import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import MenuProvider from "../context/MenuProvider.jsx";
import StorefrontPage from "../pages/StorefrontPage.jsx";
import CategoryIcon from "../components/icons/CategoryIcon.jsx";
import Receipt, { NextSteps } from "../components/invoice/Receipt.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import CategoryBar from "../components/storefront/CategoryBar.jsx";
import ProductCard from "../components/storefront/ProductCard.jsx";
import FoodImage from "../components/ui/FoodImage.jsx";
import InfoSheet from "../components/layout/InfoSheet.jsx";
import StatusBanners from "../components/layout/StatusBanners.jsx";
import { ICON_KEYS } from "../lib/categoryIcons.js";
import { DEFAULT_SETTINGS, normalizeSettings } from "../lib/settings.js";

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

  it("renders the branded header with the info button, and the empty tray", () => {
    expect(html).toContain("Jay&#x27;s Bistro");
    expect(html).toContain("Arabian Tea");
    expect(html).toContain('aria-label="Opening hours, delivery and contact"');
    expect(html).toContain("Your tray is empty");
  });

  it("no longer spends the first screen on the open/pickup/delivery strip", () => {
    expect(html).not.toContain("Open · until");
    expect(html).not.toContain("Closed · opens");
    expect(html).toContain("Welcome to Jay&#x27;s Bistro"); // the eyebrow stays
  });

  it("renders the six-slide hero with dots overlaid, and the two-card sub-hero", () => {
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html.match(/aria-roledescription="slide"/g)).toHaveLength(6);
    expect(html.match(/aria-label="Go to slide \d"/g)).toHaveLength(6);
    expect(html).toContain("surface-apricot");
    expect(html).toContain("More from the kitchen");
  });

  it("renders six sticky category pills with line icons, no All pill, and the search magnifier at the end", () => {
    const bar = html.match(/<nav aria-label="Menu categories"[\s\S]*?<\/nav>/)[0];
    ["Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"].forEach((name) => expect(bar).toContain(`<span>${name}</span>`));
    expect(bar).not.toContain("<span>All</span>");
    expect(bar.match(/<svg/g)).toHaveLength(6);
    expect(html).toContain('aria-label="Search the menu"');
  });

  it("puts the pills above the dishes (and the search inside the bar, not below it)", () => {
    expect(html.indexOf('aria-label="Menu categories"')).toBeLessThan(html.indexOf('aria-label="Add '));
    expect(html).not.toContain("Search jollof, shawarma, tea…</div>");
  });

  it("renders the FULL catalogue as one continuous grid without repeating category headings", () => {
    expect(html.match(/aria-label="Add [^"]+ to tray"/g)).toHaveLength(64);
    expect(html.match(/data-group-start="/g)).toHaveLength(6);
    expect(html.match(/<h2 class="sr-only">/g)).toHaveLength(6); // structure for screen readers only
    expect(html).not.toMatch(/class="[^"]*font-display[^"]*">\s*(Meals|Protein)/);
  });

  it("uses honest icon tiles for dishes without an accurate photo", () => {
    expect(html).toContain('role="img" aria-label="Pounded Yam"');
  });

  it("renders the AI concierge entry point and the /menu variant", () => {
    expect(html).toContain("Open AI concierge");
    expect(render({ scrollToMenu: true })).toContain("Jay&#x27;s Bistro");
  });
});

describe("ProductCard add control", () => {
  const item = { id: 1, name: "Party Jollof Rice", price: 1500, category: "Meals", image: "menu/party-jollof-rice.png", imageStyle: "cutout", isAvailable: true };
  const card = (props) => renderToStaticMarkup(<ProductCard item={item} icon="meals" quantity={0} onOpen={() => {}} onAdd={() => {}} onDecrement={() => {}} {...props} />);

  it("shows a round + at zero", () => {
    const html = card();
    expect(html).toContain('aria-label="Add Party Jollof Rice to tray"');
    expect(html).not.toContain("quantity");
  });

  it("turns into − 2 + once added", () => {
    const html = card({ quantity: 2 });
    expect(html).toContain('aria-label="Party Jollof Rice quantity"');
    expect(html).toContain('aria-label="Decrease Party Jollof Rice"');
    expect(html).toContain('aria-label="Increase Party Jollof Rice"');
    expect(html).toContain(">2<");
  });

  it("stops at the maximum and hides the control when sold out", () => {
    expect(card({ quantity: 20 })).toMatch(/aria-label="Increase Party Jollof Rice"[^>]*disabled|disabled=""[^>]*aria-label="Increase/);
    const sold = card({ item: { ...item, isAvailable: false } });
    expect(sold).toContain("Sold out today");
    expect(sold).not.toContain("Add Party Jollof Rice");
  });

  it("marks only the first card of a group as the scroll anchor", () => {
    expect(card({ groupStart: true })).toContain('data-group-start="Meals"');
    expect(card()).not.toContain("data-group-start");
  });
});

describe("CategoryBar", () => {
  const groups = [{ name: "Meals", icon: "meals" }, { name: "Protein", icon: "protein" }];
  const bar = (props) => renderToStaticMarkup(<CategoryBar groups={groups} active="Protein" onSelect={() => {}} searchOpen={false} query="" onQueryChange={() => {}} onOpenSearch={() => {}} onCloseSearch={() => {}} {...props} />);

  it("marks the scroll-spied pill as current", () => {
    const html = bar();
    expect(html).toContain('data-pill="Protein" aria-current="true"');
    expect(html).not.toContain('data-pill="Meals" aria-current');
  });

  it("hides the pills and reveals the search field when search is open", () => {
    const html = bar({ searchOpen: true, query: "jol" });
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('value="jol"');
    expect(html).toContain('aria-label="Clear search"');
  });

  it("keeps the search input at 16px so iPhones don't zoom", () => {
    expect(bar()).toContain("text-base");
  });
});

describe("FoodImage fallback", () => {
  it("shows the category icon, never a photo, for the placeholder", () => {
    const html = renderToStaticMarkup(<FoodImage src="menu/placeholder.svg" alt="Amala" icon="meals" />);
    expect(html).toContain('role="img" aria-label="Amala"');
    expect(html).not.toContain("<img");
  });
});

describe("InfoSheet and banners", () => {
  const settings = normalizeSettings({
    zones: [{ name: "High Level", fee: 500, etaMins: [20, 35] }, { name: "Old GRA", fee: 1200, enabled: false }],
    freeDeliveryAbove: 8000, minOrder: 2000, deliveryNote: "Outside these areas? WhatsApp us.", business: { phone: "+234 806 262 4447", pickupNote: "Collect at the side counter" },
  });

  it("lists hours, active delivery areas with fees and ETAs, and the contact buttons", () => {
    const html = renderToStaticMarkup(<InfoSheet open onClose={() => {}} settings={settings} />);
    ["Monday", "8 AM – 10 PM", "High Level", "₦500", "20–35 min", "Free delivery on orders from ₦8,000", "Minimum order ₦2,000", "Outside these areas? WhatsApp us.", "Collect at the side counter", "WhatsApp us", "tel:+2348062624447"].forEach((t) => expect(html).toContain(t));
    expect(html).not.toContain("Old GRA"); // disabled areas are hidden from customers
  });

  it("shows banners only when there is something to say", () => {
    expect(renderToStaticMarkup(<StatusBanners settings={DEFAULT_SETTINGS} />)).toBe("");
    expect(renderToStaticMarkup(<StatusBanners settings={{ ...DEFAULT_SETTINGS, acceptingOrders: false }} />)).toContain("not taking online orders");
    const note = normalizeSettings({ business: { announcement: "Closed Sunday", announcementEnabled: true } });
    expect(renderToStaticMarkup(<StatusBanners settings={note} />)).toContain("Closed Sunday");
  });
});

describe("CategoryIcon", () => {
  it("draws every icon key and falls back for unknown ones", () => {
    ICON_KEYS.forEach((k) => expect(renderToStaticMarkup(<CategoryIcon name={k} />)).toMatch(/<(path|circle|ellipse|rect)/));
    expect(renderToStaticMarkup(<CategoryIcon name="nope" />)).toContain("<circle");
  });

  it("draws the protein icon as a skewer with three chunks", () => {
    expect(renderToStaticMarkup(<CategoryIcon name="protein" />).match(/<rect/g)).toHaveLength(3);
  });
});

describe("Receipt", () => {
  const receipt = {
    id: "20261025abcdefghijklmnop", code: "JB-ABCDE", status: "paid", fulfilment: "delivery",
    items: [{ id: 1, name: "Party Jollof Rice", unitPrice: 1500, quantity: 2, lineTotal: 3000 }],
    subtotal: 3000, deliveryFee: 500, serviceFee: 53, total: 3553, zone: { id: "high-level", name: "High Level", fee: 500, etaMins: [20, 35] }, prepMins: [20, 30],
    customer: { name: "Ada Obi", phone: "2348062624447", email: "ada@example.com", address: "12 High Level", note: "No pepper" },
    payment: { reference: "20261025abcdefghijklmnop-1", channel: "bank_transfer", paidAt: "2026-10-25T10:00:00Z", amount: 3553, currency: "NGN", mode: "live" },
  };

  it("shows the code, lines, zone, both fee lines, totals, payment details and a PAID stamp", () => {
    const html = renderToStaticMarkup(<Receipt receipt={receipt} mode="live" />);
    ["JB-ABCDE", "2×", "Party Jollof Rice", "Delivery · High Level", "Online payment fee", "₦53", "₦3,553", "Bank transfer · Paystack", "High Level — 12 High Level", "No pepper", ">PAID<"].forEach((t) => expect(html).toContain(t));
  });

  it("stamps mock and test payments TEST, demo payments DEMO, and never PAID", () => {
    for (const [mode, stamp] of [["mock", "TEST"], ["test", "TEST"], ["demo", "DEMO"]]) {
      const html = renderToStaticMarkup(<Receipt receipt={receipt} mode={mode} />);
      expect(html).toContain(`>${stamp}<`);
      expect(html).not.toContain(">PAID<");
    }
  });

  it("uses the merchant's configured WhatsApp number", () => {
    expect(renderToStaticMarkup(<Receipt receipt={receipt} mode="live" whatsapp="2347011112222" />)).toContain("https://wa.me/2347011112222");
  });

  it("tells the customer what happens next, with the zone's delivery estimate", () => {
    expect(renderToStaticMarkup(<NextSteps receipt={receipt} />)).toContain("20–35 min");
    const pickup = renderToStaticMarkup(<NextSteps receipt={{ ...receipt, fulfilment: "pickup", zone: null }} />);
    expect(pickup).toContain("JB-ABCDE");
    expect(pickup).toContain("20–30 min");
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
