import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import OrderingSettings from "../components/merchant/settings/OrderingSettings.jsx";
import DeliverySettings from "../components/merchant/settings/DeliverySettings.jsx";
import FeeSettings from "../components/merchant/settings/FeeSettings.jsx";
import HoursSettings from "../components/merchant/settings/HoursSettings.jsx";
import BusinessSettings from "../components/merchant/settings/BusinessSettings.jsx";
import AlertsSettings from "../components/merchant/settings/AlertsSettings.jsx";
import IntegrationsPanel from "../components/merchant/settings/IntegrationsPanel.jsx";
import SecuritySettings from "../components/merchant/settings/SecuritySettings.jsx";
import SettingsPanel from "../components/merchant/SettingsPanel.jsx";
import OverviewPanel from "../components/merchant/OverviewPanel.jsx";
import OrdersPanel, { HourBars, Kpi, OrderRow } from "../components/merchant/OrdersPanel.jsx";
import MerchantLogin from "../components/merchant/MerchantLogin.jsx";
import MockPaymentPage from "../pages/MockPaymentPage.jsx";
import { integrationStatus } from "../lib/integrations.js";
import { DEMO_ZONES } from "../demo/demoStore.js";
import { defaultMenuDoc } from "../lib/menuDoc.js";
import { normalizeSettings } from "../lib/settings.js";
import { breakdowns } from "../lib/orderStats.js";

const noop = () => {};
const settings = normalizeSettings({ zones: DEMO_ZONES, freeDeliveryAbove: 8000, minOrder: 1500, closures: [{ date: "2026-12-25", note: "Christmas" }] });
const html = (node) => renderToStaticMarkup(node);

