import { useEffect, useState } from "react";
import { Bike, ChevronDown, Store } from "lucide-react";
import { Card } from "./ui.jsx";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import { api } from "../../services/api.js";
import { formatPrice } from "../../lib/format.js";
import { channelLabel, formatLagosDateTime } from "../../lib/receipt.js";

const RANGES = [[1, "Today"], [7, "7 days"], [30, "30 days"]];

function Kpi({ label, value }) {
  return (
    <div className="rounded-2xl bg-leaf-700 p-3 text-cream-50">
      <p className="text-[10px] font-bold uppercase tracking-widest text-leaf-200">{label}</p>
      <p className="mt-1 font-display text-lg font-black leading-none tabular-nums">{value}</p>
    </div>
  );
}

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const when = formatLagosDateTime(order.payment.paidAt);
  const delivery = order.fulfilment === "delivery";
  const Icon = delivery ? Bike : Store;
  return (
    <li className="rounded-2xl border border-cream-300 bg-cream-50">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sun-100 text-sun-700"><Icon size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{order.customer.name} <span className="font-mono text-[11px] font-semibold text-ink-500">{order.code}</span></span>
          <span className="text-xs text-ink-500">{when.date} · {when.time} · {delivery ? "Delivery" : "Pickup"}</span>
        </span>
        <span className="text-sm font-extrabold tabular-nums text-leaf-700">{formatPrice(order.total)}</span>
        <ChevronDown size={16} className={`text-ink-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-dashed border-cream-400 p-3 text-xs">
          <ul className="space-y-1">{order.items.map((it) => <li key={it.id} className="flex justify-between"><span>{it.quantity}× {it.name}</span><span className="tabular-nums">{formatPrice(it.lineTotal)}</span></li>)}</ul>
          {order.deliveryFee > 0 && <p className="flex justify-between text-ink-600"><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></p>}
          {delivery && <p><span className="font-bold">Address:</span> {order.customer.address}</p>}
          {order.customer.note && <p><span className="font-bold">Note:</span> {order.customer.note}</p>}
          <p className="text-ink-500">Paid via {channelLabel(order.payment.channel)} · {order.payment.reference}{order.payment.mode === "mock" ? " (test)" : ""}</p>
          <div className="flex gap-2 pt-1">
            <a href={`tel:+${order.customer.phone}`} className="rounded-full bg-cream-200 px-3 py-2 font-bold">Call +{order.customer.phone}</a>
            <a href={`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(`Hi ${order.customer.name.split(" ")[0]}, this is Jay's Bistro about your order ${order.code}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-2 font-bold text-white"><WhatsAppIcon size={14} /> WhatsApp</a>
          </div>
        </div>
      )}
    </li>
  );
}

/** Paid orders + simple sales analytics (only paid receipts count as sales). */
export default function OrdersPanel() {
  const [days, setDays] = useState(7);
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    api.merchant.orders(days).then((data) => !cancelled && setState({ data })).catch((e) => !cancelled && setState({ error: e.message }));
    return () => { cancelled = true; };
  }, [days]);

  const { data, error } = state;
  const maxRevenue = Math.max(1, ...(data?.daily.map((d) => d.revenue) ?? [1]));

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

          {data.kpis.orders === 0 ? (
            <Card className="py-10 text-center"><p className="font-bold">No paid orders yet</p><p className="mt-1 text-xs text-ink-500">Paid orders appear here the moment Paystack confirms them.</p></Card>
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
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">Orders</h2>
                <ul className="space-y-2">{data.orders.map((o) => <OrderRow key={o.id} order={o} />)}</ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
