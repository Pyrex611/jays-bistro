import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, LayoutTemplate, PlusCircle, Power } from "lucide-react";
import { Badge } from "./fields.jsx";
import { Card } from "./ui.jsx";
import CategoryIcon from "../icons/CategoryIcon.jsx";
import { api } from "../../services/api.js";
import { getOpenStatus } from "../../lib/hours.js";
import { formatPrice } from "../../lib/format.js";
import { formatLagosDateTime } from "../../lib/receipt.js";
import { nextAction, STATUS_LABEL } from "../../lib/orderStatus.js";
import { integrationStatus } from "../../lib/integrations.js";

const greeting = (now) => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", hour12: false }).format(now)) % 24;
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/** The first thing the owner sees: how today is going, what needs doing, and what's still to connect. */
export default function OverviewPanel({ draft, saved, capabilities, demo, canTrack, onNavigate, onToggleOrders }) {
  const [state, setState] = useState({ loading: true });
  const now = useMemo(() => new Date(), []);
  const settings = saved.settings;
  const status = getOpenStatus(settings.hours, now, settings.closures);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.merchant.orders(1), api.merchant.orders(7)])
      .then(([today, week]) => !cancelled && setState({ today, week }))
      .catch((e) => !cancelled && setState({ error: e.message }));
    return () => { cancelled = true; };
  }, []);

  const [busyId, setBusyId] = useState(null);
  const advance = async (id, to) => {
    setBusyId(id);
    try {
      const updated = await api.merchant.setOrderStatus(id, to);
      setState((s) => ({ ...s, week: { ...s.week, orders: s.week.orders.map((o) => (o.id === id ? updated : o)) } }));
    } finally {
      setBusyId(null);
    }
  };

  const open = (state.week?.orders ?? []).filter((o) => (o.fulfilmentStatus ?? "completed") !== "completed").slice(0, 4);
  const soldOut = draft.items.filter((i) => i.isActive && !i.isAvailable);
  const integrations = integrationStatus(capabilities, demo);
  const connected = integrations.filter((i) => i.state === "connected").length;

  return (
    <div className="space-y-4 pb-28">
      <div className="surface-sage rounded-3xl p-5 text-leaf-950">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-800">{greeting(now)}</p>
        <h1 className="font-display text-2xl font-black">Jay&apos;s Kitchen</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={status.open ? "good" : "neutral"}>{status.label}</Badge>
          <Badge tone={settings.acceptingOrders ? "good" : "warn"}>{settings.acceptingOrders ? "Taking orders" : "Orders paused"}</Badge>
        </div>
        <button type="button" onClick={() => onToggleOrders(!settings.acceptingOrders)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream-50 px-4 py-2.5 text-xs font-bold text-leaf-900 shadow-sm ring-1 ring-cream-300 transition hover:bg-white">
          <Power size={14} /> {settings.acceptingOrders ? "Pause orders" : "Resume orders"}
        </button>
      </div>

      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{state.error}</p>}
      {state.loading && <div className="skeleton h-24 rounded-2xl" role="status" aria-label="Loading today" />}

      {state.today && (
        <div className="grid grid-cols-3 gap-2">
          {[["Today's sales", formatPrice(state.today.kpis.revenue)], ["Orders today", state.today.kpis.orders], ["Avg order", formatPrice(state.today.kpis.averageOrder)]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-cream-300 bg-cream-50 p-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</p>
              <p className="mt-1 font-display text-lg font-black leading-none tabular-nums text-leaf-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-extrabold text-leaf-800">Needs attention</h2>
          <button type="button" onClick={() => onNavigate("orders")} className="inline-flex items-center gap-1 text-xs font-bold text-leaf-700">All orders <ArrowRight size={13} /></button>
        </div>
        {open.length === 0 ? (
          <p className="py-3 text-center text-sm text-ink-500">{canTrack ? "All caught up. Nothing waiting in the kitchen." : "Order tracking comes with the integration."}</p>
        ) : (
          <ul className="space-y-2">
            {open.map((o) => {
              const action = canTrack ? nextAction(o.fulfilmentStatus ?? "new", o.fulfilment) : null;
              return (
                <li key={o.id} className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-100 p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{o.customer.name} <span className="font-mono text-[11px] text-ink-500">{o.code}</span></p>
                    <p className="truncate text-xs text-ink-500">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                    <p className="text-[11px] text-ink-400">{formatLagosDateTime(o.payment.paidAt).time} · {STATUS_LABEL[o.fulfilmentStatus ?? "new"]}</p>
                  </div>
                  {action && <button type="button" disabled={busyId === o.id} onClick={() => advance(o.id, action.to)} className="flex-shrink-0 rounded-full bg-leaf-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{action.label}</button>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 font-display text-base font-extrabold text-leaf-800">Sold out right now</h2>
        {soldOut.length === 0 ? <p className="text-sm text-ink-500">Everything is in stock.</p> : (
          <div className="flex flex-wrap gap-2">
            {soldOut.slice(0, 10).map((i) => <button key={i.id} type="button" onClick={() => onNavigate("menu")} className="rounded-full bg-apricot-200 px-3 py-1.5 text-xs font-bold text-sun-900">{i.name}</button>)}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[["menu", PlusCircle, "Add or edit dishes"], ["home", LayoutTemplate, "Edit home screen"]].map(([tab, Icon, label]) => (
          <button key={tab} type="button" onClick={() => onNavigate(tab)} className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 p-3 text-left text-sm font-bold shadow-sm transition hover:bg-cream-200"><span className="surface-sage flex h-9 w-9 items-center justify-center rounded-xl text-leaf-800"><Icon size={18} /></span>{label}</button>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 p-3 text-sm font-bold shadow-sm transition hover:bg-cream-200"><span className="surface-apricot flex h-9 w-9 items-center justify-center rounded-xl text-sun-900"><ExternalLink size={18} /></span>View storefront</a>
        <button type="button" onClick={() => onNavigate("settings", "alerts")} className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 p-3 text-left text-sm font-bold shadow-sm transition hover:bg-cream-200"><span className="surface-apricot flex h-9 w-9 items-center justify-center rounded-xl text-sun-900"><CategoryIcon name="all" size={18} /></span>Preview kitchen alert</button>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-extrabold text-leaf-800">Going live</h2>
          <Badge tone={demo ? "demo" : "good"}>{connected} of {integrations.length} connected</Badge>
        </div>
        <div className="mb-3 h-2 rounded-full bg-cream-200"><div className="h-full rounded-full bg-leaf-600 transition-all" style={{ width: `${(connected / integrations.length) * 100}%` }} /></div>
        <ul className="space-y-1.5 text-sm">
          {integrations.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-3"><span>{i.name}</span><Badge tone={i.tone}>{i.label}</Badge></li>
          ))}
        </ul>
        <button type="button" onClick={() => onNavigate("settings", "integrations")} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-leaf-700">See what each one needs <ArrowRight size={13} /></button>
      </Card>
    </div>
  );
}
