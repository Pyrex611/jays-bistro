import { isProduction } from "./http.js";

/**
 * Paystack integration (hosted redirect checkout).
 *   initialize → returns authorization_url → customer pays on Paystack → redirected to callback_url
 *   verify     → server-side confirmation (the ONLY thing we trust; never the redirect or webhook payload)
 *
 * Modes:
 *   live — PAYSTACK_SECRET_KEY set (sk_test_… for testing, sk_live_… for real money)
 *   mock — no key AND not production: lets you click through the whole flow locally / on previews
 *   off  — no key in production: checkout answers "payments not configured"
 */

const API = "https://api.paystack.co";

export const paystackMode = () => (process.env.PAYSTACK_SECRET_KEY ? "live" : isProduction() ? "off" : "mock");

async function call(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) throw new Error(json.message || `Paystack error ${res.status}`);
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

export async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  const mode = paystackMode();
  if (mode === "off") throw Object.assign(new Error("Online payment is not configured yet"), { code: "payments_off" });
  if (mode === "mock") {
    const sep = callbackUrl.includes("?") ? "&" : "?";
    return { authorizationUrl: `${callbackUrl}${sep}reference=${encodeURIComponent(reference)}&mock=success`, reference, mock: true };
  }
  const data = await call("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ email, amount: amountKobo, currency: "NGN", reference, callback_url: callbackUrl, metadata }),
  });
  return { authorizationUrl: data.authorization_url, reference: data.reference ?? reference, mock: false };
}

/**
 * @returns {Promise<{ status: string, amountKobo?: number, currency?: string, channel?: string, paidAt?: string }>}
 * `status` is Paystack's own: "success" | "abandoned" | "failed" | "pending" | …
 */
export async function verifyTransaction(reference, { mockApproved = false, mockAmountKobo } = {}) {
  const mode = paystackMode();
  if (mode === "mock") {
    return mockApproved
      ? { status: "success", amountKobo: mockAmountKobo, currency: "NGN", channel: "test", paidAt: new Date().toISOString() }
      : { status: "pending" };
  }
  if (mode === "off") return { status: "pending" };
  try {
    const d = await call(`/transaction/verify/${encodeURIComponent(reference)}`);
    return { status: d.status, amountKobo: d.amount, currency: d.currency, channel: d.channel, paidAt: d.paid_at ?? d.paidAt };
  } catch (e) {
    // "Transaction reference not found" just means the customer never reached the payment step.
    if (/not found/i.test(e.message)) return { status: "pending" };
    throw e;
  }
}
