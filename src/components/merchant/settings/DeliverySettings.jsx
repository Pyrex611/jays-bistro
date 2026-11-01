import { useState } from "react";
import { ArrowDown, ArrowUp, Bike, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, NumberBox, Row, Section, SwitchRow } from "../fields.jsx";
import { Sheet, btnDanger, btnGhost, btnPrimary } from "../ui.jsx";
import { Field } from "../../ui/FormField.jsx";
import { inputClass } from "../../ui/formStyles.js";
import { DEMO_ZONES } from "../../../demo/demoStore.js";
import { formatPrice } from "../../../lib/format.js";

const BLANK = { id: "", name: "", fee: 500, minOrder: 0, etaMins: [20, 35], enabled: true };
const eta = (r) => (r?.[1] ? `${r[0]}–${r[1]} min` : "no ETA");

function ZoneSheet({ zone, onSave, onDelete, onClose }) {
  const isNew = !zone.name;
  const [form, setForm] = useState(zone);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    const name = form.name.trim();
    if (name.length < 2 || name.length > 40) return setError("Give the area a name (2–40 characters).");
    onSave({ ...form, name });
  };

  return (
    <Sheet
      open
      title={isNew ? "Add delivery area" : "Edit delivery area"}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {!isNew && <button type="button" className={`${confirm ? btnDanger : btnGhost} !px-4`} onClick={() => (confirm ? onDelete(zone.id) : setConfirm(true))} aria-label="Delete area"><Trash2 size={16} />{confirm ? " Tap to confirm" : ""}</button>}
          <button type="button" className={`${btnPrimary} flex-1`} onClick={save}>{isNew ? "Add area" : "Save area"}</button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field id="z-name" label="Area name" error={error}><input id="z-name" className={inputClass(error)} value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="High Level" maxLength={40} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="z-fee" label="Delivery fee"><NumberBox id="z-fee" width="w-full" prefix="₦" value={form.fee} onChange={(v) => patch({ fee: v })} /></Field>
          <Field id="z-min" label="Minimum order" hint="0 = use the global minimum"><NumberBox id="z-min" width="w-full" prefix="₦" value={form.minOrder} onChange={(v) => patch({ minOrder: v })} /></Field>
        </div>
        <Field id="z-eta" label="Estimated delivery time (minutes)" hint="Leave both at 0 to hide the estimate">
          <div className="flex items-center gap-2">
            <NumberBox label="From" width="w-full" value={form.etaMins[0]} onChange={(v) => patch({ etaMins: [v, Math.max(v, form.etaMins[1])] })} />
            <span className="text-ink-400">to</span>
            <NumberBox label="To" width="w-full" value={form.etaMins[1]} onChange={(v) => patch({ etaMins: [Math.min(form.etaMins[0], v), v] })} />
          </div>
        </Field>
        <SwitchRow title="Delivering here" hint="Off hides the area from customers without deleting it." checked={form.enabled} onChange={(v) => patch({ enabled: v })} />
      </div>
    </Sheet>
  );
}

/** Delivery areas with per-area fee, minimum and ETA; free-delivery threshold; customer-facing note. */
export default function DeliverySettings({ settings, set }) {
  const [editing, setEditing] = useState(null);
  const zones = settings.zones;
  const move = (i, d) => {
    const next = [...zones];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set({ zones: next });
  };
  const save = (zone) => {
    const exists = zones.some((z) => z.id === zone.id && zone.id);
    set({ zones: exists ? zones.map((z) => (z.id === zone.id ? zone : z)) : [...zones, zone] });
    setEditing(null);
  };

  return (
    <Section id="delivery" icon={Bike} title="Delivery" subtitle="Where you deliver, what it costs, and how long it takes." badge={<Badge tone={settings.deliveryEnabled ? "good" : "neutral"}>{settings.deliveryEnabled ? "On" : "Pickup only"}</Badge>}>
      <SwitchRow title="Offer delivery" hint="Off = customers can only choose pickup." checked={settings.deliveryEnabled} onChange={(v) => set({ deliveryEnabled: v })} />

      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500">Delivery areas</h3>
          <span className="text-xs text-ink-500">{zones.filter((z) => z.enabled).length} active</span>
        </div>
        <ul className="space-y-2">
          {zones.map((z, i) => (
            <li key={z.id} className={`flex items-center gap-2 rounded-2xl border p-2.5 ${z.enabled ? "border-cream-300 bg-cream-100" : "border-dashed border-cream-400 bg-cream-50 opacity-70"}`}>
              <button type="button" onClick={() => setEditing(z)} className="min-w-0 flex-1 text-left" aria-label={`Edit ${z.name}`}>
                <p className="truncate text-sm font-bold">{z.name} {!z.enabled && <span className="text-[10px] font-semibold text-ink-500">(off)</span>}</p>
                <p className="text-xs text-ink-500"><span className="font-semibold text-leaf-700">{formatPrice(z.fee)}</span> · {eta(z.etaMins)}{z.minOrder > 0 ? ` · min ${formatPrice(z.minOrder)}` : ""}</p>
              </button>
              {[[-1, ArrowUp, "Move up"], [1, ArrowDown, "Move down"]].map(([d, Icon, label]) => (
                <button key={label} type="button" disabled={(d < 0 && i === 0) || (d > 0 && i === zones.length - 1)} onClick={() => move(i, d)} aria-label={`${label}: ${z.name}`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-200 disabled:opacity-25"><Icon size={15} /></button>
              ))}
              <button type="button" onClick={() => setEditing(z)} aria-label={`Edit ${z.name}`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-200"><Pencil size={15} /></button>
            </li>
          ))}
        </ul>
        {zones.length === 0 && (
          <div className="rounded-2xl border border-dashed border-cream-400 bg-cream-100 p-4 text-center">
            <p className="text-sm font-bold">No areas yet: customers pay one flat fee</p>
            <p className="mt-1 text-xs text-ink-500">Add areas to charge by location and show estimated times.</p>
            <button type="button" onClick={() => set({ zones: DEMO_ZONES })} className="mt-2 text-xs font-bold text-leaf-700 underline underline-offset-4">Start from sample areas</button>
          </div>
        )}
        <button type="button" onClick={() => setEditing(BLANK)} className={`${btnGhost} mt-3 w-full`}><Plus size={16} /> Add delivery area</button>
      </div>

      <div className="mt-3 divide-y divide-cream-300">
        {zones.length === 0 && <Row title="Flat delivery fee" hint="Used when no areas are set. 0 = customer pays the rider."><NumberBox label="Flat delivery fee" prefix="₦" value={settings.deliveryFee} onChange={(v) => set({ deliveryFee: v })} /></Row>}
        <Row title="Free delivery from" hint="Items subtotal at or above this. 0 = never free."><NumberBox label="Free delivery threshold" prefix="₦" value={settings.freeDeliveryAbove} onChange={(v) => set({ freeDeliveryAbove: v })} /></Row>
      </div>

      <Field id="d-note" label="Note shown to customers" hint={`${settings.deliveryNote.length}/240: e.g. "Outside these areas? WhatsApp us."`}>
        <textarea id="d-note" rows={2} className={`${inputClass(false)} h-auto py-3`} value={settings.deliveryNote} onChange={(e) => set({ deliveryNote: e.target.value.slice(0, 240) })} />
      </Field>

      {editing && <ZoneSheet zone={editing} onSave={save} onDelete={(id) => { set({ zones: zones.filter((z) => z.id !== id) }); setEditing(null); }} onClose={() => setEditing(null)} />}
    </Section>
  );
}