describe("settings cards", () => {
  it("Ordering: switches, minimum order and prep time", () => {
    const out = html(<OrderingSettings settings={settings} set={noop} />);
    ["Taking orders", "Pause automatically outside opening hours", "Minimum order", "Ready for pickup in"].forEach((t) => expect(out).toContain(t));
    expect(out).toContain('role="switch"');
  });

  it("Delivery: lists the areas with fee, ETA and minimum, and offers to add more", () => {
    const out = html(<DeliverySettings settings={settings} set={noop} />);
    expect(out).toContain("High Level");
    expect(out).toContain("₦500");
    expect(out).toContain("Add delivery area");
    expect(out).toContain("Free delivery from");
    expect(out).not.toContain("Flat delivery fee"); // hidden once areas exist
  });

  it("Delivery: with no areas it shows the flat fee and a one-tap sample", () => {
    const out = html(<DeliverySettings settings={normalizeSettings({ zones: [] })} set={noop} />);
    expect(out).toContain("Flat delivery fee");
    expect(out).toContain("Start from sample areas");
  });

  it("Fees: shows the live calculator with the computed fee", () => {
    const out = html(<FeeSettings settings={settings} set={noop} />);
    expect(out).toContain("Calculator");
    expect(out).toContain("Customer pays fee");
    expect(out).toContain("Customer total");
    expect(out).toContain("Check them against your own Paystack plan");
  });

  it("Hours: seven days, closures and the copy-Monday shortcut", () => {
    const out = html(<HoursSettings settings={settings} set={noop} />);
    expect(out.match(/aria-label="\w+ opens"/g)).toHaveLength(7);
    expect(out).toContain("2026-12-25");
    expect(out).toContain("Copy Monday to every day");
  });

  it("Hours: flags a day whose closing time is not after its opening time", () => {
    // The console edits the raw draft (normalisation only happens on publish), so feed the component a raw invalid day.
    const bad = { ...settings, hours: settings.hours.map((h) => (h.day === "Monday" ? { ...h, open: "18:00", close: "09:00" } : h)) };
    const out = html(<HoursSettings settings={bad} set={noop} />);
    expect(out).toContain("Closing time must be after opening time");
    expect(out).toContain("border-red-400");
    expect(html(<HoursSettings settings={settings} set={noop} />)).not.toContain("Closing time must be after opening time");
  });

  it("normalising an invalid day closes it instead of publishing nonsense", () => {
    const fixed = normalizeSettings({ hours: [{ day: "Monday", open: "18:00", close: "09:00" }] });
    expect(fixed.hours[0]).toMatchObject({ day: "Monday", closed: true });
    expect(fixed.hours[0].close > fixed.hours[0].open).toBe(true);
  });

  it("Business: WhatsApp number with a test link, address, pickup note and announcement", () => {
    const out = html(<BusinessSettings settings={settings} set={noop} />);
    expect(out).toContain('aria-label="Test this WhatsApp number"');
    expect(out).toContain("https://wa.me/2348062624447");
    ["Address", "Pickup instructions", "Show an announcement banner"].forEach((t) => expect(out).toContain(t));
  });

  it("Business: warns about an invalid WhatsApp number while it is being typed", () => {
    const bad = { ...settings, business: { ...settings.business, whatsapp: "123" } };
    expect(html(<BusinessSettings settings={bad} set={noop} />)).toContain("Use international format");
    expect(html(<BusinessSettings settings={settings} set={noop} />)).not.toContain("Use international format");
  });

  it("normalising an invalid WhatsApp number falls back to the default, so a bad value can never be published", () => {
    expect(normalizeSettings({ business: { whatsapp: "123" } }).business.whatsapp).toBe("2348062624447");
    expect(normalizeSettings({ business: { whatsapp: "+234 701 111 2222" } }).business.whatsapp).toBe("2347011112222");
  });

  it("Alerts: renders a loading state first, with the simulated badge and the planned channels hidden until config loads", () => {
    const out = html(<AlertsSettings capabilities={{ email: false }} />);
    expect(out).toContain("Kitchen alerts");
    expect(out).toContain("Simulated");
    expect(out).toContain('aria-label="Loading alerts"');
  });

  it("Security: demo hint shows the setup password, live mode does not", () => {
    expect(html(<SecuritySettings demo onPasswordChanged={noop} onLogout={noop} />)).toContain("jays-setup");
    expect(html(<SecuritySettings demo={false} onPasswordChanged={noop} onLogout={noop} />)).not.toContain("jays-setup");
  });

  it("Settings panel: section strip plus every card, and the forced password banner", () => {
    const draft = defaultMenuDoc();
    const out = html(<SettingsPanel draft={draft} setDraft={noop} capabilities={{ storage: false }} demo forcePasswordChange onPasswordChanged={noop} onLogout={noop} />);
    ["Ordering", "Delivery", "Fees", "Hours", "Business", "Alerts", "Go live", "Security"].forEach((label) => expect(out).toContain(`>${label}</button>`));
    ["settings-ordering", "settings-delivery", "settings-fees", "settings-hours", "settings-business", "settings-alerts", "settings-integrations", "settings-security"].forEach((id) => expect(out).toContain(`id="${id}"`));
    expect(out).toContain("Set your own password");
  });
});

describe("integrations", () => {
  it("reports demo mode honestly", () => {
    const items = integrationStatus({ storage: false, payments: "demo", email: false, orderStatus: false }, true);
    expect(items.map((i) => [i.key, i.state])).toEqual([["storage", "demo"], ["payments", "demo"], ["email", "demo"], ["orderStatus", "demo"]]);
  });

  it("reports a live deployment with a test key as connected-but-test", () => {
    const items = integrationStatus({ storage: true, payments: "test", email: false, orderStatus: true }, false);
    expect(items.find((i) => i.key === "payments")).toMatchObject({ state: "connected", label: "Test mode", tone: "warn" });
    expect(items.find((i) => i.key === "orderStatus").state).toBe("connected");
    expect(items.find((i) => i.key === "email").state).toBe("demo");
  });

  it("renders what works today, what to connect, the go-live checklist and the Hobby-plan warning", () => {
    const out = html(<IntegrationsPanel capabilities={{ storage: false }} demo />);
    ["What works today", "To connect", "Go-live checklist", "Hobby plan", "Reset demo data", "WhatsApp &amp; SMS alerts"].forEach((t) => expect(out.replace("restricts the free Hobby plan", "Hobby plan")).toContain(t));
  });

  it("hides the reset button in live mode", () => {
    expect(html(<IntegrationsPanel capabilities={{ storage: true, payments: "live" }} demo={false} />)).not.toContain("Reset demo data");
  });
});

