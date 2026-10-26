import { allow, fail, ok } from "../_lib/http.js";
import { requireMerchant } from "../_lib/auth.js";
import { getStorage } from "../_lib/storage.js";

const lagosDay = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(iso));

/** Pure: build KPIs from paid receipts. Exported for tests. */
export function summarize(receipts, days, now = new Date()) {
  const revenue = receipts.reduce((s, r) => s + r.total, 0);
  const byItem = new Map();
  for (const r of receipts) for (const it of r.items) {
    const cur = byItem.get(it.id) ?? { id: it.id, name: it.name, units: 0, revenue: 0 };
    cur.units += it.quantity;
    cur.revenue += it.lineTotal;
    byItem.set(it.id, cur);
  }
  const daily = new Map();
  for (let i = days - 1; i >= 0; i -= 1) daily.set(lagosDay(new Date(now.getTime() - i * 86_400_000).toISOString()), { revenue: 0, orders: 0 });
  for (const r of receipts) {
    const d = daily.get(lagosDay(r.payment.paidAt));
    if (d) { d.revenue += r.total; d.orders += 1; }
  }
  return {
    kpis: { revenue, orders: receipts.length, averageOrder: receipts.length ? Math.round(revenue / receipts.length) : 0 },
    daily: [...daily].map(([date, v]) => ({ date, ...v })),
    topItems: [...byItem.values()].sort((a, b) => b.units - a.units).slice(0, 8),
  };
}

/** GET /api/merchant/orders?days=30 → paid orders + KPIs (password-protected) */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;
  if (!(await requireMerchant(req, res))) return;

  const days = Math.min(90, Math.max(1, Math.trunc(Number(req.query?.days ?? new URL(req.url, "http://x").searchParams.get("days") ?? 30)) || 30));
  const now = new Date();
  const since = now.getTime() - days * 86_400_000;
  const storage = getStorage();

  // Receipts are filed by month, so only the months in range are listed.
  const months = new Set();
  for (let t = since; t <= now.getTime() + 86_400_000; t += 20 * 86_400_000) months.add(new Date(t).toISOString().slice(0, 7).replace("-", "/"));
  months.add(now.toISOString().slice(0, 7).replace("-", "/"));

  try {
    const keys = (await Promise.all([...months].map((m) => storage.list(`receipts/${m}/`, 500)))).flat();
    const receipts = [];
    for (let i = 0; i < keys.length; i += 20) {
      const batch = await Promise.all(keys.slice(i, i + 20).map((k) => storage.getJSON(k)));
      receipts.push(...batch.filter((r) => r?.payment && new Date(r.payment.paidAt).getTime() >= since));
    }
    receipts.sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt));
    return ok(res, { days, ...summarize(receipts, days, now), orders: receipts.slice(0, 100) });
  } catch {
    return fail(res, 500, "Couldn't load orders right now.");
  }
}
