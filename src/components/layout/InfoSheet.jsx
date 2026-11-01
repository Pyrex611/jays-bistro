import { useEffect, useState } from "react";
import { Bike, Clock, MapPin, Phone, Store } from "lucide-react";
import Sheet from "../ui/Sheet.jsx";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import { getOpenStatus, formatClock } from "../../lib/hours.js";
import { formatPrice } from "../../lib/format.js";
import { activeZones } from "../../lib/pricing.js";

const etaText = (range) => (range?.[1] ? `${range[0]}–${range[1]} min` : "");

/** Everything that used to crowd the first screen: open/closed, hours, where we are, how delivery works, how to reach us. */
export default function InfoSheet({ open, onClose, settings }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!open) return undefined;
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [open]);

  const status = getOpenStatus(settings.hours, now, settings.closures);
  const zones = activeZones(settings);
  const b = settings.business;
  const todayName = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Lagos", weekday: "long" }).format(now);

  return (
    <Sheet open={open} title="Jay's Bistro" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.open ? "bg-leaf-100 text-leaf-800" : "bg-cream-300 text-ink-700"}`}>
          <span className={`h-2 w-2 rounded-full ${status.open ? "bg-leaf-500" : "bg-ink-400"}`} aria-hidden="true" />
          {status.label}
        </span>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-500"><Clock size={14} /> Opening hours</h3>
          <ul className="divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-100">
            {settings.hours.map((h) => (
              <li key={h.day} className={`flex justify-between px-3 py-2 ${h.day === todayName ? "font-bold text-leaf-800" : "text-ink-700"}`}>
                <span>{h.day}</span>
                <span>{h.closed ? "Closed" : `${formatClock(h.open)} – ${formatClock(h.close)}`}</span>
              </li>
            ))}
          </ul>
          {settings.closures.length > 0 && <p className="mt-2 text-xs text-ink-500">Special closures: {settings.closures.map((c) => `${c.date}${c.note ? ` (${c.note})` : ""}`).join(", ")}</p>}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-500"><Store size={14} /> Pickup</h3>
          <p className="flex items-start gap-2 text-ink-700"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-leaf-600" />{b.address}</p>
          {settings.prepMins[1] > 0 && <p className="mt-1 text-ink-600">Ready in about {etaText(settings.prepMins)}.</p>}
          {b.pickupNote && <p className="mt-1 text-ink-600">{b.pickupNote}</p>}
        </section>

        {settings.deliveryEnabled && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-500"><Bike size={14} /> Delivery</h3>
            {zones.length > 0 ? (
              <ul className="divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-100">
                {zones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span><span className="font-semibold">{z.name}</span>{etaText(z.etaMins) && <span className="ml-2 text-xs text-ink-500">{etaText(z.etaMins)}</span>}</span>
                    <span className="font-bold text-leaf-700">{formatPrice(z.fee)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-700">{settings.deliveryFee > 0 ? `Flat delivery fee ${formatPrice(settings.deliveryFee)}.` : "Delivery fee is paid to the rider."}</p>
            )}
            <ul className="mt-2 space-y-0.5 text-xs text-ink-600">
              {settings.freeDeliveryAbove > 0 && <li>Free delivery on orders from {formatPrice(settings.freeDeliveryAbove)}.</li>}
              {settings.minOrder > 0 && <li>Minimum order {formatPrice(settings.minOrder)}.</li>}
              {settings.deliveryNote && <li>{settings.deliveryNote}</li>}
            </ul>
          </section>
        )}

        <section className="flex flex-wrap gap-2 pt-1">
          <a href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white"><WhatsAppIcon size={18} /> WhatsApp us</a>
          {b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-cream-400 bg-cream-50 px-4 py-3 text-sm font-bold text-ink-800"><Phone size={16} /> Call</a>}
        </section>
      </div>
    </Sheet>
  );
}
