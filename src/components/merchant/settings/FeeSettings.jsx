import { useState } from "react";
import { Receipt } from "lucide-react";
import { Badge, NumberBox, Row, Section, SwitchRow } from "../fields.jsx";
import { computeServiceFee } from "../../../lib/pricing.js";
import { formatPrice } from "../../../lib/format.js";

const SAMPLES = [1500, 5000, 10000, 25000];

/** The "Online payment fee" line customers see when paying with Paystack, with a live calculator. */
export default function FeeSettings({ settings, set }) {
  const f = settings.serviceFee;
  const [sample, setSample] = useState(9000);
  const patch = (p) => set({ serviceFee: { ...f, ...p } });

  return (
    <Section id="fees" icon={Receipt} title="Online payment fee" subtitle="A separate line at checkout so customers cover card/transfer charges." badge={<Badge tone={f.enabled ? "good" : "neutral"}>{f.enabled ? "Shown" : "Off"}</Badge>}>
      <div className="divide-y divide-cream-300">
        <SwitchRow title="Show a fee line for online payments" hint="Not added to WhatsApp orders until the customer pays online." checked={f.enabled} onChange={(v) => patch({ enabled: v })} />
        <Row title="Percentage" hint="Of items + delivery."><NumberBox label="Percentage" step suffix="%" value={f.percent} onChange={(v) => patch({ percent: Math.min(v, 10) })} /></Row>
        <Row title="Flat amount" hint="Added on top…"><NumberBox label="Flat amount" prefix="₦" value={f.flat} onChange={(v) => patch({ flat: Math.min(v, 5000) })} /></Row>
        <Row title="…only from" hint="Orders below this skip the flat amount."><NumberBox label="Flat amount applies from" prefix="₦" value={f.flatWaivedBelow} onChange={(v) => patch({ flatWaivedBelow: v })} /></Row>
        <Row title="Never more than" hint="Cap per order. 0 = no cap."><NumberBox label="Fee cap" prefix="₦" value={f.cap} onChange={(v) => patch({ cap: v })} /></Row>
      </div>

      <div className="surface-apricot mt-3 rounded-2xl p-4 text-sun-900">
        <p className="text-xs font-bold uppercase tracking-widest">Calculator</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <label htmlFor="fee-sample" className="text-sm font-semibold">Order total (items + delivery)</label>
          <NumberBox id="fee-sample" width="w-28" prefix="₦" value={sample} onChange={setSample} />
        </div>
        <p className="mt-2 flex items-baseline justify-between text-sm"><span>Customer pays fee</span><b className="font-display text-xl tabular-nums">{formatPrice(computeServiceFee(sample, f))}</b></p>
        <p className="flex items-baseline justify-between text-sm"><span>Customer total</span><b className="tabular-nums">{formatPrice(sample + computeServiceFee(sample, f))}</b></p>
        <ul className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[11px]">
          {SAMPLES.map((n) => <li key={n} className="rounded-lg bg-white/40 px-1 py-1.5"><span className="block opacity-70">{formatPrice(n)}</span><b className="tabular-nums">+{formatPrice(computeServiceFee(n, f))}</b></li>)}
        </ul>
      </div>
      <p className="mt-2 text-[11px] text-ink-500">Defaults mirror a typical local-card structure. Check them against your own Paystack plan; Paystack&apos;s actual charge is deducted from what you receive, this line lets customers cover it.</p>
    </Section>
  );
}
