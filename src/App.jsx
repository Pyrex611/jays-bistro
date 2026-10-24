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

const Storefront = () => {
  return (
    <div className="mx-auto max-w-md bg-stone-50 min-h-screen border-x border-stone-300 frame-shadow flex flex-col relative pb-20">
      
      {/* 1. NAVBAR */}
      <Header />

      {/* 2. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 3. DUAL SPOTLIGHT HALF-HERO */}
      <DualSpotlight />

      {/* 4. PILLS + SEARCH + BODY GRID */}
      <section className="px-4 pb-12 flex-1">
        <CategoryPills />
        <div className="mt-4">
          <ProductGrid />
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="px-4 py-6 border-t border-stone-200 text-center bg-stone-100 mt-auto">
        <p className="text-[11px] font-bold text-stone-600 tracking-wide">
          JAY'S BISTRO • MAKURDI
        </p>
        <p className="text-[10px] text-stone-400 mt-0.5">
          Handcrafted Jollof, Grills, Arabian Spices & Continental Bites.
        </p>
      </footer>

      {/* 5. OVERLAYS & MODALS */}
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