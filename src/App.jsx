import React from 'react';
import { StoreProvider } from './context/StoreContext.jsx';
import Header from './components/Header.jsx';
import HeroCarousel from './components/HeroCarousel.jsx';
import DualSpotlight from './components/DualSpotlight.jsx';
import CategoryPills from './components/CategoryPills.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import NotificationsModal from './components/NotificationsModal.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import { Instagram, Facebook, Twitter, MessageCircle, MapPin, Phone } from 'lucide-react';

const Storefront = () => {
  return (
    <div className="mx-auto max-w-md bg-stone-50 min-h-screen border-x border-stone-300 frame-shadow flex flex-col relative pb-16">
      
      {/* 1. TOP NAVBAR */}
      <Header />

      {/* 2. HERO CAROUSEL (Defaults: Shawarma, Wings, Basmati, Jollof, Isi-Ewu) */}
      <HeroCarousel />

      {/* 3. SUB-HERO DUAL SPOTLIGHT (Defaults: Arabian Blend Left, Double Root Right) */}
      <DualSpotlight />

      {/* 4. CATEGORY PILLS + SEARCH + BODY GRID */}
      <section className="px-4 pb-12 flex-1">
        <CategoryPills />
        <div className="mt-4">
          <ProductGrid />
        </div>
      </section>

      {/* 5. FOOTER WITH CLICKABLE SOCIALS & BRANDING */}
      <footer className="px-4 py-8 border-t border-stone-200 bg-stone-100 text-center mt-auto space-y-4">
        
        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-caramel-600 hover:border-caramel-400 flex items-center justify-center transition shadow-sm"
          >
            <Instagram size={15} />
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-bistro-700 hover:border-bistro-400 flex items-center justify-center transition shadow-sm"
          >
            <Facebook size={15} />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter / X"
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:border-stone-400 flex items-center justify-center transition shadow-sm"
          >
            <Twitter size={15} />
          </a>

          <a
            href="https://wa.me/2348062624447"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Hotline"
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-green-600 hover:border-green-400 flex items-center justify-center transition shadow-sm"
          >
            <MessageCircle size={15} />
          </a>
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-800 tracking-wider uppercase">
            Jay's Bistro • Makurdi
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            Precious Events Centre, Makurdi, Benue State
          </p>
          <p className="text-[9px] text-stone-400 mt-1">
            © {new Date().getFullYear()} Jay's Bistro. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 6. OVERLAYS, MODALS & REINSTATED FLOATING AI CONCIERGE */}
      <ProductModal />
      <CartDrawer />
      <NotificationsModal />
      <AIChatbot />
      <AdminDashboard />

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Storefront />
    </StoreProvider>
  );
}