import { Megaphone } from "lucide-react";
import { getOpenStatus } from "../../lib/hours.js";

/** Only shown when there is something the customer must know: orders paused, closed (with auto-pause on), or an announcement. */
export default function StatusBanners({ settings }) {
  const status = getOpenStatus(settings.hours, new Date(), settings.closures);
  const banners = [];
  if (!settings.acceptingOrders) banners.push({ key: "paused", tone: "warn", text: "We're not taking online orders right now. You can still browse the menu." });
  else if (settings.autoPauseOutsideHours && !status.open) banners.push({ key: "closed", tone: "warn", text: `${status.label}. Orders open when we do.` });
  if (settings.business.announcementEnabled && settings.business.announcement) banners.push({ key: "note", tone: "info", text: settings.business.announcement });
  if (banners.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-3">
      {banners.map((b) => (
        <div key={b.key} role="status" className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${b.tone === "warn" ? "border border-sun-300 bg-sun-100 text-sun-900" : "bg-sage-200 text-leaf-900"}`}>
          {b.tone === "info" && <Megaphone size={14} className="mt-px flex-shrink-0" />}
          {b.text}
        </div>
      ))}
    </div>
  );
}
