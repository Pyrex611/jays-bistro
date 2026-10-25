import { ShoppingBag } from "lucide-react";
import { SITE, assetUrl } from "../../config/site.js";

export default function Header({ cartCount, cartBump, onOpenCart }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={assetUrl(SITE.logoPath)}
            alt={`${SITE.name} logo`}
            width="36"
            height="36"
            className="h-9 w-9 flex-shrink-0 rounded-full border border-ink-200 bg-white object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/100x100/1A1A1A/FFFFFF?text=JB";
            }}
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-base font-extrabold tracking-tight">{SITE.name}</p>
            <p className="text-[11px] text-ink-400">{SITE.locationLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCart}
          aria-label={cartCount > 0 ? `Open tray, ${cartCount} items` : "Open tray"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white transition hover:bg-ink-50"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span
              key={cartBump}
              className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] animate-pop items-center justify-center rounded-full bg-ink-800 px-1 text-[11px] font-bold text-white ring-2 ring-white"
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
