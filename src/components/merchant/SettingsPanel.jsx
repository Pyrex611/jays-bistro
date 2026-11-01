import { useEffect } from "react";
import OrderingSettings from "./settings/OrderingSettings.jsx";
import DeliverySettings from "./settings/DeliverySettings.jsx";
import FeeSettings from "./settings/FeeSettings.jsx";
import HoursSettings from "./settings/HoursSettings.jsx";
import BusinessSettings from "./settings/BusinessSettings.jsx";
import AlertsSettings from "./settings/AlertsSettings.jsx";
import IntegrationsPanel from "./settings/IntegrationsPanel.jsx";
import SecuritySettings from "./settings/SecuritySettings.jsx";

const SECTIONS = [
  ["ordering", "Ordering"], ["delivery", "Delivery"], ["fees", "Fees"], ["hours", "Hours"],
  ["business", "Business"], ["alerts", "Alerts"], ["integrations", "Go live"], ["security", "Security"],
];

/**
 * Settings, split into cards with a section strip. Public settings (ordering, delivery, fees, hours, business) edit the draft
 * and go live with Publish. Alerts and security are private and save on their own.
 */
export default function SettingsPanel({ draft, setDraft, capabilities, demo, section, forcePasswordChange, onPasswordChanged, onLogout }) {
  const settings = draft.settings;
  const set = (patch) => setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  useEffect(() => {
    if (section) document.getElementById(`settings-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);

  const jump = (key) => document.getElementById(`settings-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-4 pb-28">
      <nav aria-label="Settings sections" className="scrollbar-hide sticky top-14 z-20 -mx-4 flex gap-2 overflow-x-auto bg-cream-100/95 px-4 py-2 backdrop-blur">
        {SECTIONS.map(([key, label]) => (
          <button key={key} type="button" onClick={() => jump(key)} className="flex-shrink-0 rounded-full bg-cream-50 px-3.5 py-2 text-xs font-bold text-ink-700 ring-1 ring-cream-300 transition hover:bg-cream-200">{label}</button>
        ))}
      </nav>

      {forcePasswordChange && (
        <div role="alert" className="rounded-2xl border border-sun-400 bg-apricot-200 p-4 text-sm text-sun-900">
          <p className="font-bold">Set your own password</p>
          <p className="mt-1 text-xs">You&apos;re using the starter password. Choose a new one in Security before you do anything else.</p>
        </div>
      )}

      <OrderingSettings settings={settings} set={set} />
      <DeliverySettings settings={settings} set={set} />
      <FeeSettings settings={settings} set={set} />
      <HoursSettings settings={settings} set={set} />
      <BusinessSettings settings={settings} set={set} />
      <AlertsSettings capabilities={capabilities} />
      <IntegrationsPanel capabilities={capabilities} demo={demo} />
      <SecuritySettings demo={demo} forcePasswordChange={forcePasswordChange} onPasswordChanged={onPasswordChanged} onLogout={onLogout} />
    </div>
  );
}
