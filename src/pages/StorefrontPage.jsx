import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import InfoSheet from "../components/layout/InfoSheet.jsx";
import SeoHead from "../components/layout/SeoHead.jsx";
import StatusBanners from "../components/layout/StatusBanners.jsx";
import HeroCarousel from "../components/storefront/HeroCarousel.jsx";
import SubHero from "../components/storefront/SubHero.jsx";
import CategoryBar from "../components/storefront/CategoryBar.jsx";
import MenuSections from "../components/storefront/MenuSections.jsx";
import ProductModal from "../components/storefront/ProductModal.jsx";
import CartBar from "../components/cart/CartBar.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import ChatWidget from "../components/chat/ChatWidget.jsx";
import { SITE } from "../config/site.js";
import { useMenu } from "../context/MenuContext.js";
import { useCart } from "../hooks/useCart.js";
import { useCheckout } from "../hooks/useCheckout.js";
import { useScrollSpy } from "../hooks/useScrollSpy.js";
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

/** Viewport Y a group's first card must rise above to become the current group: just under the sticky bars, plus ~30% of the screen. */
const spyLine = () => {
  const bar = document.querySelector("[data-category-bar]");
  return (bar ? bar.getBoundingClientRect().bottom : 112) + window.innerHeight * 0.3;
};

/** The storefront. One continuous menu; the sticky bar follows the scroll; search collapses into a magnifier. */
export default function StorefrontPage({ scrollToMenu = false }) {
  const { activeItems, byId, groups, iconByCategory, hero, subhero, settings } = useMenu();
  const cart = useCart(byId);
  const { add: addToCart } = cart;
  const checkout = useCheckout({ lines: cart.lines, total: cart.subtotal, whatsapp: settings.business.whatsapp });

  const { id: routeDishId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Parse direct dish link from query string (?dish=... or ?item=...) or route param (/dish/:id)
  const targetDishParam = routeDishId || searchParams.get("dish") || searchParams.get("item");

  useEffect(() => {
    if (!targetDishParam) return;
    const numericId = Number(targetDishParam);
    const matched = Number.isInteger(numericId) && byId[numericId]
      ? byId[numericId]
      : activeItems.find((i) => String(i.id) === targetDishParam || i.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetDishParam);

    if (matched) {
      setSelectedProductId(matched.id);
      track("product_view", { id: matched.id, source: "direct_link" });
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetDishParam, byId, activeItems]);

  const searching = searchOpen && query.trim().length > 0;
  const groupNames = useMemo(() => groups.map((g) => g.name), [groups]);
  const { active, jumpTo } = useScrollSpy(groupNames, { enabled: !searching, getLine: spyLine });

  useEffect(() => {
    if (scrollToMenu) document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }, [scrollToMenu]);

  const results = useMemo(() => (searching ? searchItems(activeItems, query) : []), [activeItems, query, searching]);

  const selectedProduct = selectedProductId != null ? byId[selectedProductId] ?? null : null;

  const openProduct = useCallback((id) => {
    setSelectedProductId(id);
    track("product_view", { id });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("dish", String(id));
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProductId(null);
    if (routeDishId) {
      navigate("/menu", { replace: true });
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("dish") || url.searchParams.has("item")) {
        url.searchParams.delete("dish");
        url.searchParams.delete("item");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  }, [routeDishId, navigate]);

  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeInfo = useCallback(() => setInfoOpen(false), []);
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
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const seo = scrollToMenu || Boolean(targetDishParam) ? SEO.menu : SEO.home;

  return (
    <div className="min-h-svh bg-cream-200">
      <SeoHead {...seo} isMenu={scrollToMenu || Boolean(targetDishParam)} settings={settings} />

      <div className="mx-auto min-h-svh max-w-md border-x border-cream-300 bg-cream-100 shadow-frame">
        <Header cartCount={cart.count} cartBump={cart.bump} onOpenCart={openCart} onOpenInfo={() => setInfoOpen(true)} />

        <main>
          <StatusBanners settings={settings} />
          <HeroCarousel items={hero} iconByCategory={iconByCategory} onOpenProduct={openProduct} />
          <SubHero items={subhero} iconByCategory={iconByCategory} onOpenProduct={openProduct} />

          <section id="menu" aria-label={`${SITE.name} menu`} className="px-4 pb-32 pt-2">
            <CategoryBar
              groups={groups}
              active={active}
              onSelect={jumpTo}
              searchOpen={searchOpen}
              query={query}
              onQueryChange={setQuery}
              onOpenSearch={() => setSearchOpen(true)}
              onCloseSearch={closeSearch}
            />
            <div className="mt-2">
              <MenuSections
                mode={searching ? "search" : "all"}
                query={query}
                items={searching ? results : activeItems}
                groups={groups}
                iconByCategory={iconByCategory}
                quantities={cart.quantities}
                onOpenProduct={openProduct}
                onAdd={addItem}
                onDecrement={cart.decrement}
                onClearSearch={closeSearch}
              />
            </div>
          </section>
        </main>
      </div>

      <CartBar count={cart.count} total={cart.subtotal} onOpen={openCart} />
      <InfoSheet open={infoOpen} onClose={closeInfo} settings={settings} />

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