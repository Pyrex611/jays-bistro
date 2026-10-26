import FoodImage from "../ui/FoodImage.jsx";
import { formatPrice } from "../../lib/format.js";

const OVERLAY = "absolute inset-0 z-10 rounded-2xl focus-visible:outline-offset-[-3px]";

/** Left card: orange, horizontal (echoes the logo's sun). */
function HorizontalCard({ item, icon, onOpenProduct }) {
  return (
    <article className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sun-400 to-sun-500 shadow-card transition-shadow hover:shadow-card-hover">
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full items-stretch gap-2 p-1.5">
        <div className="h-full w-[45%] flex-shrink-0 overflow-hidden rounded-lg bg-leaf-800/10">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className="h-full w-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 text-leaf-950">
          <div className="min-w-0">
            <h3 className="break-words font-display text-[12px] font-extrabold leading-tight tracking-tight">{item.name}</h3>
            <p className="mt-0.5 line-clamp-2 break-words text-[10px] leading-tight text-leaf-900/80">{item.description}</p>
          </div>
          <p className="text-xs font-extrabold">{formatPrice(item.price)}</p>
        </div>
      </div>
    </article>
  );
}

/** Right card: green, vertical (echoes the logo's leaf). */
function VerticalCard({ item, icon, onOpenProduct }) {
  return (
    <article className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-leaf-600 to-leaf-800 shadow-card transition-shadow hover:shadow-card-hover">
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full flex-col gap-1.5 p-1.5">
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-lg">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className="h-full w-full" />
        </div>
        <div className="flex-shrink-0 px-0.5 pb-0.5 text-cream-50">
          <h3 className="break-words font-display text-[12px] font-extrabold leading-tight tracking-tight">{item.name}</h3>
          <p className="mt-0.5 text-xs font-extrabold text-sun-300">{formatPrice(item.price)}</p>
        </div>
      </div>
    </article>
  );
}

/** The two cards under the hero: left = horizontal, right = vertical. */
export default function SubHero({ items, iconByCategory, onOpenProduct }) {
  if (items.length === 0) return null;
  const [left, right] = items;

  return (
    <section className="mt-3 px-4" aria-label="More from the kitchen">
      <div className={`grid h-[15svh] max-h-[170px] min-h-[120px] gap-3 ${right ? "grid-cols-2" : "grid-cols-1"}`}>
        <HorizontalCard item={left} icon={iconByCategory[left.category]} onOpenProduct={onOpenProduct} />
        {right && <VerticalCard item={right} icon={iconByCategory[right.category]} onOpenProduct={onOpenProduct} />}
      </div>
    </section>
  );
}
