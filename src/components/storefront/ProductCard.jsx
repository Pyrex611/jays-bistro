import { Plus } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { formatPrice } from "../../lib/format.js";

/** Grid card: dark green tile with the dish "floating" on it, name + price + quick-add underneath. */
export default function ProductCard({ item, icon, quantity, onOpen, onAdd, disabled = false }) {
  const soldOut = item.isAvailable === false;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        aria-label={`View ${item.name}${soldOut ? " (sold out)" : ""}`}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-leaf-800 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-3" : ""} ${soldOut ? "opacity-40 grayscale" : ""}`} />
        {soldOut && (
          <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-cream-50 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">Sold out today</span>
        )}
        {quantity > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-sun-500 px-2 py-0.5 text-[11px] font-black text-leaf-950 shadow-sm">{quantity}</span>
        )}
      </button>

      <div className="mt-2 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[13px] font-bold leading-tight text-ink-900">
            <button type="button" onClick={() => onOpen(item.id)} className="text-left">{item.name}</button>
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-leaf-700">{formatPrice(item.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={soldOut || disabled}
          aria-label={`Add ${item.name} to tray`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sun-500 text-leaf-950 shadow-[0_4px_10px_-2px_rgba(160,83,9,0.55)] transition hover:bg-sun-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-cream-300 disabled:shadow-none"
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
