import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import FoodImage from './FoodImage.jsx';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, generateWhatsAppLink, recordCheckoutEvent } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Container restricted to mobile-frame max-w-md */}
      <div className="relative mx-auto max-w-md h-full flex justify-end pointer-events-none">
        <div className="w-[85%] bg-white h-full shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-caramel-600" />
              <h2 className="font-bold text-lg text-stone-900">Your Tray</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart"
              className="p-1.5 hover:bg-stone-200 rounded-full transition text-stone-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 py-12">
                <ShoppingBag size={48} strokeWidth={1.5} className="mb-3 opacity-40" />
                <p className="font-semibold text-stone-700">Your tray is empty.</p>
                <p className="text-xs text-stone-400 mt-1">Add items from the menu to get started.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0 mr-2.5">
                    <FoodImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs font-semibold text-caramel-700">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded bg-white border border-stone-200 hover:bg-stone-100 transition"
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded bg-white border border-stone-200 hover:bg-stone-100 transition"
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 ml-1 text-stone-400 hover:text-red-500 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-stone-500 font-semibold text-sm">Total</span>
                <span className="text-xl font-extrabold text-stone-900">₦{cartTotal.toLocaleString()}</span>
              </div>
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordCheckoutEvent()}
                className="block w-full text-center bg-stone-900 text-white py-3 rounded-full font-bold uppercase tracking-widest hover:bg-caramel-600 transition shadow-lg text-xs"
              >
                Checkout on WhatsApp
              </a>
              <p className="text-[10px] text-center text-stone-400 mt-2">
                Order will be dispatched directly to Jay's Bistro staff.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;