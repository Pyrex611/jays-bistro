import { useEffect, useMemo, useState } from "react";
import { Bike, ChevronDown, Store } from "lucide-react";
import { Badge } from "./fields.jsx";
import { Card } from "./ui.jsx";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import { api } from "../../services/api.js";
import { breakdowns } from "../../lib/orderStats.js";
import { nextAction, STATUS_LABEL, STATUSES } from "../../lib/orderStatus.js";
import { formatPrice } from "../../lib/format.js";
import { channelLabel, formatLagosDateTime, isTestMode } from "../../lib/receipt.js";

const RANGES = [[1, "Today"], [7, "7 days"], [30, "30 days"]];
const STATUS_TONE = { new: "warn", preparing: "demo", ready: "good", completed: "neutral" };

export function Kpi({ label, value }) {
  return (
    <div className="surface-sage rounded-2xl p-3 text-leaf-950">
      <p className="text-[10px] font-bold uppercase tracking-widest text-leaf-800">{label}</p>
      <p className="mt-1 font-display text-lg font-black leading-none tabular-nums">{value}</p>
    </div>
  );
}

/** 24 bars (Lagos hours), labelled every 6 h, the busiest hour highlighted. */
export function HourBars({ hours }) {
  const max = Math.max(1, ...hours.map((h) => h.orders));
  const peak = hours.reduce((best, h) => (h.orders > best.orders ? h : best), hours[0]);
  return (
    <div>
      <div className="flex h-24 items-end gap-0.5" role="img" aria-label={`Orders by hour of day. Busiest hour: ${peak.orders ? `${peak.hour}:00` : "none yet"}`}>
        {hours.map((h) => (
          <div key={h.hour} className="flex flex-1 flex-col justify-end" title={`${String(h.hour).padStart(2, "0")}:00 · ${h.orders} orders`}>
            <div className={`w-full rounded-t ${h.hour === peak.hour && h.orders ? "bg-sun-500" : "bg-sage-500"}`} style={{ height: `${h.orders ? Math.max(8, (h.orders / max) * 100) : 3}%`, opacity: h.orders ? 1 : 0.35 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-500"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>
    </div>
  );
}

function SplitBar({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-cream-200">
        {parts.map((p) => <div key={p.label} className={p.color} style={{ width: `${(p.value / total) * 100}%` }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
        {parts.map((p) => <span key={p.label} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${p.color}`} />{p.label} <b className="tabular-nums">{p.value}</b></span>)}
      </div>
    </div>
  );
}

export function OrderRow({ order, canTrack, onAdvance, busy }) {
  const [open, setOpen] = useState(false);
  const when = formatLagosDateTime(order.payment.paidAt);
  const delivery = order.fulfilment === "delivery";
  const Icon = delivery ? Bike : Store;
  const status = order.fulfilmentStatus ?? "new";
  const action = canTrack ? nextAction(status, order.fulfilment) : null;

  return (
    <li className="rounded-2xl border border-cream-300 bg-cream-50">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className="surface-apricot flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sun-900"><Icon size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{order.customer.name} <span className="font-mono text-[11px] font-semibold text-ink-500">{order.code}</span></span>
          <span className="text-xs text-ink-500">{when.date} · {when.time} · {delivery ? order.zone?.name ?? "Delivery" : "Pickup"}</span>
        </span>
        <span className="flex flex-col items-end gap-1">
          <span className="text-sm font-extrabold tabular-nums text-leaf-700">{formatPrice(order.total)}</span>
          {canTrack && <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>}
        </span>
        <ChevronDown size={16} className={`text-ink-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-2 border-t border-dashed border-cream-400 p-3 text-xs">
          <ul className="space-y-1">{order.items.map((it) => <li key={it.id} className="flex justify-between"><span>{it.quantity}× {it.name}</span><span className="tabular-nums">{formatPrice(it.lineTotal)}</span></li>)}</ul>
          {order.deliveryFee > 0 && <p className="flex justify-between text-ink-600"><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></p>}
          {order.serviceFee > 0 && <p className="flex justify-between text-ink-600"><span>Online payment fee</span><span>{formatPrice(order.serviceFee)}</span></p>}
          {delivery && <p><span className="font-bold">Address:</span> {order.customer.address}</p>}
          {order.customer.note && <p><span className="font-bold">Note:</span> {order.customer.note}</p>}
          <p className="text-ink-500">Paid via {channelLabel(order.payment.channel)} · {order.payment.reference}{isTestMode(order.payment.mode) ? ` (${order.payment.mode})` : ""}</p>
          {order.alert && <p className="text-ink-500">Kitchen alert: <b>{order.alert.status}</b> ({order.alert.channel})</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {action && <button type="button" disabled={busy} onClick={() => onAdvance(order.id, action.to)} className="rounded-full bg-leaf-700 px-4 py-2 font-bold text-white disabled:opacity-50">{action.label}</button>}
            <a href={`tel:+${order.customer.phone}`} className="rounded-full bg-cream-200 px-3 py-2 font-bold">Call +{order.customer.phone}</a>
            <a href={`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(`Hi ${order.customer.name.split(" ")[0]}, this is Jay's Bistro about your order ${order.code}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-2 font-bold text-white"><WhatsAppIcon size={14} /> WhatsApp</a>
          </div>
        </div>
      )}
    </li>
  );
}

/** Orders + sales analytics. `canTrack` shows the kitchen workflow (demo now; real endpoint arrives with the integration). */
export default function OrdersPanel({ canTrack, initialDays = 7 }) {
  const [days, setDays] = useState(initialDays);
  const [includeTest, setIncludeTest] = useState(false);
  const [filter, setFilter] = useState("all");
  const [state, setState] = useState({ loading: true });
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.merchant.orders(days, includeTest).then((data) => !cancelled && setState({ data })).catch((e) => !cancelled && setState({ error: e.message }));
    return () => { cancelled = true; };
  }, [days, includeTest]);

  const { data, error } = state;
  const orders = useMemo(() => data?.orders ?? [], [data]);
  const stats = useMemo(() => breakdowns(orders), [orders]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => (o.fulfilmentStatus ?? "new") === s).length])), [orders]);
  const shown = filter === "all" ? orders : orders.filter((o) => (o.fulfilmentStatus ?? "new") === filter);
  const maxRevenue = Math.max(1, ...(data?.daily.map((d) => d.revenue) ?? [1]));

  const advance = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await api.merchant.setOrderStatus(id, status);
      setState((s) => ({ ...s, data: { ...s.data, orders: s.data.orders.map((o) => (o.id === id ? updated : o)) } }));
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      <div role="group" aria-label="Date range" className="grid grid-cols-3 rounded-full bg-cream-200 p-0.5 text-xs font-bold">
        {RANGES.map(([d, label]) => (
          <button key={d} type="button" aria-pressed={days === d} onClick={() => { setState({ loading: true }); setDays(d); }} className={`rounded-full py-2.5 ${days === d ? "bg-leaf-700 text-white" : "text-ink-600"}`}>{label}</button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {state.loading && <div className="space-y-3" role="status" aria-label="Loading orders"><div className="skeleton h-20 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" /></div>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Kpi label="Sales" value={formatPrice(data.kpis.revenue)} />
            <Kpi label="Orders" value={data.kpis.orders} />
            <Kpi label="Avg order" value={formatPrice(data.kpis.averageOrder)} />
          </div>

          {data.testOrders > 0 && (
            <label className="flex items-center justify-between gap-3 rounded-xl bg-apricot-200 px-3 py-2 text-xs font-semibold text-sun-900">
              <span>{data.testOrders} test payment{data.testOrders === 1 ? "" : "s"} hidden from sales</span>
              <input type="checkbox" checked={includeTest} onChange={(e) => { setState({ loading: true }); setIncludeTest(e.target.checked); }} className="h-4 w-4 accent-leaf-700" aria-label="Include test payments" />
            </label>
          )}

          {data.kpis.orders === 0 ? (
            <Card className="py-10 text-center"><p className="font-bold">No paid orders yet</p><p className="mt-1 text-xs text-ink-500">Paid orders appear here the moment payment is confirmed.</p></Card>
          ) : (
            <>
              {days > 1 && (
                <Card>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Sales per day</h2>
                  <div className="flex h-28 items-end gap-1" role="img" aria-label="Bar chart of daily sales">
                    {data.daily.map((d) => (
                      <div key={d.date} className="flex flex-1 flex-col items-center justify-end" title={`${d.date}: ${formatPrice(d.revenue)}`}>
                        <div className="w-full rounded-t bg-sun-500" style={{ height: `${Math.max(d.revenue ? 6 : 2, (d.revenue / maxRevenue) * 100)}%`, opacity: d.revenue ? 1 : 0.25 }} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Busiest hours</h2>
                <HourBars hours={stats.hours} />
              </Card>

              <Card className="space-y-4">
                <div>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">Pickup vs delivery</h2>
                  <SplitBar parts={[{ label: "Pickup", value: stats.split.pickup, color: "bg-sage-500" }, { label: "Delivery", value: stats.split.delivery, color: "bg-apricot-500" }]} />
                </div>
                <div>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">How people pay</h2>
                  <SplitBar parts={Object.entries(stats.channels).map(([ch, value], i) => ({ label: channelLabel(ch), value, color: ["bg-leaf-600", "bg-sun-400", "bg-sage-400", "bg-apricot-400"][i % 4] }))} />
                </div>
              </Card>

              <Card>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Top sellers</h2>
                <ol className="space-y-2.5">
                  {data.topItems.map((t, i) => (
                    <li key={t.id}>
                      <div className="flex items-baseline justify-between text-sm"><span className="font-bold"><span className="mr-2 text-ink-400">{i + 1}</span>{t.name}</span><span className="text-xs text-ink-500">{t.units} sold · {formatPrice(t.revenue)}</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-cream-200"><div className="h-full rounded-full bg-leaf-600" style={{ width: `${(t.units / data.topItems[0].units) * 100}%` }} /></div>
                    </li>
                  ))}
                </ol>
              </Card>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-ink-500">Orders</h2>
                  {!canTrack && <Badge tone="soon">Kitchen tracking: coming with integration</Badge>}
                </div>
                {canTrack && (
                  <div className="scrollbar-hide -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
                    {["all", ...STATUSES].map((s) => (
                      <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={`flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ring-1 ${filter === s ? "bg-leaf-700 text-white ring-leaf-700" : "bg-cream-50 text-ink-700 ring-cream-300"}`}>
                        {s === "all" ? "All" : STATUS_LABEL[s]}<span className="ml-1 opacity-60">{s === "all" ? orders.length : counts[s]}</span>
                      </button>
                    ))}
                  </div>
                )}
                <ul className="space-y-2">{shown.map((o) => <OrderRow key={o.id} order={o} canTrack={canTrack} onAdvance={advance} busy={busyId === o.id} />)}</ul>
                {shown.length === 0 && <p className="py-6 text-center text-sm text-ink-500">Nothing in this view.</p>}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
