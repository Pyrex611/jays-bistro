import { useState } from "react";
import { AlertCircle, ShoppingBag, X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import CheckoutForm from "./CheckoutForm.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { formatPrice } from "../../lib/format.js";

/**
 * The tray. Step 1 = review items. Step 2 = details + pay.
 * Footer: [round WhatsApp button] [Checkout]  — Checkout pays online with Paystack; the round button sends the order on WhatsApp.
 */
export default function CartDrawer({ open, onClose, lines, subtotal, settings, unavailable, iconByCategory, checkout, onIncrement, onDecrement, onRemove }) {
  const [step, setStep] = useState("tray");
  const close = () => {
    setStep("tray");
    checkout.reset();
    onClose();
  };
  useBodyScrollLock(open);
  useEscapeKey(open, close);

  const paused = !settings.acceptingOrders;
  const belowMin = subtotal < settings.minOrder;
  const blocked = paused || unavailable.length > 0 || belowMin;
  const warning = paused
    ? "We're not taking orders right now."
    : unavailable.length
      ? `Sold out today: ${unavailable.map((l) => l.item.name).join(", ")}. Remove to continue.`
      : belowMin
        ? `Minimum order is ${formatPrice(settings.minOrder)}. Add ${formatPrice(settings.minOrder - subtotal)} more.`
        : "";

  return (
    <div className={`fixed inset-0 z-50 transition-[opacity,visibility] duration-300 ${open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`} aria-hidden={!open}>
      <div className="absolute inset-0 bg-leaf-950/50" onClick={close} />

      <div className="relative mx-auto flex h-full max-w-md justify-end">
        <aside role="dialog" aria-modal="true" aria-label="Your tray" className={`flex h-full w-[92%] flex-col bg-cream-50 shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-cream-300 p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <h2 className="font-display text-lg font-extrabold text-leaf-800">{step === "tray" ? "Your tray" : "Checkout"}</h2>
            <button type="button" onClick={close} aria-label="Close tray" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-cream-200"><X size={20} /></button>
          </div>

          {step === "details" && lines.length > 0 ? (
            <CheckoutForm lines={lines} settings={settings} busy={checkout.busy} error={checkout.error} fieldErrors={checkout.fieldErrors} onBack={() => setStep("tray")} onSubmit={checkout.payOnline} />
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {lines.length === 0 ? (
                  <div className="mt-16 flex flex-col items-center text-center text-ink-500">
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 text-leaf-700"><ShoppingBag size={28} /></div>
                    <p className="font-bold text-ink-800">Your tray is empty</p>
                    <p className="mt-1 text-xs">Add a few dishes and they&apos;ll wait for you here.</p>
                    <button type="button" onClick={close} className="mt-4 rounded-full bg-leaf-700 px-5 py-2.5 text-sm font-bold text-white">Explore the menu</button>
                  </div>
                ) : (
                  lines.map(({ item, quantity, lineTotal }) => {
                    const soldOut = item.isAvailable === false;
                    return (
                      <article key={item.id} className={`flex items-center gap-3 rounded-2xl border bg-cream-100 p-2.5 ${soldOut ? "border-sun-300" : "border-cream-300"}`}>
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-leaf-800">
                          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={iconByCategory[item.category]} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-1.5" : ""}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{item.name}</p>
                          <p className="text-xs font-semibold text-leaf-700">{soldOut ? "Sold out today" : formatPrice(lineTotal)}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <QuantityStepper quantity={quantity} label={item.name} size={14} disableIncrement={soldOut} onDecrement={() => onDecrement(item.id)} onIncrement={() => onIncrement(item.id)} />
                            <button type="button" onClick={() => onRemove(item.id)} className="py-2 text-xs font-semibold text-red-600 hover:text-red-700">Remove</button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {lines.length > 0 && (
                <div className="border-t border-cream-300 bg-cream-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <div className="mb-3 flex justify-between text-base font-extrabold"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {(warning || checkout.error) && (
                    <p role="alert" className="mb-3 flex items-start gap-1.5 rounded-lg bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-900"><AlertCircle size={14} className="mt-px flex-shrink-0" />{warning || checkout.error}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => checkout.shareOnWhatsApp({ fulfilment: "pickup" })}
                      disabled={blocked || checkout.busy !== null}
                      aria-label="Order on WhatsApp"
                      title="Order on WhatsApp"
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition hover:brightness-95 active:scale-95 disabled:opacity-50"
                    >
                      {checkout.busy === "whatsapp" ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <WhatsAppIcon size={26} />}
                    </button>
                    <button type="button" onClick={() => { checkout.reset(); setStep("details"); }} disabled={blocked} className="h-14 flex-1 rounded-full bg-leaf-700 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-leaf-800 active:scale-[0.99] disabled:opacity-50">
                      Checkout
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-ink-500">Checkout pays securely with Paystack · the green button sends your order on WhatsApp</p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
