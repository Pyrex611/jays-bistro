import { ChevronRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "../../lib/format.js";

/** Sticky "view tray" bar (count + running total) — appears once something is in the tray. */
export default function CartBar({ count, total, onOpen }) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto max-w-md px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onOpen}
          className="pointer-events-auto flex h-14 w-full animate-slide-up items-center justify-between rounded-full bg-leaf-700 pl-5 pr-4 text-white shadow-bar transition hover:bg-leaf-800 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <ShoppingBag size={16} />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sun-500 px-1 text-[10px] font-black text-leaf-950">{count}</span>
            </span>
            View tray
          </span>
          <span className="flex items-center gap-1 text-sm font-extrabold">
            {formatPrice(total)}
            <ChevronRight size={18} />
          </span>
        </button>
      </div>
    </div>
  );
}
