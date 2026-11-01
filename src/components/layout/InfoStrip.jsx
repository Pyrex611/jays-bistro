import { useEffect, useState } from "react";
import { Bike, Store } from "lucide-react";
import { SITE } from "../../config/site.js";
import { getOpenStatus } from "../../lib/hours.js";
import { formatPrice } from "../../lib/format.js";

/** Open/closed + how you can get your food. Orders being paused by the merchant overrides everything. */
export default function InfoStrip({ settings }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const status = getOpenStatus(SITE.hours, now);

  return (
    <div className="px-4 pt-3">
      {!settings.acceptingOrders && (
        <div role="status" className="mb-2 rounded-xl border border-sun-300 bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-900">
          We&apos;re not taking online orders right now. You can still browse the menu.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-ink-600">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${status.open ? "bg-leaf-100 text-leaf-800" : "bg-cream-300 text-ink-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.open ? "bg-leaf-500" : "bg-ink-400"}`} aria-hidden="true" />
          {status.label}
        </span>
        <span className="inline-flex items-center gap-1"><Store size={13} aria-hidden="true" /> Pickup</span>
        {settings.deliveryEnabled && (
          <span className="inline-flex items-center gap-1">
            <Bike size={14} aria-hidden="true" /> Delivery{settings.deliveryFee > 0 ? ` · ${formatPrice(settings.deliveryFee)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
