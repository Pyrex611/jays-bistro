import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = ({ heroSlides, addToCart }) => {
    const scrollContainerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll logic for better engagement
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const nextIndex = (currentIndex + 1) % heroSlides.length;
                setCurrentIndex(nextIndex);
                
                const container = scrollContainerRef.current;
                const scrollWidth = container.clientWidth;
                container.scrollTo({
                    left: scrollWidth * nextIndex,
                    behavior: 'smooth'
                });
            }
        }, 5000); 
        return () => clearInterval(interval);
    }, [currentIndex, heroSlides.length]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const index = Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth);
            setCurrentIndex(index);
        }
    };

    return (
        <section className="relative h-screen w-full bg-[var(--color-bg-secondary)] overflow-hidden">
            {/* The floating central text */}
            <div className="absolute top-[20%] left-0 w-full z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                 <p className="text-accent text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4 shadow-black drop-shadow-md animate-[fadeIn_1s_ease-out]">Welcome to</p>
                 <h2 className="font-handwritten text-7xl md:text-9xl text-white drop-shadow-2xl animate-[fadeIn_1s_ease-out_0.2s_both]">Jay's Bistro</h2>
            </div>
            
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
                {heroSlides.map((slide) => (
                    <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-center">
                        <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute bottom-24 left-0 w-full flex flex-col items-center justify-end pb-12 px-4 text-center z-20">
                            <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight max-w-4xl mx-auto mb-8 drop-shadow-lg">{slide.name}</h1>
                            <button onClick={() => addToCart(slide)} className="flex items-center gap-3 bg-accent text-[#1A1A1A] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-xl rounded-full">
                                Order Now <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-6 w-full flex justify-center gap-2 z-20">
                {heroSlides.map((_, idx) => (
                    <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-accent' : 'w-4 bg-white/50'}`} />
                ))}
            </div>
        </section>
    );
};

export default Hero;