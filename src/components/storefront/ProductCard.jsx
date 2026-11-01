import { Minus, Plus } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { MAX_QTY_PER_ITEM } from "../../lib/cart.js";
import { formatPrice } from "../../lib/format.js";

/**
 * Add control that lives on the photo's corner (no layout shift): a round "+" that becomes "− 2 +" after the first add.
 * "−" at 1 removes the item and the control returns to "+".
 */
function AddControl({ item, quantity, onAdd, onDecrement }) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => onAdd(item)}
        aria-label={`Add ${item.name} to tray`}
        className="flex h-9 w-9 animate-pop items-center justify-center rounded-full bg-sun-500 text-leaf-950 shadow-[0_4px_10px_-2px_rgba(160,83,9,0.55)] transition hover:bg-sun-400 active:scale-95"
      >
        <Plus size={18} strokeWidth={2.4} />
      </button>
    );
  }
  return (
    <div role="group" aria-label={`${item.name} quantity`} className="flex h-9 animate-pop items-center rounded-full bg-sun-500 text-leaf-950 shadow-[0_4px_10px_-2px_rgba(160,83,9,0.55)]">
      <button type="button" onClick={() => onDecrement(item.id)} aria-label={`Decrease ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sun-400 active:scale-95">
        <Minus size={16} strokeWidth={2.6} />
      </button>
      <span className="min-w-[1.25rem] text-center text-sm font-black tabular-nums" aria-live="polite">{quantity}</span>
      <button type="button" onClick={() => onAdd(item)} disabled={quantity >= MAX_QTY_PER_ITEM} aria-label={`Increase ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sun-400 active:scale-95 disabled:opacity-40">
        <Plus size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}

/** Grid card: soft sage tile with the dish "floating" on it, name + price underneath. */
export default function ProductCard({ item, icon, quantity, onOpen, onAdd, onDecrement, groupStart = false }) {
  const soldOut = item.isAvailable === false;
  return (
    <div
      className="flex scroll-mt-[calc(7.25rem+env(safe-area-inset-top))] flex-col"
      {...(groupStart ? { "data-group-start": item.category } : {})}
    >
      {/* Screen readers still get the category structure even though sighted users see a continuous menu. */}
      {groupStart && <h2 className="sr-only">{item.category}</h2>}
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          aria-label={`View ${item.name}${soldOut ? " (sold out)" : ""}`}
          className="surface-sage-tile relative block aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-3" : ""} ${soldOut ? "opacity-40 grayscale" : ""}`} />
        </button>
        {soldOut ? (
          <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-cream-50 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">Sold out today</span>
        ) : (
          <div className="absolute bottom-2 right-2">
            <AddControl item={item} quantity={quantity} onAdd={onAdd} onDecrement={onDecrement} />
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="break-words text-[13px] font-bold leading-tight text-ink-900">
          <button type="button" onClick={() => onOpen(item.id)} className="text-left">{item.name}</button>
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-leaf-700">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}
