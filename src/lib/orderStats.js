/** Sales statistics from paid receipts. Pure: used by the API and by the browser demo backend. */

const lagosDay = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(iso));

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


/** Orders per Lagos hour of day (0–23) and simple splits: handy for "peak hours" and mix charts. */
export function breakdowns(receipts) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0, revenue: 0 }));
  const split = { pickup: 0, delivery: 0 };
  const channels = {};
  for (const r of receipts) {
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", hour12: false }).format(new Date(r.payment.paidAt))) % 24;
    hours[hour].orders += 1;
    hours[hour].revenue += r.total;
    split[r.fulfilment === "delivery" ? "delivery" : "pickup"] += 1;
    channels[r.payment.channel] = (channels[r.payment.channel] ?? 0) + 1;
  }
  return { hours, split, channels };
}
