import FoodImage from "../ui/FoodImage.jsx";
import { SITE } from "../../config/site.js";
import { useCarousel } from "../../hooks/useCarousel.js";
import { formatPrice } from "../../lib/format.js";

/** Swipeable hero: deep-green cards, cream text, orange price chip. Each slide opens the product sheet. */
export default function HeroCarousel({ items, iconByCategory, onOpenProduct }) {
  const { trackRef, index, selectSlide, onScroll, markInteraction } = useCarousel(items.length);
  if (items.length === 0) return null;

  return (
    <section className="pt-3" aria-roledescription="carousel" aria-label="Featured dishes">
      <div className="px-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sun-700">{SITE.greeting}</p>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={markInteraction}
        onWheel={markInteraction}
        className="scrollbar-hide flex h-[15svh] max-h-[170px] min-h-[120px] snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-2"
      >
        {items.map((item, i) => (
          <article
            key={item.id}
            data-slide
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="relative h-full w-[64%] flex-shrink-0 snap-center overflow-hidden rounded-2xl bg-gradient-to-br from-leaf-700 to-leaf-900 shadow-card"
          >
            <button
              type="button"
              onClick={() => onOpenProduct(item.id)}
              aria-label={`View ${item.name}, ${formatPrice(item.price)}`}
              className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-offset-[-3px]"
            />
            <div className="flex h-full items-stretch gap-3 p-2">
              <div className="h-full w-[38%] flex-shrink-0 overflow-hidden rounded-xl">
                <FoodImage src={item.image} alt={item.name} variant={item.imageStyle} icon={iconByCategory[item.category]} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 text-cream-50">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-[13px] font-extrabold leading-tight tracking-tight">{item.name}</h2>
                  <p className="mt-1 line-clamp-2 break-words text-[10px] leading-tight text-leaf-100">{item.description}</p>
                </div>
                <span className="w-fit rounded-full bg-sun-500 px-2.5 py-0.5 text-xs font-extrabold text-leaf-950">{formatPrice(item.price)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-2">
          {items.map((item, i) => (
            <button key={item.id} type="button" onClick={() => selectSlide(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index} className="flex h-5 items-center">
              <span className={`block h-2 rounded-full transition-all ${i === index ? "w-6 bg-leaf-700" : "w-2 bg-cream-400"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