describe("orders pieces", () => {
  const order = {
    id: "o1", code: "JB-ABCDE", fulfilment: "delivery", fulfilmentStatus: "preparing",
    zone: { id: "high-level", name: "High Level" },
    items: [{ id: 1, name: "Party Jollof Rice", quantity: 2, lineTotal: 3000 }],
    deliveryFee: 500, serviceFee: 53, total: 3553,
    customer: { name: "Ada Obi", phone: "2348062624447", address: "12 High Level", note: "No pepper" },
    payment: { reference: "r-1", channel: "bank_transfer", paidAt: "2026-10-25T10:00:00Z", mode: "demo" },
    alert: { channel: "email", status: "simulated" },
  };

  it("OrderRow shows the status pill when tracking is on and hides it when not", () => {
    expect(html(<OrderRow order={order} canTrack onAdvance={noop} />)).toContain("Preparing");
    expect(html(<OrderRow order={order} canTrack={false} onAdvance={noop} />)).not.toContain("Preparing");
  });

  it("OrderRow header names the delivery area and the amount", () => {
    const out = html(<OrderRow order={order} canTrack onAdvance={noop} />);
    expect(out).toContain("High Level");
    expect(out).toContain("₦3,553");
  });

  it("HourBars marks the busiest hour and labels the axis", () => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: hour === 19 ? 9 : hour === 13 ? 4 : 0 }));
    const out = html(<HourBars hours={hours} />);
    expect(out).toContain("Busiest hour: 19:00");
    expect(out).toContain("bg-sun-500");
    expect(out).toContain("6pm");
  });

  it("breakdowns buckets by Lagos hour, split and channel", () => {
    const orders = [
      { fulfilment: "pickup", total: 1000, payment: { paidAt: "2026-10-25T12:30:00Z", channel: "card" } }, // 13:30 Lagos
      { fulfilment: "delivery", total: 2000, payment: { paidAt: "2026-10-25T12:45:00Z", channel: "card" } },
      { fulfilment: "delivery", total: 2000, payment: { paidAt: "2026-10-25T18:10:00Z", channel: "ussd" } }, // 19:10 Lagos
    ];
    const b = breakdowns(orders);
    expect(b.hours).toHaveLength(24);
    expect(b.hours[13].orders).toBe(2);
    expect(b.hours[19].orders).toBe(1);
    expect(b.split).toEqual({ pickup: 1, delivery: 2 });
    expect(b.channels).toEqual({ card: 2, ussd: 1 });
  });

  it("Kpi renders label and value; OrdersPanel starts in a loading state", () => {
    expect(html(<Kpi label="Sales" value="₦9,000" />)).toContain("₦9,000");
    expect(html(<OrdersPanel canTrack />)).toContain('aria-label="Loading orders"');
  });
});

describe("overview, login and demo payment page", () => {
  it("Overview greets, shows state chips, quick actions and going-live progress", () => {
    const draft = defaultMenuDoc();
    draft.items[0].isAvailable = false;
    const out = html(<OverviewPanel draft={draft} saved={draft} capabilities={{ storage: false }} demo canTrack onNavigate={noop} onToggleOrders={noop} />);
    ["Jay&#x27;s Kitchen", "Taking orders", "Pause orders", "Needs attention", "Sold out right now", draft.items[0].name, "Add or edit dishes", "Edit home screen", "View storefront", "Preview kitchen alert", "0 of 4 connected"].forEach((t) => expect(out).toContain(t));
    expect(out).toMatch(/Good (morning|afternoon|evening)/);
  });

  it("Overview shows Resume when orders are paused", () => {
    const draft = defaultMenuDoc();
    draft.settings = { ...draft.settings, acceptingOrders: false };
    expect(html(<OverviewPanel draft={draft} saved={draft} capabilities={{}} demo canTrack onNavigate={noop} onToggleOrders={noop} />)).toContain("Resume orders");
  });

  it("Login shows the demo hint only in demo mode", () => {
    expect(html(<MerchantLogin demo onUnlocked={noop} />)).toContain("jays-setup");
    expect(html(<MerchantLogin onUnlocked={noop} />)).not.toContain("jays-setup");
  });

  it("Demo payment page renders its loading skeleton and the demo label", () => {
    const out = html(<MemoryRouter initialEntries={["/pay/demo/demo-1"]}><MockPaymentPage /></MemoryRouter>);
    expect(out).toContain("Demo · no real money");
    expect(out).toContain("Secure checkout");
  });
});
