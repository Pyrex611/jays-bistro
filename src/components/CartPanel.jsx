import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatPrice, generateWhatsAppLink } from '../utils/helpers.js';

const CartPanel = ({ cart, isCartOpen, setIsCartOpen, updateQuantity, cartTotal, WHATSAPP_NUMBER }) => {
    return (
        <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
             <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
             
             <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[var(--color-bg-secondary)] shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)]">
                    <h2 className="font-serif text-2xl text-[var(--color-text)]">Your Tray</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors"><X className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                            <ShoppingBag size={56} strokeWidth={1} className="mb-6 opacity-50" />
                            <p className="font-serif text-lg text-[var(--color-text)]">Your tray is empty.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)] shadow-sm">
                                 <ImageWithFallback src={item.image} className="w-20 h-20 object-cover bg-[var(--color-border)] rounded-lg" alt={item.name} />
                                 <div className="flex-1">
                                    <h4 className="font-serif text-base text-[var(--color-text)] leading-tight mb-1">{item.name}</h4>
                                    <p className="text-accent text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                                 </div>
                                 
                                 <div className="flex flex-col gap-2 items-end">
                                    <div className="flex items-center border border-[var(--color-border)] rounded-md overflow-hidden bg-[var(--color-bg-secondary)] shadow-sm">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-[var(--color-border)] transition-colors"><Minus size={14} className="text-[var(--color-text)]"/></button>
                                        <span className="w-8 text-center text-sm font-bold text-[var(--color-text)]">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-[var(--color-border)] transition-colors"><Plus size={14} className="text-[var(--color-text)]"/></button>
                                    </div>
                                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-medium"><X size={12}/> Remove</button>
                                 </div>
                            </div>
                        ))
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div className="p-6 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between mb-6 text-lg font-bold text-[var(--color-text)]">
                            <span className="font-serif">Total Order</span>
                            <span className="text-accent text-2xl">{formatPrice(cartTotal)}</span>
                        </div>
                        <a href={generateWhatsAppLink(cart, WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#25D366] text-white text-center py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-[#128C7E] transition-colors">
                            Checkout on WhatsApp
                        </a>
                    </div>
                )}
             </div>
        </div>
    );
};

export default CartPanel;