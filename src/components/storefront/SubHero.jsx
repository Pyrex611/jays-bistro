import FoodImage from "../ui/FoodImage.jsx";
import { formatPrice } from "../../lib/format.js";

const OVERLAY = "absolute inset-0 z-10 rounded-2xl focus-visible:outline-offset-[-3px]";

/** Left card: soft apricot, horizontal (the logo's sun, softened). Dark brown text. */
function HorizontalCard({ item, icon, onOpenProduct }) {
  return (
    <article className="surface-apricot relative h-full w-full overflow-hidden rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full items-stretch gap-2 p-1.5">
        <div className="h-full w-[45%] flex-shrink-0 overflow-hidden rounded-lg bg-white/30">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className="h-full w-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 text-sun-900">
          <div className="min-w-0">
            <h3 className="break-words font-display text-[12px] font-extrabold leading-tight tracking-tight">{item.name}</h3>
            <p className="mt-0.5 line-clamp-2 break-words text-[10px] leading-tight">{item.description}</p>
          </div>
          <p className="text-xs font-extrabold">{formatPrice(item.price)}</p>
        </div>
      </div>
    </article>
  );
}

/** Right card: soft sage, vertical (the logo's leaf, cloudier). */
function VerticalCard({ item, icon, onOpenProduct }) {
  return (
    <article className="surface-sage relative h-full w-full overflow-hidden rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
      <button type="button" onClick={() => onOpenProduct(item.id)} aria-label={`View ${item.name}, ${formatPrice(item.price)}`} className={OVERLAY} />
      <div className="flex h-full flex-col gap-1 p-1.5">
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-lg">
          <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={icon} className="h-full w-full" />
        </div>
        <div className="flex-shrink-0 px-0.5 pb-0.5 text-leaf-950">
          <h3 className="break-words font-display text-[12px] font-extrabold leading-tight tracking-tight text-leaf-900">{item.name}</h3>
          <p className="text-xs font-extrabold">{formatPrice(item.price)}</p>
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
    <section className="mt-2 px-4" aria-label="More from the kitchen">
      <div className={`grid h-[13svh] max-h-[150px] min-h-[112px] gap-3 ${right ? "grid-cols-2" : "grid-cols-1"}`}>
        <HorizontalCard item={left} icon={iconByCategory[left.category]} onOpenProduct={onOpenProduct} />
        {right && <VerticalCard item={right} icon={iconByCategory[right.category]} onOpenProduct={onOpenProduct} />}
      </div>
    </section>
  );
}
