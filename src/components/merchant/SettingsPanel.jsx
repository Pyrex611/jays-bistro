import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { Card, Switch, btnGhost, btnPrimary } from "./ui.jsx";
import { Field } from "../ui/FormField.jsx";
import { inputClass } from "../ui/formStyles.js";
import { api } from "../../services/api.js";

const Row = ({ title, hint, children }) => (
  <div className="flex items-center justify-between gap-3 py-3">
    <div className="min-w-0"><p className="text-sm font-bold">{title}</p>{hint && <p className="text-[11px] text-ink-500">{hint}</p>}</div>
    {children}
  </div>
);

const NumberField = ({ id, value, onChange }) => (
  <div className="relative w-28 flex-shrink-0">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">₦</span>
    <input id={id} inputMode="numeric" value={value} onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, "")) || 0)} className={`${inputClass(false)} !h-11 pl-7 text-right`} />
  </div>
);

/** Store switches (published with the menu) and password management (applies immediately). */
export default function SettingsPanel({ draft, setDraft, forcePasswordChange, onPasswordChanged, onLogout }) {
  const s = draft.settings;
  const setS = (patch) => setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const change = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setMsg({ type: "error", text: "The new passwords don't match." });
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      await api.merchant.changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setMsg({ type: "ok", text: "Password changed. Other devices have been signed out." });
      onPasswordChanged();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {forcePasswordChange && (
        <div role="alert" className="rounded-2xl border border-sun-400 bg-sun-100 p-4 text-sm text-sun-900">
          <p className="font-bold">Set your own password</p>
          <p className="mt-1 text-xs">You&apos;re using the starter password. Choose a new one below before you do anything else.</p>
        </div>
      )}

      <Card>
        <h2 className="font-display text-base font-extrabold text-leaf-800">Ordering</h2>
        <div className="divide-y divide-cream-300">
          <Row title="Accepting orders" hint="Turn off to pause Paystack and WhatsApp checkout."><Switch checked={s.acceptingOrders} onChange={(v) => setS({ acceptingOrders: v })} label="Accepting orders" /></Row>
          <Row title="Offer delivery" hint="Off = pickup only."><Switch checked={s.deliveryEnabled} onChange={(v) => setS({ deliveryEnabled: v })} label="Offer delivery" /></Row>
          <Row title="Delivery fee" hint="0 = customer pays the rider."><NumberField id="fee" value={s.deliveryFee} onChange={(v) => setS({ deliveryFee: v })} /></Row>
          <Row title="Minimum order" hint="Items subtotal. 0 = none."><NumberField id="min" value={s.minOrder} onChange={(v) => setS({ minOrder: v })} /></Row>
        </div>
        <p className="mt-2 text-[11px] text-ink-500">These go live when you press Publish.</p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-leaf-800"><KeyRound size={16} /> Password</h2>
        <form onSubmit={change} className="mt-3 space-y-3" noValidate>
          <Field id="pw-cur" label="Current password"><input id="pw-cur" type="password" autoComplete="current-password" className={inputClass(false)} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
          <Field id="pw-new" label="New password" hint="At least 10 characters. A few random words works well."><input id="pw-new" type="password" autoComplete="new-password" className={inputClass(false)} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Field id="pw-conf" label="Repeat new password"><input id="pw-conf" type="password" autoComplete="new-password" className={inputClass(false)} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          {msg.text && <p role={msg.type === "error" ? "alert" : "status"} className={`text-xs font-semibold ${msg.type === "error" ? "text-red-600" : "text-leaf-700"}`}>{msg.text}</p>}
          <button type="submit" disabled={busy || !pw.current || !pw.next} className={`${btnPrimary} w-full`}>{busy ? "Saving…" : "Change password"}</button>
        </form>
      </Card>

      <button type="button" onClick={onLogout} className={`${btnGhost} w-full`}><LogOut size={16} /> Sign out</button>
    </div>
  );
}
