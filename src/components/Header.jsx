import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Bell, ShoppingBag, MapPin, SlidersHorizontal } from 'lucide-react';

const Header = () => {
  const { cartCount, setIsCartOpen, setIsNotificationsOpen, setIsAdminOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 transition-all">
      <div className="w-full flex justify-between items-center px-4 py-2.5">
        
        {/* Brand / Logo (BISTRO tag removed cleanly) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-bistro-300 shadow-sm flex items-center justify-center bg-bistro-50 flex-shrink-0">
            <img 
              src="/jsys_logo.jpg" 
              alt="Jay's Bistro" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200";
              }} 
            />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-stone-900 leading-none">
              Jay's Bistro
            </span>
            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-bistro-600 flex-shrink-0" />
              <span>Makurdi, Benue</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Store Management Portal Toggle */}
          <button
            onClick={() => setIsAdminOpen(true)}
            aria-label="Merchant Dashboard"
            title="Open Store Management & Analytics"
            className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-bistro-100 hover:text-bistro-800 transition"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notifications"
            className="relative w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
          >
            <Bell size={16} className="text-stone-700" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-bistro-500 ring-2 ring-white"></span>
          </button>

          {/* Tray Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open tray"
            className="relative w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
          >
            <ShoppingBag size={16} className="text-stone-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-caramel-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm animate-pulse-subtle">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;