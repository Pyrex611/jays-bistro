import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_MENU_ITEMS, WHATSAPP_NUMBER } from '../data/menu.js';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Products Catalog with LocalStorage persistence
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('jays_menu_items_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load products from storage, using defaults", e);
    }
    return INITIAL_MENU_ITEMS;
  });

  // Cart State with LocalStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('jays_cart_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not load cart from storage", e);
    }
    return [];
  });

  // Navigation & UI States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jays_menu_items_v2', JSON.stringify(products));
    } catch (e) {
      console.error("Storage error for products", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('jays_cart_v2', JSON.stringify(cart));
    } catch (e) {
      console.error("Storage error for cart", e);
    }
  }, [cart]);

  // Derived Metrics
  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);

  const heroProducts = useMemo(() => {
    const heroes = products.filter(p => p.isHero);
    return heroes.length > 0 ? heroes : products.slice(0, 4);
  }, [products]);

  const dualSpotlight = useMemo(() => {
    const left = products.find(p => p.isDualGrid === 'left') || products.find(p => p.id === 21) || products[0];
    const right = products.find(p => p.isDualGrid === 'right') || products.find(p => p.id === 51) || products[1];
    return { left, right };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== "All") {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Cart Operations
  const addToCart = (productId) => {
    const item = products.find(p => p.id === productId);
    if (!item) return;

    setCart(prev => {
      const idx = prev.findIndex(i => i.id === productId);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image
      }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === productId);
      if (idx === -1 && delta > 0) {
        const item = products.find(p => p.id === productId);
        if (!item) return prev;
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
      }
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += delta;
        if (copy[idx].quantity <= 0) {
          copy.splice(idx, 1);
        }
        return copy;
      }
      return prev;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Admin Catalog Mutations
  const addProduct = (newProduct) => {
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 100);
    const item = {
      ...newProduct,
      id: maxId + 1,
      price: Number(newProduct.price) || 1000,
    };
    setProducts(prev => [item, ...prev]);
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields, price: Number(updatedFields.price || p.price) } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    removeFromCart(id);
  };

  const toggleHeroStatus = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isHero: !p.isHero } : p));
  };

  const setDualSpotlight = (id, position) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) return { ...p, isDualGrid: position };
      if (position && p.isDualGrid === position) return { ...p, isDualGrid: null };
      return p;
    }));
  };

  // Mock Sales Analytics Tracker with LocalStorage
  const [salesRecords, setSalesRecords] = useState(() => {
    try {
      const stored = localStorage.getItem('jays_sales_records_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not load sales analytics", e);
    }
    return [
      { id: 'ORD-101', total: 14500, itemsCount: 4, timestamp: Date.now() - 86400000 * 2 },
      { id: 'ORD-102', total: 9500, itemsCount: 2, timestamp: Date.now() - 86400000 * 1.5 },
      { id: 'ORD-103', total: 22000, itemsCount: 6, timestamp: Date.now() - 86400000 * 0.5 },
      { id: 'ORD-104', total: 8500, itemsCount: 3, timestamp: Date.now() - 3600000 * 4 },
      { id: 'ORD-105', total: 17500, itemsCount: 5, timestamp: Date.now() - 3600000 * 1 }
    ];
  });

  const recordCheckoutEvent = () => {
    if (cart.length === 0) return;
    const newRecord = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      total: cartTotal,
      itemsCount: cartCount,
      timestamp: Date.now(),
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))
    };
    const updated = [newRecord, ...salesRecords];
    setSalesRecords(updated);
    try {
      localStorage.setItem('jays_sales_records_v1', JSON.stringify(updated));
    } catch (e) {}
  };

  const analytics = useMemo(() => {
    const totalRev = salesRecords.reduce((acc, r) => acc + r.total, 0);
    const totalOrd = salesRecords.length;
    const aov = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;
    return {
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      averageOrderValue: aov,
      recentOrders: salesRecords.slice(0, 10),
      topDishes: [
        { name: "Party Jollof Rice", orders: 48, revenue: 72000 },
        { name: "Basmati Fried Rice", orders: 36, revenue: 126000 },
        { name: "Bistro Chicken Wings", orders: 29, revenue: 145000 },
        { name: "Classic Arabian Blend", orders: 24, revenue: 72000 },
        { name: "Chicken Shawarma (SS)", orders: 22, revenue: 77000 },
      ]
    };
  }, [salesRecords]);

  // WhatsApp Order Link Generator
  const generateWhatsAppLink = () => {
    if (cart.length === 0) return `https://wa.me/${WHATSAPP_NUMBER}`;
    let msg = "Hello Jay's Bistro, I would like to order:\n\n";
    let total = 0;
    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      msg += `▪ ${item.quantity}x ${item.name} - ₦${lineTotal.toLocaleString()}\n`;
    });
    msg += `\n*Total: ₦${total.toLocaleString()}*`;
    msg += `\nDelivery Location: Makurdi, Benue State`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      cartCount,
      cartTotal,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      isCartOpen,
      setIsCartOpen,
      isChatOpen,
      setIsChatOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      selectedProductId,
      setSelectedProductId,
      isAdminOpen,
      setIsAdminOpen,
      heroProducts,
      dualSpotlight,
      filteredProducts,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleHeroStatus,
      setDualSpotlight,
      analytics,
      recordCheckoutEvent,
      generateWhatsAppLink,
      WHATSAPP_NUMBER
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
};