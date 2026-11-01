import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';
import { X, Minus, Plus } from 'lucide-react';

const ProductModal = () => {
  const { selectedProductId, setSelectedProductId, products, cart, addToCart, updateQuantity } = useStore();

  if (selectedProductId === null) return null;

  const product = products.find(p => p.id === selectedProductId);
  if (!product) return null;

  const cartItem = cart.find(i => i.id === product.id);

  return (
    <div
      onClick={() => setSelectedProductId(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        {/* Modal Image Header */}
        <div className="relative h-56 bg-stone-900">
          <FoodImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={() => setSelectedProductId(null)}
            aria-label="Close"
            className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white text-stone-800 transition"
          >
            <X size={18} />
          </button>
          <span className="absolute bottom-3 left-4 bg-caramel-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
            {product.category}
          </span>
        </div>

        {/* Modal Details */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-stone-900 leading-tight">
            {product.name}
          </h3>
          {product.tagline && (
            <p className="text-xs text-caramel-700 font-bold mt-1 uppercase tracking-wide">
              {product.tagline}
            </p>
          )}
          <p className="mt-3 text-stone-600 text-sm leading-relaxed">
            {product.description}
          </p>

          <p className="mt-4 text-2xl font-extrabold text-stone-900">
            ₦{product.price.toLocaleString()}
          </p>

          {/* Action Button / Stepper */}
          <div className="mt-6">
            {cartItem ? (
              <div className="flex items-center justify-between bg-stone-100 rounded-full px-4 py-2 border border-stone-200">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="p-2 text-stone-700 hover:text-caramel-700 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="font-extrabold text-lg text-stone-900">{cartItem.quantity} in Tray</span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="p-2 text-stone-700 hover:text-caramel-700 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product.id)}
                className="w-full bg-stone-900 text-white py-3 rounded-full font-bold uppercase tracking-widest hover:bg-caramel-600 transition shadow-lg"
              >
                Add to Tray
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;