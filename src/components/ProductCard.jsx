import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity, setSelectedProductId } = useStore();
  const cartItem = cart.find(i => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="flex flex-col">
      {/* Product Image Stage */}
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

        {qty > 0 && (
          <span className="absolute top-2 right-2 bg-bistro-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse-subtle">
            {qty}
          </span>
        )}
      </div>

      {/* Info & Expandable Stepper */}
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

        {/* Dynamic Expandable Quantity Stepper */}
        {qty === 0 ? (
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
                       transition-all duration-200"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 flex items-center bg-stone-900 text-white rounded-full px-2 py-1 gap-1.5 shadow-md border border-stone-800 transition-all duration-200"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, -1);
              }}
              aria-label="Decrease quantity"
              className="p-0.5 hover:text-caramel-400 active:scale-90 transition text-stone-300"
            >
              <Minus size={11} strokeWidth={3} />
            </button>
            
            <span className="text-xs font-black min-w-[14px] text-center select-none">
              {qty}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, 1);
              }}
              aria-label="Increase quantity"
              className="p-0.5 hover:text-caramel-400 active:scale-90 transition text-stone-300"
            >
              <Plus size={11} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;