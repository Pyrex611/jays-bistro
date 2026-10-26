import { ShoppingBag } from "lucide-react";
import { SITE, assetUrl } from "../../config/site.js";

export default function Header({ cartCount, cartBump, onOpenCart }) {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-50/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={assetUrl(SITE.logoPath)}
            alt={`${SITE.name} logo`}
            width="38"
            height="38"
            className="h-[38px] w-[38px] flex-shrink-0 rounded-full border border-cream-300 bg-cream-100 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/100x100/286334/FBF8EE?text=JB";
            }}
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-base font-extrabold tracking-tight text-leaf-700">{SITE.name}</p>
            <p className="truncate text-[11px] font-medium text-sun-700">Arabian Tea · {SITE.locationLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCart}
          aria-label={cartCount > 0 ? `Open tray, ${cartCount} items` : "Open tray"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-leaf-700 text-white transition hover:bg-leaf-800 active:scale-95"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span key={cartBump} className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] animate-pop items-center justify-center rounded-full bg-sun-500 px-1 text-[11px] font-black text-leaf-950 ring-2 ring-cream-50">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
