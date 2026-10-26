const KEY = "jb:cart:v1";

/** Persisted tray so a trip to Paystack (or an accidental refresh) never empties it. Stores ids + quantities only. */
export function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((l) => Number.isInteger(l?.id) && Number.isInteger(l?.quantity) && l.quantity > 0 && l.quantity <= 20).slice(0, 60)
      : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* private mode / storage full: the tray still works for this visit */
  }
}

export const clearStoredCart = () => saveCart([]);

const CUSTOMER_KEY = "jb:customer:v1";

/** Remember checkout details on this device only (speeds up repeat orders). */
export function loadCustomer() {
  try {
    const c = JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}");
    return { name: c.name ?? "", phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "" };
  } catch {
    return { name: "", phone: "", email: "", address: "" };
  }
}
export function saveCustomer({ name, phone, email, address }) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, phone, email, address }));
  } catch {
    /* ignore */
  }
}
