import { useEffect, useState } from "react";
import { BellRing, Mail, MessageSquare, Send, X } from "lucide-react";
import { Badge, Section, SwitchRow } from "../fields.jsx";
import WhatsAppIcon from "../../icons/WhatsAppIcon.jsx";
import { Sheet, btnGhost, btnPrimary } from "../ui.jsx";
import { api } from "../../../services/api.js";
import { formatLagosDateTime } from "../../../lib/receipt.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STATUS_TONE = { simulated: "demo", sent: "good", skipped: "neutral", failed: "bad" };

/** The email exactly as the email channel will send it (rendered by the same pure template). */
function AlertPreview({ result, onClose }) {
  const [tab, setTab] = useState("email");
  return (
    <Sheet open title="Kitchen alert preview" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p className="rounded-xl bg-apricot-200 px-3 py-2 text-xs font-semibold text-sun-900">Simulated: nothing was sent. This is what the kitchen will receive once email is connected.</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-ink-500">To</dt><dd className="break-all font-semibold">{result.to.length ? result.to.join(", ") : "No recipients yet"}</dd>
          <dt className="text-ink-500">Subject</dt><dd className="font-semibold">{result.rendered.subject}</dd>
        </dl>
        <div role="tablist" aria-label="Preview format" className="grid grid-cols-2 rounded-full bg-cream-200 p-0.5 text-xs font-bold">
          {[["email", "Email"], ["text", "Plain text"]].map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} className={`rounded-full py-2 ${tab === k ? "bg-leaf-700 text-white" : "text-ink-600"}`}>{label}</button>)}
        </div>
        {tab === "email" ? (
          <iframe title="Email preview" sandbox="" srcDoc={`<body style="margin:12px;background:#fff">${result.rendered.html}</body>`} className="h-[26rem] w-full rounded-xl border border-cream-300 bg-white" />
        ) : (
          <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-xl border border-cream-300 bg-cream-100 p-3 text-xs">{result.rendered.text}</pre>
        )}
      </div>
    </Sheet>
  );
}

function PlannedChannel({ icon: Icon, name, text }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-dashed border-cream-400 bg-cream-100 p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-cream-200 text-ink-500"><Icon size={18} /></span>
        <div><p className="text-sm font-bold">{name}</p><p className="text-xs text-ink-500">{text}</p></div>
      </div>
      <Badge tone="soon">Planned</Badge>
    </div>
  );
}

