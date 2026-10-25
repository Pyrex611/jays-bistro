import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header.jsx";
import SeoHead from "../components/layout/SeoHead.jsx";
import HeroCarousel from "../components/storefront/HeroCarousel.jsx";
import SubHero from "../components/storefront/SubHero.jsx";
import CategoryPills from "../components/storefront/CategoryPills.jsx";
import ProductGrid from "../components/storefront/ProductGrid.jsx";
import ProductModal from "../components/storefront/ProductModal.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import ChatWidget from "../components/chat/ChatWidget.jsx";
import { SITE } from "../config/site.js";
import { useMenu } from "../context/MenuContext.js";
import { useCart } from "../hooks/useCart.js";
import { buildWhatsAppLink } from "../lib/whatsapp.js";
import { track } from "../lib/track.js";

const SEO = {
  home: {
    title: "Jay's Bistro | Order Premium Food in Makurdi",
    description:
      "Get your favorite dishes delivered fresh. Jay's Bistro offers the best Nigerian and Intercontinental meals in Makurdi, Benue State.",
    path: "/",
  },
  menu: {
    title: "Jay's Bistro Menu | Explore our Dishes",
    description:
      "Browse Jay's Bistro menu. From Party Jollof to Chicken Caesar Salads, order online for delivery or pickup in Makurdi.",
    path: "/menu",
  },
};

/** The whole storefront: hero, sub-hero, category pills and product grid, plus tray and concierge. */
export default function StorefrontPage({ scrollToMenu = false }) {
  const { activeItems, byId, categories, hero, subhero } = useMenu();
  const cart = useCart(byId);
  const { add: addToCart } = cart;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (scrollToMenu) document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }, [scrollToMenu]);

  const visibleItems = useMemo(
    () => (selectedCategory === "All" ? activeItems : activeItems.filter((item) => item.category === selectedCategory)),
    [activeItems, selectedCategory],
  );

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

  const seo = scrollToMenu ? SEO.menu : SEO.home;

  return (
    <div className="min-h-svh bg-ink-100">
      <SeoHead {...seo} isMenu={scrollToMenu} />

      <div className="mx-auto min-h-svh max-w-md border-x border-ink-200 bg-ink-50 shadow-frame">
        <Header cartCount={cart.count} cartBump={cart.bump} onOpenCart={openCart} />

        <main>
          <HeroCarousel items={hero} onOpenProduct={openProduct} />
          <SubHero items={subhero} onOpenProduct={openProduct} />

          <section id="menu" aria-label={`${SITE.name} menu`} className="scroll-mt-16 px-4 pb-28 pt-4">
            <CategoryPills categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
            <ProductGrid items={visibleItems} quantities={cart.quantities} onOpenProduct={openProduct} onAdd={addItem} />
          </section>
        </main>
      </div>

      <ProductModal
        item={selectedProduct}
        quantity={selectedProduct ? cart.quantities[selectedProduct.id] || 0 : 0}
        onClose={closeProduct}
        onAdd={addItem}
        onDecrement={cart.decrement}
      />

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        lines={cart.lines}
        total={cart.total}
        checkoutHref={buildWhatsAppLink(cart.lines, SITE.whatsappNumber)}
        onIncrement={(id) => cart.add(id)}
        onDecrement={cart.decrement}
        onRemove={cart.removeLine}
        onCheckout={() => track("checkout_click", { total: cart.total, lines: cart.lines.length })}
      />

      <ChatWidget menuItems={activeItems} byId={byId} cartLines={cart.lines} onApplyActions={cart.applyActions} />
    </div>
  );
}
