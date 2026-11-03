import { useEffect, useRef, useState } from "react";
import { Check, Share2, X } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { formatPrice, getDishUrl } from "../../lib/format.js";
import { SITE } from "../../config/site.js";

/** Product detail sheet. Rendered only while an item is selected. */
export default function ProductModal({ item, icon, quantity, onClose, onAdd, onDecrement }) {
  const closeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useBodyScrollLock(Boolean(item));
  useEscapeKey(Boolean(item), onClose);

  useEffect(() => {
    if (item) closeRef.current?.focus();
    setCopied(false);
  }, [item]);

  if (!item) return null;
  const soldOut = item.isAvailable === false;
  const dishUrl = getDishUrl(item.id);

  const handleShare = async () => {
    const data = {
      title: `${item.name} · ${SITE.name}`,
      text: `Check out ${item.name} (${formatPrice(item.price)}) at ${SITE.name}!`,
      url: dishUrl,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(dishUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = dishUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* user dismissed share dialog */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-leaf-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md animate-slide-up overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:rounded-3xl">
        <div className="surface-sage-tile relative h-60">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-6" : ""} ${soldOut ? "opacity-50 grayscale" : ""}`} />
          
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label={`Share link for ${item.name}`}
              title="Share link"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/90 text-leaf-800 shadow-sm transition hover:bg-cream-50 hover:scale-105 active:scale-95"
            >
              {copied ? <Check size={18} className="text-leaf-700" /> : <Share2 size={18} />}
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/90 text-ink-700 shadow-sm transition hover:bg-cream-50 hover:scale-105 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {copied && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-leaf-950/90 px-3 py-1 text-xs font-bold text-cream-50 shadow-md">
              Link copied!
            </div>
          )}
        </div>

        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sun-700">{item.category}</p>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-xs font-bold text-leaf-700 hover:text-leaf-800"
            >
              <Share2 size={13} /> {copied ? "Link copied!" : "Share link"}
            </button>
          </div>

          <h3 id="product-modal-title" className="mt-1 font-display text-2xl font-extrabold text-leaf-800">{item.name}</h3>
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