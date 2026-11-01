import { runtime } from "./runtime.js";
import { demoApi } from "../demo/demoApi.js";

/** Thin fetch wrapper for our own /api. Errors carry `status` and the server's JSON in `data`. */
async function request(path, { method = "GET", body, portal = false, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (portal) headers["X-Requested-With"] = "jb-portal"; // CSRF defence for merchant calls
  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: "same-origin", signal });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw Object.assign(new Error(data?.error || "Something went wrong. Please try again."), { status: res.status, data });
  return data;
}

/** Real API unless the platform is in demo mode (no storage connected); then the browser-local demo backend answers. */
const demoNow = async () => {
  await runtime.whenReady();
  return runtime.isDemo();
};

export const api = {
  async menu(signal) {
    try {
      const data = await request("/api/menu", { signal });
      runtime.setCapabilities(data.capabilities ?? { storage: true, payments: "live", email: false, orderStatus: false });
      return data;
    } catch (e) {
      // Only a missing API (404, e.g. static hosting) means "demo"; transient errors must never flip live customers into demo.
      if (e.status === 404) runtime.setCapabilities({ storage: false, payments: "demo", email: false, orderStatus: false });
      throw e;
    }
  },

  async checkout(payload) {
    return (await demoNow()) ? demoApi.checkout(payload) : request("/api/checkout", { method: "POST", body: payload });
  },
  async invoice(id, reference, mock) {
    if (id.startsWith("demo") || (await demoNow())) return demoApi.invoice(id);
    const q = new URLSearchParams();
    if (reference) q.set("reference", reference);
    if (mock) q.set("mock", mock);
    return request(`/api/invoice/${encodeURIComponent(id)}${q.size ? `?${q}` : ""}`);
  },
  async payInvoice(id, body) {
    if (id.startsWith("demo") || (await demoNow())) return demoApi.payInvoice(id, body);
    return request(`/api/invoice/${encodeURIComponent(id)}`, { method: "POST", body: { action: "pay", ...body } });
  },

  merchant: {
    async session() {
      try {
        const real = await request("/api/merchant/auth", { portal: true });
        runtime.setDemo(real.mode === "demo");
        return real.mode === "demo" ? demoApi.merchant.session() : real;
      } catch (e) {
        if (e.status === 404) {
          runtime.setDemo(true);
          return demoApi.merchant.session();
        }
        throw e;
      }
    },
    async login(password) {
      return (await demoNow()) ? demoApi.merchant.login(password) : request("/api/merchant/auth", { method: "POST", body: { password }, portal: true });
    },
    async logout() {
      return (await demoNow()) ? demoApi.merchant.logout() : request("/api/merchant/auth", { method: "DELETE", portal: true });
    },
    async changePassword(currentPassword, newPassword) {
      return (await demoNow()) ? demoApi.merchant.changePassword(currentPassword, newPassword) : request("/api/merchant/auth", { method: "PUT", body: { currentPassword, newPassword }, portal: true });
    },
    async getMenu() {
      return (await demoNow()) ? demoApi.merchant.getMenu() : request("/api/merchant/menu", { portal: true });
    },
    async saveMenu(doc, baseVersion) {
      const saved = (await demoNow()) ? await demoApi.merchant.saveMenu(doc, baseVersion) : await request("/api/merchant/menu", { method: "PUT", body: { doc, baseVersion }, portal: true });
      if (typeof window !== "undefined") window.dispatchEvent(new Event("jb:menu-published")); // storefront refreshes without a reload
      return saved;
    },
    async uploadImage(dataUrl) {
      return (await demoNow()) ? demoApi.merchant.uploadImage(dataUrl) : request("/api/merchant/image", { method: "POST", body: { dataUrl }, portal: true });
    },
    async orders(days, includeTest = false) {
      return (await demoNow()) ? demoApi.merchant.orders(days) : request(`/api/merchant/orders?days=${days}${includeTest ? "&includeTest=1" : ""}`, { portal: true });
    },
    /** Kitchen workflow. Real endpoint arrives with the integration; the console only shows it when `capabilities.orderStatus` is true or in demo. */
    async setOrderStatus(id, status) {
      if (await demoNow()) return demoApi.merchant.setOrderStatus(id, status);
      throw Object.assign(new Error("Order tracking isn't connected yet."), { status: 501 });
    },
    async getNotifications() {
      if (await demoNow()) return demoApi.merchant.getNotifications();
      throw Object.assign(new Error("Alerts aren't connected yet."), { status: 501 });
    },
    async saveNotifications(config) {
      if (await demoNow()) return demoApi.merchant.saveNotifications(config);
      throw Object.assign(new Error("Alerts aren't connected yet."), { status: 501 });
    },
    async sendTestAlert() {
      if (await demoNow()) return demoApi.merchant.sendTestAlert();
      throw Object.assign(new Error("Alerts aren't connected yet."), { status: 501 });
    },
    async resetDemo() {
      if (await demoNow()) return demoApi.merchant.reset();
      return null;
    },
  },
};
