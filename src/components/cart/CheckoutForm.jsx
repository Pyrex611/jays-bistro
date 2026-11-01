import { useState } from "react";
import { ArrowLeft, Bike, Clock, Lock, Store } from "lucide-react";
import { formatPrice } from "../../lib/format.js";
import { loadCustomer } from "../../lib/cartStorage.js";
import { activeZones, computeTotals } from "../../lib/pricing.js";
import { Field } from "../ui/FormField.jsx";
import { inputClass } from "../ui/formStyles.js";

const eta = (range) => (range?.[1] ? `${range[0]}–${range[1]} min` : "");

/**
 * Step 2 of checkout: who + how. Single column, labels above fields, autofill hints, details remembered on this device,
 * the full price (delivery AND the online-payment fee) always visible, and the form is never cleared on error.
 */
export default function CheckoutForm({ lines, settings, busy, error, fieldErrors, onBack, onSubmit }) {
  const [customer, setCustomer] = useState(() => ({ ...loadCustomer(), note: "" }));
  const [fulfilment, setFulfilment] = useState("pickup");
  const [zoneId, setZoneId] = useState("");
  const [showNote, setShowNote] = useState(false);
  const set = (key) => (e) => setCustomer((c) => ({ ...c, [key]: e.target.value }));

  const zones = activeZones(settings);
  const totals = computeTotals(lines.map((l) => ({ unitPrice: l.item.price, quantity: l.quantity })), fulfilment, settings, { zoneId, payOnline: true });
  const delivery = fulfilment === "delivery";
  const readyIn = delivery ? eta(totals.zone?.etaMins) : eta(settings.prepMins);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ customer, fulfilment, zoneId });
      }}
      noValidate
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs font-bold text-leaf-700"><ArrowLeft size={14} /> Back to tray</button>

        <fieldset>
          <legend className="mb-1.5 text-xs font-bold text-ink-700">How would you like your order?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "pickup", label: "Pickup", sub: "Free", icon: Store, enabled: true },
              { key: "delivery", label: "Delivery", sub: zones.length ? `From ${formatPrice(Math.min(...zones.map((z) => z.fee)))}` : settings.deliveryFee > 0 ? `+ ${formatPrice(settings.deliveryFee)}` : "Fee on arrival", icon: Bike, enabled: settings.deliveryEnabled },
            ]
              .filter((o) => o.enabled)
              .map(({ key, label, sub, icon: Icon }) => (
                <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition ${fulfilment === key ? "border-leaf-700 bg-sage-100" : "border-cream-300 bg-cream-50"}`}>
                  <input type="radio" name="fulfilment" value={key} checked={fulfilment === key} onChange={() => setFulfilment(key)} className="sr-only" />
                  <Icon size={18} className="text-leaf-700" aria-hidden="true" />
                  <span className="leading-tight"><span className="block text-sm font-bold">{label}</span><span className="text-[11px] text-ink-500">{sub}</span></span>
                </label>
              ))}
          </div>
        </fieldset>

        {delivery && zones.length > 0 && (
          <Field id="co-zone" label="Delivery area" error={fieldErrors.zone} hint={settings.deliveryNote || undefined}>
            <select id="co-zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={inputClass(fieldErrors.zone)}>
              <option value="">Choose your area…</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} · {formatPrice(z.fee)}{z.minOrder > 0 ? ` · min ${formatPrice(z.minOrder)}` : ""}</option>)}
            </select>
          </Field>
        )}
        {readyIn && (
          <p className="flex items-center gap-1.5 rounded-xl bg-sage-100 px-3 py-2 text-xs font-semibold text-leaf-900"><Clock size={14} aria-hidden="true" /> {delivery ? "Delivered in about" : "Ready in about"} {readyIn}</p>
        )}

        <Field id="co-name" label="Your name" error={fieldErrors.name}>
          <input id="co-name" className={inputClass(fieldErrors.name)} value={customer.name} onChange={set("name")} autoComplete="name" placeholder="Ada Obi" />
        </Field>
        <Field id="co-phone" label="Phone number" error={fieldErrors.phone} hint="So we can reach you about your order.">
          <input id="co-phone" className={inputClass(fieldErrors.phone)} value={customer.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0806 000 0000" />
        </Field>
        <Field id="co-email" label="Email" error={fieldErrors.email} hint="Your receipt is sent here. We never share it.">
          <input id="co-email" className={inputClass(fieldErrors.email)} value={customer.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        {delivery && (
          <Field id="co-address" label="Delivery address" error={fieldErrors.address} hint="Street and a landmark help our rider.">
            <textarea id="co-address" rows={2} className={`${inputClass(fieldErrors.address)} h-auto py-3`} value={customer.address} onChange={set("address")} autoComplete="street-address" placeholder="12 High Level, near the roundabout" />
          </Field>
        )}
        {showNote ? (
          <Field id="co-note" label="Note for the kitchen (optional)" error={fieldErrors.note}>
            <input id="co-note" className={inputClass(fieldErrors.note)} value={customer.note} onChange={set("note")} maxLength={200} placeholder="No pepper, extra sauce…" />
          </Field>
        ) : (
          <button type="button" onClick={() => setShowNote(true)} className="text-xs font-bold text-leaf-700 underline underline-offset-4">+ Add a note for the kitchen</button>
        )}
      </div>

      <div className="border-t border-cream-300 bg-cream-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <dl className="mb-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink-600"><dt>Items</dt><dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
          {delivery && (
            <div className="flex justify-between text-ink-600">
              <dt>Delivery{totals.freeDelivery ? " (free!)" : ""}</dt>
              <dd className="tabular-nums">{totals.zoneRequired ? "Choose area" : totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : zones.length || totals.freeDelivery ? "Free" : "Pay rider on arrival"}</dd>
            </div>
          )}
          {totals.serviceFee > 0 && <div className="flex justify-between text-ink-600"><dt>Online payment fee</dt><dd className="tabular-nums">{formatPrice(totals.serviceFee)}</dd></div>}
          <div className="flex justify-between text-base font-extrabold text-ink-900"><dt>Total</dt><dd className="tabular-nums">{formatPrice(totals.total)}</dd></div>
        </dl>
        {totals.belowMinimum && <p role="alert" className="mb-2 text-xs font-semibold text-red-600">Minimum order is {formatPrice(totals.minOrder)}. Add {formatPrice(totals.shortBy)} more.</p>}
        {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={busy !== null || totals.belowMinimum} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-leaf-700 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-leaf-800 active:scale-[0.99] disabled:opacity-60">
          {busy === "pay" ? "Opening secure payment…" : <>Pay {formatPrice(totals.total)}</>}
        </button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-ink-500"><Lock size={11} aria-hidden="true" /> Secured by Paystack · card, bank transfer or USSD</p>
      </div>
    </form>
  );
}
