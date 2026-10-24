import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';
import { Plus } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { cart, addToCart, setSelectedProductId } = useStore();
  const cartItem = cart.find(i => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="flex flex-col">
      {/* Visual Container in Pearl Dark Tone */}
      <div
        onClick={() => setSelectedProductId(product.id)}
        className="pearl-card pearl-card-hover card-shadow card-shadow-hover
                   relative cursor-pointer aspect-[4/3] rounded-2xl overflow-hidden
                   bg-pearl-700 flex items-center justify-center group"
      >
        <FoodImage
          src={product.image}
          alt={product.name}
          className="relative w-full h-full object-contain p-2 rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.32))" }}
        />

        {/* Quantity Indicator */}
        {qty > 0 && (
          <span className="absolute top-2 right-2 bg-caramel-400 text-caramel-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse-subtle">
            {qty}
          </span>
        )}
      </div>

      {/* Info & Action Stepper */}
      <div className="flex items-center justify-between mt-2 px-0.5 gap-2">
        <div 
          onClick={() => setSelectedProductId(product.id)}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <h3 className="text-[11px] font-bold text-stone-900 leading-tight truncate">
            {product.name}
          </h3>
          <p className="text-[10px] text-stone-500 font-semibold leading-tight mt-0.5">
            ₦{product.price.toLocaleString()}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product.id);
          }}
          aria-label={`Add ${product.name} to tray`}
          className="flex-shrink-0 w-7 h-7 rounded-full
                     bg-caramel-500 text-white
                     hover:bg-caramel-600 active:scale-90
                     flex items-center justify-center
                     shadow-[0_4px_10px_-2px_rgba(120,72,40,0.5)]
                     transition"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;