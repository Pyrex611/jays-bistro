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

export const api = {
  menu: (signal) => request("/api/menu", { signal }),

  checkout: (payload) => request("/api/checkout", { method: "POST", body: payload }),
  invoice: (id, reference, mock) => {
    const q = new URLSearchParams();
    if (reference) q.set("reference", reference);
    if (mock) q.set("mock", mock);
    return request(`/api/invoice/${encodeURIComponent(id)}${q.size ? `?${q}` : ""}`);
  },
  payInvoice: (id, body) => request(`/api/invoice/${encodeURIComponent(id)}`, { method: "POST", body: { action: "pay", ...body } }),

  merchant: {
    session: () => request("/api/merchant/auth", { portal: true }),
    login: (password) => request("/api/merchant/auth", { method: "POST", body: { password }, portal: true }),
    logout: () => request("/api/merchant/auth", { method: "DELETE", portal: true }),
    changePassword: (currentPassword, newPassword) =>
      request("/api/merchant/auth", { method: "PUT", body: { currentPassword, newPassword }, portal: true }),
    getMenu: () => request("/api/merchant/menu", { portal: true }),
    saveMenu: (doc, baseVersion) => request("/api/merchant/menu", { method: "PUT", body: { doc, baseVersion }, portal: true }),
    uploadImage: (dataUrl) => request("/api/merchant/image", { method: "POST", body: { dataUrl }, portal: true }),
    orders: (days) => request(`/api/merchant/orders?days=${days}`, { portal: true }),
  },
};
