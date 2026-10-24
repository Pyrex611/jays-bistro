import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';

const CAROUSEL_INTERVAL_MS = 6000;

const HeroCarousel = () => {
  const { heroProducts, setSelectedProductId } = useStore();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef(null);
  const isInteractingRef = useRef(false);

  // Auto-scroll Timer
  useEffect(() => {
    if (!heroProducts || heroProducts.length === 0) return;

    const interval = setInterval(() => {
      if (isInteractingRef.current) return;
      const nextIndex = (carouselIndex + 1) % heroProducts.length;
      scrollToSlide(nextIndex);
    }, CAROUSEL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [carouselIndex, heroProducts.length]);

  const scrollToSlide = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll('[data-slide]');
    if (!slides[index]) return;

    const slide = slides[index];
    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setCarouselIndex(index);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.querySelectorAll('[data-slide]')];
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;
    slides.forEach((s, i) => {
      const cardCenter = s.offsetLeft + s.offsetWidth / 2;
      const d = Math.abs(cardCenter - trackCenter);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });

    if (closest !== carouselIndex) {
      setCarouselIndex(closest);
    }
  };

  if (!heroProducts || heroProducts.length === 0) return null;

  return (
    <section className="pt-3">
      <div className="px-4 pb-1 flex justify-between items-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">
          Welcome, Foodie.
        </p>
        <span className="text-[10px] font-bold text-caramel-600 bg-caramel-100 px-2 py-0.5 rounded-full">
          Featured Specials
        </span>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        onTouchStart={() => { isInteractingRef.current = true; }}
        onTouchEnd={() => { setTimeout(() => { isInteractingRef.current = false; }, 2000); }}
        onMouseEnter={() => { isInteractingRef.current = true; }}
        onMouseLeave={() => { isInteractingRef.current = false; }}
        className="flex h-[13.5vh] min-h-[112px] max-h-[165px] overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4 py-2"
        style={{ scrollPaddingLeft: '1rem' }}
      >
        {heroProducts.map((p) => (
          <div
            key={p.id}
            data-slide
            onClick={() => setSelectedProductId(p.id)}
            className="relative flex-shrink-0 w-[59%] h-full snap-center cursor-pointer rounded-2xl overflow-hidden
                       bg-gradient-to-br from-caramel-300 to-caramel-500
                       card-shadow card-shadow-hover transition-all duration-300"
          >
            <div className="flex items-stretch h-full p-2 gap-2.5">
              <div className="h-full w-[36%] flex-shrink-0 rounded-lg overflow-hidden bg-black/10">
                <FoodImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="min-w-0">
                  <h2 className="text-xs font-black uppercase tracking-tight text-caramel-900 leading-tight truncate">
                    {p.name}
                  </h2>
                  <p className="text-[9.5px] text-caramel-900/80 leading-tight line-clamp-2 mt-0.5 font-medium">
                    {p.tagline || p.description}
                  </p>
                </div>
                <p className="text-sm font-black text-caramel-950">
                  ₦{p.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 mt-1">
        {heroProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === carouselIndex ? "bg-stone-900 w-5" : "bg-stone-300 w-2 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;