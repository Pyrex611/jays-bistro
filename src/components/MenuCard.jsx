import React from 'react';
import { Plus, Minus } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatPrice } from '../utils/helpers.js';

const AddToCartButton = ({ item, cart, addToCart, updateQuantity }) => {
  const cartItem = cart.find(i => i.id === item.id);
  
  if (cartItem) {
    return (
      <div className="flex items-center justify-between bg-[var(--color-primary-button-bg)] text-[var(--color-primary-button-text)] px-3 py-2 w-full rounded-md shadow-sm border border-[var(--color-primary-button-bg)]">
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="hover:text-accent transition-colors"><Minus size={14} /></button>
        <span className="font-sans font-bold text-sm">{cartItem.quantity}</span>
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="hover:text-accent transition-colors"><Plus size={14} /></button>
      </div>
    );
  }
  
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); addToCart(item); }}
      className="w-full bg-transparent border border-[var(--color-text)] text-[var(--color-text)] py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-all duration-300 active:scale-95"
    >
      Add
    </button>
  );
};

const MenuCard = ({ item, cart, addToCart, updateQuantity }) => (
  <div className="group bg-[var(--color-bg-secondary)] p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-[var(--color-accent)]/30 rounded-xl flex flex-col h-full">
    <div className="relative overflow-hidden aspect-[4/5] mb-4 bg-[var(--color-border)] rounded-lg">
      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
      {item.featured && <div className="absolute top-2 right-2 bg-accent text-white text-[10px] uppercase px-2 py-1 font-bold rounded-sm shadow-md z-10">Featured</div>}
      <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:opacity-0" />
    </div>
    <div className="flex flex-col flex-grow">
      <h3 className="font-serif text-lg text-[var(--color-text)] mb-1">{item.name}</h3>
      <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed mb-4 flex-grow line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
        <span className="text-accent font-serif font-bold text-lg">{formatPrice(item.price)}</span>
        <div className="w-24">
            <AddToCartButton item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
        </div>
      </div>
    </div>
  </div>
);

export default MenuCard;