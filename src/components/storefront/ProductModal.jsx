import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { formatPrice } from "../../lib/format.js";

/** Product detail sheet. Rendered only while an item is selected. */
export default function ProductModal({ item, quantity, onClose, onAdd, onDecrement }) {
  const closeRef = useRef(null);
  useBodyScrollLock(Boolean(item));
  useEscapeKey(Boolean(item), onClose);

  useEffect(() => {
    if (item) closeRef.current?.focus();
  }, [item]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={`relative h-56 ${item.imageStyle === "cutout" ? "bg-ink-700" : "bg-ink-100"}`}>
          <FoodImage
            src={item.image}
            alt={item.name}
            variant={item.imageStyle}
            className={`h-full w-full ${item.imageStyle === "cutout" ? "p-6" : ""}`}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 transition hover:bg-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">{item.category}</p>
          <h3 id="product-modal-title" className="font-display text-2xl font-extrabold">{item.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
          <p className="mt-4 text-xl font-bold">{formatPrice(item.price)}</p>

          <div className="mt-6">
            {quantity > 0 ? (
              <QuantityStepper
                quantity={quantity}
                label={item.name}
                onDecrement={() => onDecrement(item.id)}
                onIncrement={() => onAdd(item)}
              />
            ) : (
              <button
                type="button"
                onClick={() => onAdd(item)}
                className="w-full rounded-full bg-ink-800 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-ink-700"
              >
                Add to Tray
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
