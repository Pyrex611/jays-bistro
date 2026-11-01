import { demoStorage } from "./storage.js";
import { generateSeedOrders } from "./seed.js";
import { defaultMenuDoc, validateMenuDoc } from "../lib/menuDoc.js";
import { normalizeSettings } from "../lib/settings.js";

/** Everything the demo backend persists, in the browser. Keys are namespaced `jb:demo:*`. */
export const DEMO_PASSWORD = "jays-setup";

const KEY = { menu: "jb:demo:menu", orders: "jb:demo:orders", invoices: "jb:demo:invoices", notify: "jb:demo:notify", alerts: "jb:demo:alerts", pw: "jb:demo:pw" };

/** Sample delivery areas so the demo console isn't empty. The merchant edits or deletes them. */
export const DEMO_ZONES = [
  { id: "high-level", name: "High Level", fee: 500, minOrder: 0, etaMins: [20, 35], enabled: true },
  { id: "north-bank", name: "North Bank", fee: 700, minOrder: 3000, etaMins: [25, 40], enabled: true },
  { id: "wurukum", name: "Wurukum", fee: 800, minOrder: 3000, etaMins: [30, 45], enabled: true },
  { id: "wadata", name: "Wadata", fee: 600, minOrder: 0, etaMins: [20, 30], enabled: true },
  { id: "old-gra", name: "Old GRA", fee: 1200, minOrder: 5000, etaMins: [40, 60], enabled: false },
];

export const DEFAULT_NOTIFY = {
  email: { enabled: true, recipients: ["kitchen@jaysbistro.example"] },
  whatsapp: { enabled: false, number: "" },
  sms: { enabled: false, number: "" },
  events: { orderPaid: true, invoiceCreated: false, paymentMismatch: true, dailySummary: false },
  alertOnTest: false,
};

const emit = (name) => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
};

export const demoStore = {
  menu: {
    get() {
      const stored = demoStorage.get(KEY.menu);
      if (stored) return stored;
      const doc = defaultMenuDoc();
      return { ...doc, settings: normalizeSettings({ ...doc.settings, zones: DEMO_ZONES }), version: 0, source: "demo" };
    },
    save(input, baseVersion) {
      const current = demoStore.menu.get();
      if (baseVersion !== current.version) throw Object.assign(new Error("The menu changed since you opened it."), { status: 409, data: { error: "The menu changed since you opened it.", current } });
      const v = validateMenuDoc(input);
      if (!v.ok) throw Object.assign(new Error("Some fields need fixing."), { status: 400, data: { error: "Some fields need fixing.", errors: v.errors } });
      const doc = { ...v.doc, version: current.version + 1, updatedAt: new Date().toISOString(), source: "demo" };
      demoStorage.set(KEY.menu, doc);
      emit("jb:menu-published");
      return doc;
    },
    exists: () => Boolean(demoStorage.get(KEY.menu)),
  },

  orders: {
    list() {
      let orders = demoStorage.get(KEY.orders);
      if (!orders) {
        const doc = demoStore.menu.get();
        orders = generateSeedOrders({ items: doc.items, settings: normalizeSettings(doc.settings) });
        demoStorage.set(KEY.orders, orders);
      }
      return orders;
    },
    add(order) {
      demoStorage.set(KEY.orders, [...demoStore.orders.list(), order]);
    },
    update(id, patch) {
      const orders = demoStore.orders.list().map((o) => (o.id === id ? { ...o, ...patch } : o));
      demoStorage.set(KEY.orders, orders);
      return orders.find((o) => o.id === id) ?? null;
    },
    find: (id) => demoStore.orders.list().find((o) => o.id === id) ?? null,
  },

  invoices: {
    all: () => demoStorage.get(KEY.invoices, {}),
    get: (id) => demoStorage.get(KEY.invoices, {})[id] ?? null,
    save(record) {
      demoStorage.set(KEY.invoices, { ...demoStore.invoices.all(), [record.id]: record });
    },
    remove(id) {
      const { [id]: _gone, ...rest } = demoStore.invoices.all();
      demoStorage.set(KEY.invoices, rest);
    },
  },

  notify: {
    get: () => ({ ...DEFAULT_NOTIFY, ...demoStorage.get(KEY.notify, {}) }),
    save(cfg) {
      demoStorage.set(KEY.notify, cfg);
      return cfg;
    },
  },

  alerts: {
    list: () => demoStorage.get(KEY.alerts, []),
    add(entry) {
      demoStorage.set(KEY.alerts, [entry, ...demoStore.alerts.list()].slice(0, 50));
    },
  },

  password: {
    get: () => demoStorage.get(KEY.pw),
    set: (hash) => demoStorage.set(KEY.pw, hash),
  },

  reset() {
    demoStorage.clearAll();
    emit("jb:menu-published");
  },
};
