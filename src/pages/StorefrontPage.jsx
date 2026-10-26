import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header.jsx";
import InfoStrip from "../components/layout/InfoStrip.jsx";
import SeoHead from "../components/layout/SeoHead.jsx";
import HeroCarousel from "../components/storefront/HeroCarousel.jsx";
import SubHero from "../components/storefront/SubHero.jsx";
import SearchBar from "../components/storefront/SearchBar.jsx";
import CategoryPills from "../components/storefront/CategoryPills.jsx";
import MenuSections from "../components/storefront/MenuSections.jsx";
import ProductModal from "../components/storefront/ProductModal.jsx";
import CartBar from "../components/cart/CartBar.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import ChatWidget from "../components/chat/ChatWidget.jsx";
import { SITE } from "../config/site.js";
import { useMenu } from "../context/MenuContext.js";
import { useCart } from "../hooks/useCart.js";
import { useCheckout } from "../hooks/useCheckout.js";
import { searchItems } from "../lib/search.js";
import { track } from "../lib/track.js";

const SEO = {
  home: {
    title: "Jay's Bistro | Order Premium Food & Arabian Tea in Makurdi",
    description: "Order Party Jollof, Isi-ewu, Shawarma and Arabian Tea from Jay's Bistro in Makurdi. Pay securely online or order on WhatsApp.",
    path: "/",
  },
  menu: {
    title: "Jay's Bistro Menu | Explore our Dishes",
    description: "Browse Jay's Bistro menu: Nigerian classics, grills, starters, bites, soups and Arabian Tea. Order online for pickup or delivery in Makurdi.",
    path: "/menu",
  },
};

/** The whole storefront. Search overrides the category view; "All" shows every category as a titled section. */
export default function StorefrontPage({ scrollToMenu = false }) {
  const { activeItems, byId, categories, iconByCategory, hero, subhero, settings } = useMenu();
  const cart = useCart(byId);
  const { add: addToCart } = cart;
  const checkout = useCheckout({ lines: cart.lines, total: cart.subtotal });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (scrollToMenu) document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }, [scrollToMenu]);

  const searching = query.trim().length > 0;
  const results = useMemo(() => (searching ? searchItems(activeItems, query) : []), [activeItems, query, searching]);
  const categoryItems = useMemo(
    () => (selectedCategory === "All" ? activeItems : activeItems.filter((item) => item.category === selectedCategory)),
    [activeItems, selectedCategory],
  );
  const mode = searching ? "search" : selectedCategory === "All" ? "all" : "category";

  const selectedProduct = selectedProductId != null ? byId[selectedProductId] ?? null : null;
  const openProduct = useCallback((id) => {
    setSelectedProductId(id);
    track("product_view", { id });
  }, []);
  const closeProduct = useCallback(() => setSelectedProductId(null), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const addItem = useCallback(
    (item) => {
      addToCart(item.id);
      track("add_to_cart", { id: item.id, price: item.price });
    },
    [addToCart],
  );
  const openCart = () => {
    setCartOpen(true);
    track("cart_open", { count: cart.count });
  };

  const pickCategory = (name) => {
    setQuery("");
    setSelectedCategory(name);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const seo = scrollToMenu ? SEO.menu : SEO.home;

  return (
    <div className="min-h-svh bg-cream-200">
      <SeoHead {...seo} isMenu={scrollToMenu} />

      <div className="mx-auto min-h-svh max-w-md border-x border-cream-300 bg-cream-100 shadow-frame">
        <Header cartCount={cart.count} cartBump={cart.bump} onOpenCart={openCart} />

        <main>
          <InfoStrip settings={settings} />
          <HeroCarousel items={hero} iconByCategory={iconByCategory} onOpenProduct={openProduct} />
          <SubHero items={subhero} iconByCategory={iconByCategory} onOpenProduct={openProduct} />

          <section id="menu" aria-label={`${SITE.name} menu`} className="scroll-mt-16 px-4 pb-32 pt-5">
            <SearchBar value={query} onChange={setQuery} />
            <CategoryPills categories={categories} selected={selectedCategory} onSelect={pickCategory} dimmed={searching} />
            <div className="mt-3">
              <MenuSections
                mode={mode}
                query={query}
                items={mode === "search" ? results : mode === "all" ? activeItems : categoryItems}
                categories={categories}
                iconByCategory={iconByCategory}
                quantities={cart.quantities}
                onOpenProduct={openProduct}
                onAdd={addItem}
                onClearSearch={() => setQuery("")}
              />
            </div>
          </section>
        </main>
      </div>

      <CartBar count={cart.count} total={cart.subtotal} onOpen={openCart} />

      <ProductModal
        item={selectedProduct}
        icon={selectedProduct ? iconByCategory[selectedProduct.category] : undefined}
        quantity={selectedProduct ? cart.quantities[selectedProduct.id] || 0 : 0}
        onClose={closeProduct}
        onAdd={addItem}
        onDecrement={cart.decrement}
      />

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        lines={cart.lines}
        subtotal={cart.subtotal}
        settings={settings}
        unavailable={cart.unavailable}
        iconByCategory={iconByCategory}
        checkout={checkout}
        onIncrement={(id) => cart.add(id)}
        onDecrement={cart.decrement}
        onRemove={cart.removeLine}
      />

      <ChatWidget menuItems={activeItems} byId={byId} cartLines={cart.lines} onApplyActions={cart.applyActions} raised={cart.count > 0} />
    </div>
  );
}
