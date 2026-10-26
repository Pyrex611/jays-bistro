import { useState } from "react";
import { Bike, Printer, Share2, Store } from "lucide-react";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import { SITE, assetUrl } from "../../config/site.js";
import { formatPrice } from "../../lib/format.js";
import { channelLabel, formatLagosDateTime } from "../../lib/receipt.js";

const Rule = () => <div className="my-4 border-t border-dashed border-ink-300" aria-hidden="true" />;

/** The receipt "paper": cream card, torn bottom edge, PAID stamp. Prints cleanly (Save as PDF). */
export default function Receipt({ receipt, mode }) {
  const [copied, setCopied] = useState(false);
  const when = formatLagosDateTime(receipt.payment.paidAt);
  const delivery = receipt.fulfilment === "delivery";
  const url = typeof window === "undefined" ? "" : window.location.origin + window.location.pathname;
  const waText = `Hello Jay's Bistro, I've paid for order ${receipt.code} (${formatPrice(receipt.total)}). ${delivery ? "Delivery" : "Pickup"} for ${receipt.customer.name}.`;

  const share = async () => {
    const data = { title: `Receipt ${receipt.code} · ${SITE.name}`, text: `My Jay's Bistro receipt ${receipt.code} — ${formatPrice(receipt.total)}`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div>
      <div className="print-paper receipt-edge-bottom relative bg-cream-50 px-6 pb-8 pt-7 text-ink-900 shadow-card">
        <span
          className="pointer-events-none absolute right-5 top-24 -rotate-12 rounded-md border-[3px] border-sun-500 px-2.5 py-0.5 font-display text-lg font-black tracking-widest text-sun-500 opacity-90"
          aria-label={mode === "mock" ? "Test payment" : "Paid"}
        >
          {mode === "mock" ? "TEST" : "PAID"}
        </span>

        <div className="text-center">
          <img src={assetUrl(SITE.logoPath)} alt="" width="56" height="56" className="mx-auto h-14 w-14 rounded-full border border-cream-300 object-cover" />
          <p className="mt-2 font-display text-lg font-extrabold text-leaf-700">{SITE.name}</p>
          <p className="text-[11px] text-ink-500">{SITE.address.street}, {SITE.address.locality}, {SITE.address.region}</p>
        </div>

        <Rule />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Receipt</p>
            <p className="font-display text-2xl font-black tracking-wide text-leaf-800">{receipt.code}</p>
          </div>
          <p className="text-right text-xs leading-snug text-ink-600">{when.date}<br />{when.time}</p>
        </div>
        <Rule />

        <ul className="space-y-2.5 text-sm">
          {receipt.items.map((it) => (
            <li key={it.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0"><span className="font-bold tabular-nums">{it.quantity}×</span> {it.name}</span>
              <span className="flex-shrink-0 font-semibold tabular-nums">{formatPrice(it.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <Rule />
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-ink-600"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(receipt.subtotal)}</dd></div>
          {delivery && <div className="flex justify-between text-ink-600"><dt>Delivery</dt><dd className="tabular-nums">{receipt.deliveryFee > 0 ? formatPrice(receipt.deliveryFee) : "Pay rider on arrival"}</dd></div>}
          <div className="flex items-baseline justify-between pt-2 text-leaf-800"><dt className="text-sm font-bold uppercase tracking-wider">Total paid</dt><dd className="font-display text-2xl font-black tabular-nums">{formatPrice(receipt.total)}</dd></div>
        </dl>

        <Rule />
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-ink-500">Paid with</dt><dd className="text-right font-semibold">{channelLabel(receipt.payment.channel)} · Paystack</dd>
          <dt className="text-ink-500">Reference</dt><dd className="break-all text-right font-mono text-[11px]">{receipt.payment.reference}</dd>
          <dt className="text-ink-500">Customer</dt><dd className="text-right font-semibold">{receipt.customer.name}</dd>
          <dt className="text-ink-500">{delivery ? "Deliver to" : "Pickup at"}</dt>
          <dd className="text-right font-semibold">{delivery ? receipt.customer.address : `${SITE.address.street}, ${SITE.address.locality}`}</dd>
          {receipt.customer.note && (<><dt className="text-ink-500">Note</dt><dd className="text-right">{receipt.customer.note}</dd></>)}
        </dl>

        <p className="mt-6 text-center text-xs text-ink-500">Thank you for choosing Jay&apos;s Bistro 💚🧡</p>
      </div>

      <div className="no-print mt-5 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => window.print()} className="flex flex-col items-center gap-1 rounded-2xl bg-cream-50/10 py-3 text-xs font-bold text-cream-50 ring-1 ring-cream-50/25 transition hover:bg-cream-50/20"><Printer size={18} />Save PDF</button>
        <button type="button" onClick={share} className="flex flex-col items-center gap-1 rounded-2xl bg-cream-50/10 py-3 text-xs font-bold text-cream-50 ring-1 ring-cream-50/25 transition hover:bg-cream-50/20"><Share2 size={18} />{copied ? "Link copied" : "Share"}</button>
        <a href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-2xl bg-[#25D366] py-3 text-xs font-bold text-white transition hover:brightness-95"><WhatsAppIcon size={18} />Message us</a>
      </div>
    </div>
  );
}

/** "What happens next" card shown under the receipt. */
export function NextSteps({ receipt }) {
  const delivery = receipt.fulfilment === "delivery";
  const Icon = delivery ? Bike : Store;
  return (
    <div className="no-print mt-5 flex gap-3 rounded-2xl bg-cream-50/10 p-4 text-cream-50 ring-1 ring-cream-50/20">
      <Icon size={22} className="mt-0.5 flex-shrink-0 text-sun-300" aria-hidden="true" />
      <div className="text-sm leading-relaxed">
        <p className="font-bold">{delivery ? "We're getting your order ready" : "Your order is being prepared"}</p>
        <p className="text-leaf-100">
          {delivery
            ? `We'll call ${receipt.customer.phone ? `+${receipt.customer.phone}` : "you"} when the rider is on the way.`
            : <>Show code <span className="font-bold text-sun-300">{receipt.code}</span> when you arrive to collect.</>}
        </p>
      </div>
    </div>
  );
}
