import { Plus } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { formatPrice } from "../../lib/format.js";

/** Grid card: dark tile with the dish "floating" on it, name + price + quick-add underneath. */
export default function ProductCard({ item, quantity, onOpen, onAdd }) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        aria-label={`View ${item.name}`}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-700 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <FoodImage
          src={item.image}
          alt={item.name}
          variant={item.imageStyle}
          className={`h-full w-full ${item.imageStyle === "cutout" ? "p-3" : ""}`}
        />
        {quantity > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-sprout-200 px-2 py-0.5 text-[11px] font-black text-ink-900 shadow-sm">
            {quantity}
          </span>
        )}
      </button>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-xs font-bold leading-tight text-ink-900">
            <button type="button" onClick={() => onOpen(item.id)} className="text-left">
              {item.name}
            </button>
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-400">{formatPrice(item.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(item)}
          aria-label={`Add ${item.name} to tray`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sprout-300 text-ink-900 shadow-[0_4px_10px_-2px_rgba(52,59,21,0.45)] transition hover:bg-sprout-400 active:scale-95"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
