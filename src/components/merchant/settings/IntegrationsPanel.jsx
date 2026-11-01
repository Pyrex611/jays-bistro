import { useState } from "react";
import { Plug, RotateCcw } from "lucide-react";
import { Badge, Section } from "../fields.jsx";
import { btnDanger, btnGhost } from "../ui.jsx";
import { integrationStatus } from "../../../lib/integrations.js";
import { api } from "../../../services/api.js";

const DETAILS = {
  storage: {
    demo: "Works now: every console page, publishing, photo upload, orders and analytics, saved in this browser.",
    needs: "Create the Vercel Blob stores (public for photos, private for data). Vercel adds the access token for you.",
  },
  payments: {
    demo: "Works now: full checkout with a demo payment page, invoices that expire, receipts, and WhatsApp invoices.",
    needs: "Add PAYSTACK_SECRET_KEY (an sk_test_ key first), then register the webhook URL in Paystack.",
  },
  email: {
    demo: "Works now: recipients, events, alert log and the exact email preview. Nothing is sent.",
    needs: "A sender account (e.g. Brevo with one verified sender address) and its API key as an environment variable.",
  },
  orderStatus: {
    demo: "Works now: New → Preparing → Ready → Completed from Overview and Orders.",
    needs: "Comes with the storage integration (same orders, one extra field).",
  },
};

const STEPS = [
  "Upgrade the Vercel project to Pro before taking real orders. Vercel restricts the free Hobby plan to non-commercial use.",
  "Storage → Create Blob store: one public (photos) and one private (data). Unlimited stores are allowed.",
  "Set SESSION_SECRET and a starter MERCHANT_BOOTSTRAP_PASSWORD in Vercel → Environment Variables, redeploy, sign in and choose your own password.",
  "Payments: add your Paystack test key, register the webhook (…/api/paystack/webhook), place a test order. Swap to the live key when the business account is approved.",
  "Alerts: connect the email provider, press “Send test alert” in Alerts.",
  "Move jays-bistro.vercel.app to this project, set PUBLIC_BASE_URL, re-register the Paystack webhook, and run a ₦100 order.",
];

/** Honest status of every integration: what already works, and exactly what connecting it needs. */
export default function IntegrationsPanel({ capabilities, demo }) {
  const items = integrationStatus(capabilities, demo);
  const [confirm, setConfirm] = useState(false);

  return (
    <Section id="integrations" icon={Plug} title="Integrations & going live" subtitle="Everything is built; these connect when you approve." badge={<Badge tone={demo ? "demo" : "good"}>{demo ? "Demo mode" : "Live"}</Badge>}>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.key} className="rounded-2xl border border-cream-300 bg-cream-100 p-3">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{i.name}</p><Badge tone={i.tone}>{i.label}</Badge></div>
            {i.state !== "connected" && (
              <dl className="mt-2 space-y-1.5 text-xs">
                <div><dt className="font-bold text-leaf-800">What works today</dt><dd className="text-ink-600">{DETAILS[i.key].demo}</dd></div>
                <div><dt className="font-bold text-sun-800">To connect</dt><dd className="text-ink-600">{DETAILS[i.key].needs}</dd></div>
              </dl>
            )}
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-cream-400 bg-cream-100 p-3"><p className="text-sm font-bold">WhatsApp & SMS alerts</p><Badge tone="soon">Planned</Badge></li>
      </ul>

      <details className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-3">
        <summary className="cursor-pointer text-sm font-bold text-leaf-800">Go-live checklist</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-ink-700">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      </details>

      {demo && (
        <div className="mt-4">
          <button type="button" className={confirm ? btnDanger : btnGhost} onClick={async () => { if (!confirm) return setConfirm(true); await api.merchant.resetDemo(); window.location.reload(); }}>
            <RotateCcw size={15} /> {confirm ? "Tap again to erase demo data" : "Reset demo data"}
          </button>
          <p className="mt-1.5 text-[11px] text-ink-500">Clears this browser&apos;s demo menu edits, orders, alerts and password. The real menu and your customers are not affected.</p>
        </div>
      )}
    </Section>
  );
}
