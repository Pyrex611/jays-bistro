import { ShoppingBag, X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { formatPrice } from "../../lib/format.js";

/** Slide-in tray. Stays mounted so open/close can animate; hidden from AT and focus when closed. */
export default function CartDrawer({ open, onClose, lines, total, checkoutHref, onIncrement, onDecrement, onRemove, onCheckout }) {
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);

  return (
    <div
      className={`fixed inset-0 z-50 transition-[opacity,visibility] duration-300 ${open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative mx-auto flex h-full max-w-md justify-end">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Your tray"
          className={`flex h-full w-[88%] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-ink-200 p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <h2 className="font-display text-lg font-extrabold">Your Tray</h2>
            <button type="button" onClick={onClose} aria-label="Close tray" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-ink-100">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {lines.length === 0 ? (
              <div className="mt-16 flex flex-col items-center text-center text-ink-400">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-ink-100">
                  <ShoppingBag size={28} />
                </div>
                <p className="font-bold text-ink-700">Your tray is empty</p>
                <button type="button" onClick={onClose} className="mt-4 text-sm font-bold text-ink-900 underline underline-offset-4">
                  Explore the menu
                </button>
              </div>
            ) : (
              lines.map(({ item, quantity, lineTotal }) => (
                <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50 p-2.5">
                  <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ${item.imageStyle === "cutout" ? "bg-ink-700" : "bg-ink-100"}`}>
                    <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-1.5" : ""}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-ink-500">{formatPrice(lineTotal)}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <QuantityStepper quantity={quantity} label={item.name} size={14} onDecrement={() => onDecrement(item.id)} onIncrement={() => onIncrement(item.id)} />
                      <button type="button" onClick={() => onRemove(item.id)} className="text-xs font-medium text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-ink-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="mb-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <a
                href={checkoutHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onCheckout}
                className="block w-full rounded-full bg-ink-800 py-3 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-ink-700"
              >
                Checkout on WhatsApp
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