/** Kitchen alerts. Email works as a full simulation today (config, recipients, events, log, preview); real sending arrives with the integration. */
export default function AlertsSettings({ capabilities }) {
  const [state, setState] = useState({ loading: true });
  const [cfg, setCfg] = useState(null);
  const [saved, setSaved] = useState(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.merchant.getNotifications()
      .then((r) => { if (cancelled) return; setCfg(r.config); setSaved(r.config); setState({ alerts: r.alerts }); })
      .catch((e) => !cancelled && setState({ unavailable: e.status === 501, error: e.message }));
    return () => { cancelled = true; };
  }, []);

  const dirty = cfg && JSON.stringify(cfg) !== JSON.stringify(saved);
  const patch = (p) => setCfg((c) => ({ ...c, ...p }));
  const patchEmail = (p) => setCfg((c) => ({ ...c, email: { ...c.email, ...p } }));
  const patchEvents = (p) => setCfg((c) => ({ ...c, events: { ...c.events, ...p } }));

  const addRecipient = () => {
    const v = draftEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return setEmailError("That doesn't look like an email address.");
    if (cfg.email.recipients.includes(v)) return setEmailError("Already added.");
    if (cfg.email.recipients.length >= 5) return setEmailError("Up to 5 recipients.");
    patchEmail({ recipients: [...cfg.email.recipients, v] });
    setDraftEmail("");
    setEmailError("");
  };

  const save = async () => {
    setBusy("save");
    try {
      const r = await api.merchant.saveNotifications(cfg);
      setCfg(r.config); setSaved(r.config); setState({ alerts: r.alerts });
      setNotice("Alert settings saved.");
    } catch (e) {
      setNotice(e.message);
    } finally { setBusy(""); }
  };

  const test = async () => {
    setBusy("test");
    try {
      if (dirty) await save();
      const r = await api.merchant.sendTestAlert();
      setPreview(r);
      setState({ alerts: r.alerts });
    } catch (e) {
      setNotice(e.message);
    } finally { setBusy(""); }
  };

  const badge = <Badge tone={capabilities?.email ? "good" : "demo"}>{capabilities?.email ? "Connected" : "Simulated"}</Badge>;

  return (
    <Section id="alerts" icon={BellRing} title="Kitchen alerts" subtitle="Get told the moment an order is paid." badge={badge}>
      {state.loading && <div className="skeleton h-32 rounded-2xl" role="status" aria-label="Loading alerts" />}

      {state.unavailable && (
        <div className="rounded-2xl border border-dashed border-cream-400 bg-cream-100 p-4 text-sm text-ink-600">
          <p className="font-bold text-ink-800">Alerts connect with the integration</p>
          <p className="mt-1 text-xs">Recipients, events, test sends and the alert log are designed and ready. They switch on when email is connected.</p>
        </div>
      )}
      {state.error && !state.unavailable && <p role="alert" className="text-sm font-semibold text-red-600">{state.error}</p>}

      {cfg && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-cream-300 bg-cream-100 p-3">
            <div className="flex items-start gap-3">
              <span className="surface-sage flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-leaf-800"><Mail size={18} /></span>
              <div className="min-w-0 flex-1">
                <SwitchRow title="Email" hint="Sent to everyone listed below." checked={cfg.email.enabled} onChange={(v) => patchEmail({ enabled: v })} />
              </div>
            </div>

            <ul className="mt-1 flex flex-wrap gap-2">
              {cfg.email.recipients.map((r) => (
                <li key={r} className="inline-flex items-center gap-1 rounded-full bg-sage-200 py-1 pl-3 pr-1 text-xs font-semibold text-leaf-900">{r}
                  <button type="button" aria-label={`Remove ${r}`} onClick={() => patchEmail({ recipients: cfg.email.recipients.filter((x) => x !== r) })} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-sage-300"><X size={12} /></button>
                </li>
              ))}
              {cfg.email.recipients.length === 0 && <li className="text-xs text-ink-500">No recipients yet.</li>}
            </ul>
            <div className="mt-2 flex gap-2">
              <input type="email" inputMode="email" aria-label="Add a recipient email" value={draftEmail} onChange={(e) => { setDraftEmail(e.target.value); setEmailError(""); }} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())} placeholder="kitchen@example.com" className="h-11 flex-1 rounded-xl border border-cream-300 bg-cream-50 px-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200" />
              <button type="button" onClick={addRecipient} className={`${btnPrimary} !px-4`}>Add</button>
            </div>
            {emailError && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{emailError}</p>}
          </div>

          <div className="divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-100 px-4">
            <SwitchRow title="A paid order comes in" hint="The main one." checked={cfg.events.orderPaid} onChange={(v) => patchEvents({ orderPaid: v })} />
            <SwitchRow title="A WhatsApp invoice is created" hint="Heads-up before payment." checked={cfg.events.invoiceCreated} onChange={(v) => patchEvents({ invoiceCreated: v })} />
            <SwitchRow title="A payment doesn't match" hint="Wrong amount or currency, so it needs a look." checked={cfg.events.paymentMismatch} onChange={(v) => patchEvents({ paymentMismatch: v })} />
            <SwitchRow title="Daily summary at closing time" hint="Planned." checked={false} onChange={() => {}} disabled />
            <SwitchRow title="Also alert for test payments" hint="Off keeps rehearsals from waking the kitchen." checked={cfg.alertOnTest} onChange={(v) => patch({ alertOnTest: v })} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={!dirty || busy !== ""} className={btnPrimary}>{busy === "save" ? "Saving…" : "Save alerts"}</button>
            <button type="button" onClick={test} disabled={busy !== ""} className={btnGhost}><Send size={15} /> {busy === "test" ? "Rendering…" : "Send test alert"}</button>
          </div>
          {notice && <p role="status" className="text-xs font-semibold text-leaf-700">{notice}</p>}

          <div className="space-y-2">
            <PlannedChannel icon={WhatsAppIcon} name="WhatsApp alert" text="A message to the kitchen's WhatsApp for every paid order." />
            <PlannedChannel icon={MessageSquare} name="SMS alert" text="A text for kitchens without data." />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">Recent alerts</h3>
            {(state.alerts ?? []).length === 0 ? <p className="text-sm text-ink-500">Nothing yet. Send a test alert to see one here.</p> : (
              <ul className="space-y-2">
                {state.alerts.slice(0, 8).map((a) => (
                  <li key={a.id} className="rounded-xl border border-cream-300 bg-cream-50 p-2.5">
                    <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{a.orderCode} <span className="text-xs font-normal text-ink-500">· {a.type === "test" ? "test" : "paid order"}</span></p><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge></div>
                    <p className="truncate text-xs text-ink-500">{a.subject}</p>
                    <p className="text-[11px] text-ink-400">{formatLagosDateTime(a.at).full}{a.reason ? ` · ${a.reason}` : ""}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {preview && <AlertPreview result={preview} onClose={() => setPreview(null)} />}
    </Section>
  );
}
