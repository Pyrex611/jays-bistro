import { allow, fail, ok } from "../_lib/http.js";
import { requireStorage } from "../_lib/guard.js";
import { requireMerchant } from "../_lib/auth.js";
import { getStorage } from "../_lib/storage.js";
import { summarize } from "../../src/lib/orderStats.js";

export { summarize };

/** GET /api/merchant/orders?days=30 → paid orders + KPIs (password-protected) */
export default async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;
  if (!requireStorage(res)) return;
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
    // Test-key payments are real receipts but not real sales: excluded unless ?includeTest=1.
    const includeTest = (req.query?.includeTest ?? new URL(req.url, "http://x").searchParams.get("includeTest")) === "1";
    const isReal = (r) => r.payment.mode === "live";
    const counted = includeTest ? receipts : receipts.filter(isReal);
    return ok(res, { days, includeTest, testOrders: receipts.filter((r) => !isReal(r)).length, ...summarize(counted, days, now), orders: counted.slice(0, 100) });
  } catch {
    return fail(res, 500, "Couldn't load orders right now.");
  }
}
