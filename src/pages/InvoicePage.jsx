import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import Receipt, { NextSteps } from "../components/invoice/Receipt.jsx";
import InvoicePending from "../components/invoice/InvoicePending.jsx";
import SuccessBurst from "../components/invoice/SuccessBurst.jsx";
import WhatsAppIcon from "../components/icons/WhatsAppIcon.jsx";
import { SITE, assetUrl } from "../config/site.js";
import { useMenu } from "../context/MenuContext.js";
import { useInvoice } from "../hooks/useInvoice.js";
import { formatPrice } from "../lib/format.js";

function Notice({ title, children }) {
  return (
    <div className="rounded-3xl bg-cream-50 p-8 text-center shadow-card">
      <img src={assetUrl(SITE.logoPath)} alt="" className="mx-auto h-14 w-14 rounded-full border border-cream-300 object-cover" />
      <h1 className="mt-4 font-display text-xl font-extrabold text-leaf-800">{title}</h1>
      <div className="mt-2 text-sm leading-relaxed text-ink-600">{children}</div>
      <div className="mt-6 flex flex-col gap-2">
        <Link to="/" className="rounded-full bg-leaf-700 py-3 text-sm font-bold text-white">Back to the menu</Link>
        <a href={`https://wa.me/${SITE.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white"><WhatsAppIcon size={18} /> Chat with us</a>
      </div>
    </div>
  );
}

/** /invoice/:id — one URL, three lives: invoice (pending) → receipt (paid) → expired. */
export default function InvoicePage() {
  const { id } = useParams();
  const { settings } = useMenu();
  const state = useInvoice(id);

  return (
    <div className="min-h-svh bg-leaf-800">
      <Helmet>
        <title>{state.phase === "paid" ? "Receipt" : "Invoice"} · {SITE.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-md px-4 pb-10 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <Link to="/" className="no-print mb-4 inline-flex items-center gap-1 text-xs font-bold text-leaf-100 hover:text-white"><ArrowLeft size={14} /> {SITE.name}</Link>

        {state.phase === "loading" && (
          <div className="space-y-3" role="status" aria-label="Loading">
            <div className="skeleton h-24 rounded-3xl" /><div className="skeleton h-64 rounded-3xl" />
          </div>
        )}

        {state.phase === "paid" && (
          <>
            <div className="no-print mb-5 text-center text-cream-50">
              <SuccessBurst />
              <h1 className="mt-2 font-display text-2xl font-extrabold">Payment received</h1>
              <p className="mt-1 text-sm text-leaf-100">Thank you, {state.receipt.customer.name.split(" ")[0]}! {formatPrice(state.receipt.total)} paid.</p>
            </div>
            <Receipt receipt={state.receipt} mode={state.mode} />
            <NextSteps receipt={state.receipt} />
            <Link to="/" className="no-print mt-5 block rounded-full bg-sun-500 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-leaf-950">Back to the menu</Link>
          </>
        )}

        {state.phase === "pending" && <InvoicePending invoice={state.invoice} settings={settings} confirming={state.confirming} gaveUp={state.gaveUp} onRefresh={state.reload} />}

        {state.phase === "expired" && <Notice title="This invoice has expired">Invoices are valid for 24 hours so your prices stay accurate. Pop back to the menu and place a fresh order — it only takes a minute.</Notice>}
        {state.phase === "missing" && <Notice title="We couldn't find that invoice">The link may be mistyped, or the invoice expired and was cleared. You can start a new order any time.</Notice>}
        {state.phase === "error" && <Notice title="Something went wrong">{state.message} <button type="button" onClick={state.reload} className="font-bold underline underline-offset-4">Try again</button></Notice>}
      </div>
    </div>
  );
}
