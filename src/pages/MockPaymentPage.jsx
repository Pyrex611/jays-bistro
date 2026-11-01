import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Banknote, CreditCard, Hash, Lock, ShieldCheck } from "lucide-react";
import { SITE, assetUrl } from "../config/site.js";
import { demoApi } from "../demo/demoApi.js";
import { formatPrice } from "../lib/format.js";

const METHODS = [
  { key: "card", label: "Card", icon: CreditCard },
  { key: "bank_transfer", label: "Transfer", icon: Banknote },
  { key: "ussd", label: "USSD", icon: Hash },
];
const STEPS = ["Contacting your bank…", "Authorising payment…", "Confirming with the merchant…"];

/**
 * DEMO payment page: stands in for Paystack's hosted page while no Paystack account is connected.
 * Same journey (choose method → pay → processing → receipt), clearly labelled, never takes real money.
 */
export default function MockPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ phase: "loading" });
  const [method, setMethod] = useState("card");
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    demoApi.mockPayment
      .load(id)
      .then((invoice) => !cancelled && setState({ phase: "ready", invoice }))
      .catch((e) => !cancelled && (e.status === 409 ? navigate(`/invoice/${id}`, { replace: true }) : setState({ phase: "error", message: e.message })));
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (state.phase !== "processing") return undefined;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, [state.phase]);

  const pay = async (outcome) => {
    setStep(0);
    setState((s) => ({ ...s, phase: "processing" }));
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const res = await demoApi.mockPayment.complete(id, outcome, method);
      if (res.status === "paid") navigate(`/invoice/${id}`, { replace: true });
      else setState((s) => ({ ...s, phase: "failed" }));
    } catch (e) {
      setState({ phase: "error", message: e.message });
    }
  };

  const invoice = state.invoice;
  const amount = invoice ? invoice.attempts.at(-1)?.total ?? invoice.total : 0;

  return (
    <div className="min-h-svh bg-sage-300 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.55),transparent_60%)] px-4 pb-10 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <Helmet>
        <title>Secure payment (demo) · {SITE.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-leaf-900">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} /> Secure checkout</span>
          <span className="rounded-full bg-sun-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-leaf-950">Demo · no real money</span>
        </div>

        {state.phase === "loading" && <div className="skeleton h-80 rounded-3xl" role="status" aria-label="Loading" />}

        {state.phase === "error" && (
          <div className="rounded-3xl bg-cream-50 p-8 text-center shadow-card">
            <h1 className="font-display text-xl font-extrabold text-leaf-800">We couldn&apos;t open this payment</h1>
            <p className="mt-2 text-sm text-ink-600">{state.message}</p>
            <Link to="/" className="mt-5 inline-block rounded-full bg-leaf-700 px-6 py-3 text-sm font-bold text-white">Back to the menu</Link>
          </div>
        )}

        {(state.phase === "ready" || state.phase === "processing" || state.phase === "failed") && invoice && (
          <div className="relative overflow-hidden rounded-3xl bg-cream-50 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <img src={assetUrl(SITE.logoPath)} alt="" className="h-11 w-11 rounded-full border border-cream-300 object-cover" />
              <div className="leading-tight">
                <p className="font-display text-base font-extrabold text-leaf-800">{SITE.name}</p>
                <p className="text-xs text-ink-500">Order {invoice.code}</p>
              </div>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-ink-500">Amount to pay</p>
            <p className="font-display text-4xl font-black tabular-nums text-leaf-800">{formatPrice(amount)}</p>

            {state.phase === "failed" && (
              <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <p className="font-bold">Payment didn&apos;t go through</p>
                <p className="mt-0.5 text-xs">Nothing was charged. You can try again or pick another method.</p>
              </div>
            )}

            <div role="tablist" aria-label="Payment method" className="mt-5 grid grid-cols-3 rounded-full bg-cream-200 p-0.5 text-xs font-bold">
              {METHODS.map(({ key, label, icon: Icon }) => (
                <button key={key} role="tab" aria-selected={method === key} type="button" onClick={() => setMethod(key)} className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 transition ${method === key ? "bg-leaf-700 text-white" : "text-ink-600"}`}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 text-sm" role="tabpanel">
              {method === "card" && (
                <>
                  {[["Card number", "4242 4242 4242 4242"], ["Expiry", "12 / 30"], ["CVV", "123"]].map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-1 text-xs font-bold text-ink-700">{label}</p>
                      <div className="rounded-xl border border-cream-300 bg-cream-100 px-3.5 py-3 font-mono text-ink-600">{value}</div>
                    </div>
                  ))}
                </>
              )}
              {method === "bank_transfer" && (
                <div className="rounded-xl border border-cream-300 bg-cream-100 p-4">
                  <p className="text-xs font-bold text-ink-700">Transfer exactly {formatPrice(amount)} to</p>
                  <p className="mt-1 font-mono text-lg font-bold text-leaf-800">0123456789</p>
                  <p className="text-xs text-ink-500">Demo Bank · Jay&apos;s Bistro (sample account)</p>
                </div>
              )}
              {method === "ussd" && (
                <div className="rounded-xl border border-cream-300 bg-cream-100 p-4">
                  <p className="text-xs font-bold text-ink-700">Dial this on your phone</p>
                  <p className="mt-1 font-mono text-lg font-bold text-leaf-800">*737*000*{Math.round(amount)}#</p>
                  <p className="text-xs text-ink-500">Sample code for the demo</p>
                </div>
              )}
              <p className="text-[11px] text-ink-500">Demo details are pre-filled. This page stands in for Paystack until the account is connected.</p>
            </div>

            <button type="button" onClick={() => pay("success")} disabled={state.phase === "processing"} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-leaf-700 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-leaf-800 disabled:opacity-60">
              <Lock size={14} /> Pay {formatPrice(amount)}
            </button>
            <div className="mt-3 flex items-center justify-between text-xs">
              <button type="button" onClick={() => pay("failed")} disabled={state.phase === "processing"} className="font-semibold text-ink-500 underline underline-offset-4">Simulate a failed payment</button>
              <Link to={`/invoice/${id}`} className="font-semibold text-ink-500 underline underline-offset-4">Cancel</Link>
            </div>

            {state.phase === "processing" && (
              <div role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cream-50/95 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage-300 border-t-leaf-700" />
                <p className="mt-4 font-display text-base font-extrabold text-leaf-800">Processing payment</p>
                <p className="mt-1 text-sm text-ink-600">{STEPS[step]}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
