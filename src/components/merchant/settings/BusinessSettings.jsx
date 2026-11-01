import { ExternalLink, Store } from "lucide-react";
import { Section, SwitchRow } from "../fields.jsx";
import { Field } from "../../ui/FormField.jsx";
import { inputClass } from "../../ui/formStyles.js";

/** Contact + pickup details and the optional announcement banner. */
export default function BusinessSettings({ settings, set }) {
  const b = settings.business;
  const patch = (p) => set({ business: { ...b, ...p } });
  const digits = b.whatsapp.replace(/\D/g, "");
  const validWa = digits.length >= 10 && digits.length <= 15;

  return (
    <Section id="business" icon={Store} title="Business details" subtitle="Used on the info sheet, receipts and every WhatsApp link.">
      <div className="space-y-4">
        <Field id="b-wa" label="WhatsApp number" error={validWa ? undefined : "Use international format, e.g. 2348062624447"} hint="Digits only, with country code. Orders and “Message us” buttons go here.">
          <div className="flex gap-2">
            <input id="b-wa" inputMode="numeric" className={inputClass(!validWa)} value={b.whatsapp} onChange={(e) => patch({ whatsapp: e.target.value.replace(/\D/g, "").slice(0, 15) })} />
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" aria-label="Test this WhatsApp number" className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white"><ExternalLink size={18} /></a>
          </div>
        </Field>
        <Field id="b-phone" label="Phone (for calls)"><input id="b-phone" type="tel" inputMode="tel" className={inputClass(false)} value={b.phone} onChange={(e) => patch({ phone: e.target.value.slice(0, 20) })} placeholder="+234 806 262 4447" /></Field>
        <Field id="b-addr" label="Address"><input id="b-addr" className={inputClass(false)} value={b.address} onChange={(e) => patch({ address: e.target.value.slice(0, 120) })} /></Field>
        <Field id="b-pick" label="Pickup instructions" hint="e.g. “Collect at the side counter”"><input id="b-pick" className={inputClass(false)} value={b.pickupNote} onChange={(e) => patch({ pickupNote: e.target.value.slice(0, 200) })} /></Field>
        <div className="rounded-2xl border border-cream-300 bg-cream-100 px-4">
          <SwitchRow title="Show an announcement banner" hint="Appears at the top of the menu, e.g. “Closed Sunday for Easter”." checked={b.announcementEnabled} onChange={(v) => patch({ announcementEnabled: v })} />
          <div className="pb-4">
            <label htmlFor="b-ann" className="sr-only">Announcement text</label>
            <input id="b-ann" className={inputClass(false)} value={b.announcement} onChange={(e) => patch({ announcement: e.target.value.slice(0, 160) })} placeholder="Your announcement" />
            {b.announcementEnabled && b.announcement && <p className="mt-2 rounded-xl bg-sage-200 px-3 py-2 text-xs font-semibold text-leaf-900">{b.announcement}</p>}
          </div>
        </div>
      </div>
    </Section>
  );
}
