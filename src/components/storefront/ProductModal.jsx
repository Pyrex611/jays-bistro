import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { formatPrice } from "../../lib/format.js";

/** Product detail sheet. Rendered only while an item is selected. */
export default function ProductModal({ item, icon, quantity, onClose, onAdd, onDecrement }) {
  const closeRef = useRef(null);
  useBodyScrollLock(Boolean(item));
  useEscapeKey(Boolean(item), onClose);

  useEffect(() => {
    if (item) closeRef.current?.focus();
  }, [item]);

  if (!item) return null;
  const soldOut = item.isAvailable === false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-leaf-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md animate-slide-up overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:rounded-3xl">
        <div className="relative h-60 bg-leaf-800">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-6" : ""} ${soldOut ? "opacity-50 grayscale" : ""}`} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/90 transition hover:bg-cream-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-sun-700">{item.category}</p>
          <h3 id="product-modal-title" className="font-display text-2xl font-extrabold text-leaf-800">{item.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.description || "Freshly prepared at Jay's Bistro."}</p>
          <p className="mt-4 text-xl font-extrabold text-leaf-700">{formatPrice(item.price)}</p>

          <div className="mt-5">
            {soldOut ? (
              <p className="rounded-full bg-cream-300 py-3 text-center text-sm font-bold text-ink-700">Sold out today</p>
            ) : quantity > 0 ? (
              <QuantityStepper quantity={quantity} label={item.name} onDecrement={() => onDecrement(item.id)} onIncrement={() => onAdd(item)} />
            ) : (
              <button type="button" onClick={() => onAdd(item)} className="w-full rounded-full bg-leaf-700 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-leaf-800 active:scale-[0.99]">
                Add to tray · {formatPrice(item.price)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
