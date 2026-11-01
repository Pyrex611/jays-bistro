import { Power } from "lucide-react";
import { NumberBox, Row, Section, SwitchRow } from "../fields.jsx";

export default function OrderingSettings({ settings, set }) {
  return (
    <Section id="ordering" icon={Power} title="Ordering" subtitle="Switches that control whether customers can order right now.">
      <div className="divide-y divide-cream-300">
        <SwitchRow title="Taking orders" hint="Off pauses Paystack and WhatsApp checkout instantly (same as the switch at the top)." checked={settings.acceptingOrders} onChange={(v) => set({ acceptingOrders: v })} />
        <SwitchRow title="Pause automatically outside opening hours" hint="Customers can browse but not order when you're closed (see Hours)." checked={settings.autoPauseOutsideHours} onChange={(v) => set({ autoPauseOutsideHours: v })} />
        <Row title="Minimum order" hint="Items subtotal. 0 = none. Zones can set a higher minimum."><NumberBox label="Minimum order" prefix="₦" value={settings.minOrder} onChange={(v) => set({ minOrder: v })} /></Row>
        <Row title="Ready for pickup in" hint="Shown at checkout and on the receipt. 0 hides it.">
          <div className="flex items-center gap-1.5">
            <NumberBox label="Minimum minutes" width="w-16" value={settings.prepMins[0]} onChange={(v) => set({ prepMins: [v, Math.max(v, settings.prepMins[1])] })} />
            <span className="text-ink-400">–</span>
            <NumberBox label="Maximum minutes" width="w-20" suffix="min" value={settings.prepMins[1]} onChange={(v) => set({ prepMins: [Math.min(settings.prepMins[0], v), v] })} />
          </div>
        </Row>
      </div>
    </Section>
  );
}
