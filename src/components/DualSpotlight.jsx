import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';

const DualSpotlight = () => {
  const { dualSpotlight, setSelectedProductId } = useStore();
  const { left, right } = dualSpotlight;

  if (!left || !right) return null;

  return (
    <section className="px-4 mt-3">
      <div className="grid grid-cols-2 gap-3 h-[13.5vh] min-h-[112px] max-h-[165px]">
        
        {/* Left Sub-Hero Card (Default: Classic Arabian Blend) */}
        <div
          onClick={() => setSelectedProductId(left.id)}
          className="relative h-full w-full cursor-pointer rounded-2xl overflow-hidden
                     bg-gradient-to-br from-bistro-700 to-bistro-900 text-white
                     card-shadow card-shadow-hover transition-all"
        >
          <div className="flex items-stretch h-full p-2 gap-2">
            <div className="h-full w-[42%] flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
              <FoodImage src={left.image} alt={left.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wider font-bold text-bistro-200">Heritage</span>
                <h3 className="text-[11px] font-black uppercase tracking-tight text-white leading-tight truncate">
                  {left.name}
                </h3>
                <p className="text-[9px] text-bistro-100/80 leading-tight line-clamp-2 mt-0.5">
                  {left.tagline || left.category}
                </p>
              </div>
              <p className="text-xs font-black text-caramel-300">
                ₦{left.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Sub-Hero Card (Default: Double Root 1L) */}
        <div
          onClick={() => setSelectedProductId(right.id)}
          className="relative h-full w-full cursor-pointer rounded-2xl overflow-hidden
                     bg-gradient-to-br from-caramel-400 to-caramel-600 text-white
                     card-shadow card-shadow-hover transition-all"
        >
          <div className="flex flex-col h-full p-1.5 gap-1.5">
            <div className="w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-black/10">
              <FoodImage src={right.image} alt={right.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-shrink-0">
              <h3 className="text-[11px] font-black uppercase tracking-tight text-caramel-950 leading-tight truncate">
                {right.name}
              </h3>
              <div className="flex items-center justify-between mt-0.5 gap-1">
                <p className="text-[9px] text-caramel-900/80 leading-tight truncate">
                  {right.tagline || right.category}
                </p>
                <p className="text-xs font-black text-caramel-950 flex-shrink-0">
                  ₦{right.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DualSpotlight;