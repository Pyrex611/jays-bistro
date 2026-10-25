import FoodImage from "../ui/FoodImage.jsx";
import { formatPrice } from "../../lib/format.js";

const CARD =
  "relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sprout-200 to-sprout-400 shadow-card transition-shadow hover:shadow-card-hover";
const OVERLAY =
  "absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink-900";

function HorizontalCard({ item, onOpenProduct }) {
  return (
    <article className={CARD}>
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full items-stretch gap-2 p-1.5">
        <div className="h-full w-[45%] flex-shrink-0 overflow-hidden rounded-md">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} className="h-full w-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="min-w-0">
            <h3 className="break-words font-display text-[11px] font-extrabold uppercase leading-tight tracking-tight text-ink-900">{item.name}</h3>
            <p className="mt-0.5 line-clamp-2 break-words text-[10px] leading-tight text-ink-700">{item.description}</p>
          </div>
          <p className="text-xs font-extrabold text-ink-900">{formatPrice(item.price)}</p>
        </div>
      </div>
    </article>
  );
}

function VerticalCard({ item, onOpenProduct }) {
  return (
    <article className={CARD}>
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full flex-col gap-1.5 p-1.5">
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-md">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} className="h-full w-full" />
        </div>
        <div className="flex-shrink-0">
          <h3 className="break-words font-display text-[11px] font-extrabold uppercase leading-tight tracking-tight text-ink-900">{item.name}</h3>
          <p className="mt-0.5 text-xs font-extrabold text-ink-900">{formatPrice(item.price)}</p>
        </div>
      </div>
    </article>
  );
}

/** The two cards under the hero: left = horizontal, right = vertical. */
export default function SubHero({ items, onOpenProduct }) {
  if (items.length === 0) return null;
  const [left, right] = items;

  return (
    <section className="mt-3 px-4" aria-label="More from the kitchen">
      <div className={`grid h-[13.5svh] max-h-[165px] min-h-[112px] gap-3 ${right ? "grid-cols-2" : "grid-cols-1"}`}>
        <HorizontalCard item={left} onOpenProduct={onOpenProduct} />
        {right && <VerticalCard item={right} onOpenProduct={onOpenProduct} />}
      </div>
    </section>
  );
}
