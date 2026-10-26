/** Display helpers for invoices and receipts. Pure. */

const CHANNELS = { card: "Card", bank: "Bank", bank_transfer: "Bank transfer", ussd: "USSD", qr: "QR", mobile_money: "Mobile money", eft: "EFT", apple_pay: "Apple Pay", test: "Test payment" };
export const channelLabel = (channel) => CHANNELS[channel] ?? (channel ? String(channel).replaceAll("_", " ") : "Online");

export function formatLagosDateTime(iso) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  return { date, time: time.toUpperCase(), full: `${date}, ${time.toUpperCase()}` };
}

/** "23h 12m" / "12m" / null when already expired. */
export function timeLeft(expiresAt, now = Date.now()) {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${Math.max(m, 1)}m`;
}
