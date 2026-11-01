import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { Section } from "../fields.jsx";
import { btnGhost, btnPrimary } from "../ui.jsx";
import { Field } from "../../ui/FormField.jsx";
import { inputClass } from "../../ui/formStyles.js";
import { api } from "../../../services/api.js";

/** Change password (applies immediately) and sign out. In demo mode the password lives in this browser only. */
export default function SecuritySettings({ demo, forcePasswordChange, onPasswordChanged, onLogout }) {
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
      setMsg({ type: "ok", text: demo ? "Password changed for this browser." : "Password changed. Other devices have been signed out." });
      onPasswordChanged();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="security" icon={KeyRound} title="Password & sign-out" subtitle={demo ? "Demo: your password is kept in this browser only." : "Stored only as a secure hash. Never in plain text."}>
      {forcePasswordChange && <p role="alert" className="mb-3 rounded-xl bg-apricot-200 px-3 py-2 text-xs font-semibold text-sun-900">You&apos;re using the starter password. Choose your own below before doing anything else.</p>}
      <form onSubmit={change} className="space-y-3" noValidate>
        <Field id="pw-cur" label="Current password" hint={demo ? "Setup password: jays-setup" : undefined}><input id="pw-cur" type="password" autoComplete="current-password" className={inputClass(false)} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
        <Field id="pw-new" label="New password" hint="At least 10 characters. A few random words works well."><input id="pw-new" type="password" autoComplete="new-password" className={inputClass(false)} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
        <Field id="pw-conf" label="Repeat new password"><input id="pw-conf" type="password" autoComplete="new-password" className={inputClass(false)} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        {msg.text && <p role={msg.type === "error" ? "alert" : "status"} className={`text-xs font-semibold ${msg.type === "error" ? "text-red-600" : "text-leaf-700"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy || !pw.current || !pw.next} className={`${btnPrimary} w-full`}>{busy ? "Saving…" : "Change password"}</button>
      </form>
      <button type="button" onClick={onLogout} className={`${btnGhost} mt-3 w-full`}><LogOut size={16} /> Sign out</button>
    </Section>
  );
}
