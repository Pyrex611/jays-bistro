import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Badge, Section, SwitchRow } from "../fields.jsx";
import { Switch, btnGhost } from "../ui.jsx";
import { getOpenStatus } from "../../../lib/hours.js";

const timeClass = "h-10 rounded-lg border border-cream-300 bg-cream-50 px-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 disabled:opacity-40";

/** Opening hours per day + one-off closures. Drives the info sheet, SEO data and (optionally) auto-pause. */
export default function HoursSettings({ settings, set }) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const status = getOpenStatus(settings.hours, new Date(), settings.closures);
  const setDay = (day, patch) => set({ hours: settings.hours.map((h) => (h.day === day ? { ...h, ...patch } : h)) });
  const invalid = (h) => !h.closed && h.close <= h.open;
  const monday = settings.hours[0];

  return (
    <Section id="hours" icon={Clock} title="Opening hours" subtitle="Lagos time. Shown to customers; can pause orders automatically." badge={<Badge tone={status.open ? "good" : "neutral"}>{status.open ? "Open now" : "Closed now"}</Badge>}>
      <ul className="divide-y divide-cream-300">
        {settings.hours.map((h) => (
          <li key={h.day} className="flex items-center gap-2 py-2.5">
            <span className="w-[4.6rem] flex-shrink-0 text-sm font-bold">{h.day.slice(0, 3)}<span className="hidden sm:inline">{h.day.slice(3)}</span></span>
            <Switch checked={!h.closed} onChange={(open) => setDay(h.day, { closed: !open })} label={`${h.day} open`} />
            <div className="ml-auto flex items-center gap-1.5">
              <input type="time" aria-label={`${h.day} opens`} className={`${timeClass} ${invalid(h) ? "border-red-400" : ""}`} value={h.open} disabled={h.closed} onChange={(e) => setDay(h.day, { open: e.target.value })} />
              <span className="text-ink-400">–</span>
              <input type="time" aria-label={`${h.day} closes`} className={`${timeClass} ${invalid(h) ? "border-red-400" : ""}`} value={h.close} disabled={h.closed} onChange={(e) => setDay(h.day, { close: e.target.value })} />
            </div>
          </li>
        ))}
      </ul>
      {settings.hours.some(invalid) && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">Closing time must be after opening time (the day is treated as closed until fixed).</p>}
      <button type="button" className={`${btnGhost} mt-3 w-full !py-2.5 text-xs`} onClick={() => set({ hours: settings.hours.map((h) => ({ ...h, open: monday.open, close: monday.close, closed: monday.closed })) })}>Copy Monday to every day</button>

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">Special closures</h3>
        <ul className="space-y-2">
          {settings.closures.map((c) => (
            <li key={c.date} className="flex items-center justify-between gap-2 rounded-xl border border-cream-300 bg-cream-100 px-3 py-2 text-sm">
              <span><b>{c.date}</b>{c.note && <span className="text-ink-500"> · {c.note}</span>}</span>
              <button type="button" aria-label={`Remove closure ${c.date}`} onClick={() => set({ closures: settings.closures.filter((x) => x.date !== c.date) })} className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
            </li>
          ))}
          {settings.closures.length === 0 && <li className="text-xs text-ink-500">None. Add public holidays or days off.</li>}
        </ul>
        <div className="mt-2 flex gap-2">
          <input type="date" aria-label="Closure date" value={date} onChange={(e) => setDate(e.target.value)} className={`${timeClass} flex-1`} />
          <input aria-label="Closure note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" maxLength={60} className={`${timeClass} flex-1`} />
          <button type="button" disabled={!date || settings.closures.some((c) => c.date === date)} onClick={() => { set({ closures: [...settings.closures, { date, note }].sort((a, b) => a.date.localeCompare(b.date)) }); setDate(""); setNote(""); }} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-leaf-700 text-white disabled:opacity-40" aria-label="Add closure"><Plus size={16} /></button>
        </div>
      </div>

      <div className="mt-2 divide-y divide-cream-300">
        <SwitchRow title="Pause orders automatically when closed" hint="Same switch as in Ordering." checked={settings.autoPauseOutsideHours} onChange={(v) => set({ autoPauseOutsideHours: v })} />
      </div>
    </Section>
  );
}
