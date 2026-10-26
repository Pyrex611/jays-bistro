import { useEffect, useState } from "react";
import { Bike, Clock, Lock, RefreshCw, Store } from "lucide-react";
import { Field } from "../ui/FormField.jsx";
import { inputClass } from "../ui/formStyles.js";
import { api } from "../../services/api.js";
import { loadCustomer, saveCustomer } from "../../lib/cartStorage.js";
import { computeTotals } from "../../lib/pricing.js";
import { formatPrice } from "../../lib/format.js";
import { timeLeft } from "../../lib/receipt.js";

/** An unpaid invoice (usually opened from the WhatsApp link): review, choose pickup/delivery, pay with Paystack. */
export default function InvoicePending({ invoice, settings, confirming, gaveUp, onRefresh }) {
  const [now, setNow] = useState(() => Date.now());
  const [customer, setCustomer] = useState(() => ({ ...loadCustomer(), note: "" }));
  const [fulfilment, setFulfilment] = useState(invoice.fulfilment === "delivery" && settings.deliveryEnabled ? "delivery" : "pickup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const set = (key) => (e) => setCustomer((c) => ({ ...c, [key]: e.target.value }));
  const totals = computeTotals(invoice.items, fulfilment, settings);
  const left = timeLeft(invoice.expiresAt, now);
  const delivery = fulfilment === "delivery";

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    try {
      saveCustomer(customer);
      const res = await api.payInvoice(invoice.id, { fulfilment, customer });
      window.location.assign(res.authorizationUrl);
    } catch (err) {
      setFields(err.data?.fields ?? {});
      setError(err.status === 422 ? "" : err.message);
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl bg-cream-50 p-6 text-ink-900 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Invoice</p>
          <p className="font-display text-2xl font-black text-leaf-800">{invoice.code}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-2.5 py-1 text-[11px] font-bold text-sun-800"><Clock size={12} />{left ? `Valid for ${left}` : "Expiring"}</span>
      </div>

      {(confirming || gaveUp) && (
        <div role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-leaf-50 p-3 text-xs font-semibold text-leaf-800">
          {confirming ? <span className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-leaf-300 border-t-leaf-700" /> : <RefreshCw size={14} className="mt-0.5 flex-shrink-0" />}
          <div>
            {confirming ? "Confirming your payment with Paystack…" : "We haven't received confirmation yet. If you've paid, your receipt will appear here shortly."}
            {gaveUp && <button type="button" onClick={onRefresh} className="mt-1 block font-bold underline underline-offset-4">Check again</button>}
          </div>
        </div>
      )}

      <ul className="mt-5 space-y-2.5 border-y border-dashed border-ink-300 py-4 text-sm">
        {invoice.items.map((it) => (
          <li key={it.id} className="flex items-baseline justify-between gap-3">
            <span><span className="font-bold tabular-nums">{it.quantity}×</span> {it.name}</span>
            <span className="font-semibold tabular-nums">{formatPrice(it.unitPrice * it.quantity)}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={pay} noValidate className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-xs font-bold text-ink-700">Pickup or delivery?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[{ key: "pickup", label: "Pickup", sub: "Free", icon: Store, on: true }, { key: "delivery", label: "Delivery", sub: settings.deliveryFee > 0 ? `+ ${formatPrice(settings.deliveryFee)}` : "Fee on arrival", icon: Bike, on: settings.deliveryEnabled }]
              .filter((o) => o.on)
              .map(({ key, label, sub, icon: Icon }) => (
                <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition ${fulfilment === key ? "border-leaf-700 bg-leaf-50" : "border-cream-300 bg-cream-50"}`}>
                  <input type="radio" name="fulfilment" value={key} checked={fulfilment === key} onChange={() => setFulfilment(key)} className="sr-only" />
                  <Icon size={18} className="text-leaf-700" aria-hidden="true" />
                  <span className="leading-tight"><span className="block text-sm font-bold">{label}</span><span className="text-[11px] text-ink-500">{sub}</span></span>
                </label>
              ))}
          </div>
        </fieldset>
        <Field id="iv-name" label="Your name" error={fields.name}><input id="iv-name" className={inputClass(fields.name)} value={customer.name} onChange={set("name")} autoComplete="name" /></Field>
        <Field id="iv-phone" label="Phone number" error={fields.phone}><input id="iv-phone" className={inputClass(fields.phone)} value={customer.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" /></Field>
        <Field id="iv-email" label="Email" error={fields.email} hint="Your receipt is sent here."><input id="iv-email" className={inputClass(fields.email)} value={customer.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" /></Field>
        {delivery && <Field id="iv-address" label="Delivery address" error={fields.address}><textarea id="iv-address" rows={2} className={`${inputClass(fields.address)} h-auto py-3`} value={customer.address} onChange={set("address")} autoComplete="street-address" /></Field>}

        <dl className="space-y-1 border-t border-dashed border-ink-300 pt-4 text-sm">
          <div className="flex justify-between text-ink-600"><dt>Items</dt><dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
          {delivery && <div className="flex justify-between text-ink-600"><dt>Delivery</dt><dd>{totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : "Pay rider on arrival"}</dd></div>}
          <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(totals.total)}</dd></div>
        </dl>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
        {!settings.acceptingOrders && <p role="alert" className="rounded-lg bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-900">We&apos;re not taking orders right now.</p>}
        <button type="submit" disabled={busy || !settings.acceptingOrders} className="h-14 w-full rounded-full bg-leaf-700 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-leaf-800 disabled:opacity-60">
          {busy ? "Opening Paystack…" : `Pay ${formatPrice(totals.total)}`}
        </button>
        <p className="flex items-center justify-center gap-1 text-[11px] text-ink-500"><Lock size={11} aria-hidden="true" /> Secured by Paystack · card, bank transfer or USSD</p>
      </form>
    </div>
  );
}
