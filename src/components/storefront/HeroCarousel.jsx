import { SITE } from "../../config/site.js";
import FoodImage from "../ui/FoodImage.jsx";
import { useCarousel } from "../../hooks/useCarousel.js";
import { formatPrice } from "../../lib/format.js";

/** Swipeable hero under the header. Each slide opens the product sheet. */
export default function HeroCarousel({ items, onOpenProduct }) {
  const { trackRef, index, selectSlide, onScroll, markInteraction } = useCarousel(items.length);
  if (items.length === 0) return null;

  return (
    <section className="pt-3" aria-roledescription="carousel" aria-label="Featured dishes">
      <div className="px-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">{SITE.greeting}</p>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={markInteraction}
        onWheel={markInteraction}
        className="scrollbar-hide flex h-[13.5svh] max-h-[165px] min-h-[112px] snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-2"
      >
        {items.map((item, i) => (
          <article
            key={item.id}
            data-slide
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="relative h-full w-[59%] flex-shrink-0 snap-center overflow-hidden rounded-2xl bg-gradient-to-br from-sprout-200 to-sprout-400 shadow-card"
          >
            <button
              type="button"
              onClick={() => onOpenProduct(item.id)}
              aria-label={`View ${item.name}, ${formatPrice(item.price)}`}
              className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink-900"
            />
            <div className="flex h-full items-stretch gap-3 p-2">
              <div className="h-full w-[38%] flex-shrink-0 overflow-hidden rounded-lg">
                <FoodImage
                  src={item.image}
                  alt={item.name}
                  variant={item.imageStyle}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-xs font-extrabold uppercase leading-tight tracking-tight text-ink-900">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 line-clamp-2 break-words text-[10px] leading-tight text-ink-700">{item.description}</p>
                </div>
                <p className="text-sm font-extrabold text-ink-900">{formatPrice(item.price)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-ink-800" : "w-2 bg-ink-200"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
