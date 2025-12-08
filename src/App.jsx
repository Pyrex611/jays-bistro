import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, Coffee, Utensils, Zap, Salad, 
  MapPin, Phone, Mail, ArrowRight, ChevronRight, Bot, Send, 
  Menu as MenuIcon, Instagram, Facebook, Twitter, Star
} from 'lucide-react';

// --- Styles for Fonts (Injecting Playfair Display for that L'Avenue look) ---
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
      
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Lato', sans-serif; }
      
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// --- Configuration Data ---
const MENU_ITEMS = [
  // Tea & Refreshments
  { 
    id: 1, 
    category: "Tea & Refreshments", 
    name: "Classic Arabian Blend", 
    price: 1200, 
    description: "Heritage spice infusion with cardamom and rosewater. Served with lemon and honey.", 
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "The Heritage Blend", 
    slideSubtitle: "Timeless Arabian Tea, perfected with Cardamom & Rosewater." 
  },
  { 
    id: 2, 
    category: "Tea & Refreshments", 
    name: "Midnight Espresso Tonic", 
    price: 1800, 
    description: "Single-origin espresso, tonic water, and a twist of orange peel, served chilled.", 
    image: "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 3, 
    category: "Tea & Refreshments", 
    name: "Hibiscus & Ginger Zobo", 
    price: 1500, 
    description: "Premium hibiscus flowers steeped with fresh ginger and a touch of organic honey.", 
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 4, 
    category: "Tea & Refreshments", 
    name: "Spiced Cinnamon Chai", 
    price: 1400, 
    description: "Strong black tea simmered with fresh milk and house-ground cinnamon mix.", 
    image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=800" 
  },

  // Appetizers
  { 
    id: 5, 
    category: "Appetizers", 
    name: "Smoky Goat Pepper Soup", 
    price: 3500, 
    description: "A rich, slow-simmered broth featuring tender pieces of smoked goat meat.", 
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "Taste of Tradition", 
    slideSubtitle: "Bold flavors. Slow-simmered broth with tender smoked goat meat." 
  },
  { 
    id: 6, 
    category: "Appetizers", 
    name: "Bistro Chicken Satay", 
    price: 2800, 
    description: "Marinated chicken skewers, grilled, served with a delicate peanut dipping sauce.", 
    image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 7, 
    category: "Appetizers", 
    name: "Crispy Calamari Rings", 
    price: 3200, 
    description: "Lightly seasoned and flash-fried calamari, served with citrus aioli.", 
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&q=80&w=800" 
  },

  // Meals
  { 
    id: 8, 
    category: "Meals", 
    name: "Signature Jollof Risotto", 
    price: 4500, 
    description: "Arborio rice cooked in a complex tomato base, served with plantain crisps and grilled beef fillet.", 
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "Fusion Masterpiece", 
    slideSubtitle: "West African soul meets Italian technique: Jollof Risotto." 
  },
  { 
    id: 9, 
    category: "Meals", 
    name: "Pesto Shrimp Tagliatelle", 
    price: 6000, 
    description: "Fresh, house-made tagliatelle pasta tossed in a basil pesto with grilled jumbo shrimp.", 
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 10, 
    category: "Meals", 
    name: "Pan-Seared Salmon Fillet", 
    price: 7500, 
    description: "Atlantic salmon, perfectly seared, served over a bed of creamy mashed potatoes.", 
    image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=800" 
  },

  // Bites
  { 
    id: 11, 
    category: "Bites & Small Chops", 
    name: "Spiced Meat Samosa", 
    price: 1500, 
    description: "Crispy triangular pastry pockets filled with spiced minced lamb.", 
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 12, 
    category: "Bites & Small Chops", 
    name: "Gourmet Puff-Puff", 
    price: 1000, 
    description: "Lightly spiced fried dough balls, served with a powdered sugar dusting.", 
    image: "https://images.unsplash.com/photo-1630405433873-91851d45763e?auto=format&fit=crop&q=80&w=800" 
  },
];

const CATEGORIES = [
  { id: 'tea', label: "Tea & Refreshments" },
  { id: 'appetizers', label: "Appetizers" },
  { id: 'meals', label: "Meals" },
  { id: 'bites', label: "Bites & Small Chops" },
];

// --- Utility Functions ---
const formatPrice = (price) => "₦" + price.toLocaleString();

const parseOrderFromText = (text, menuItems) => {
    let itemsToAdd = [];
    const menuNames = menuItems.map(item => item.name);
    const patterns = menuNames.map(name => ({
        name,
        regex: new RegExp(`(\\d+)\\s+(${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
    }));
    for (const pattern of patterns) {
        let match;
        pattern.regex.lastIndex = 0; 
        while ((match = pattern.regex.exec(text)) !== null) {
            const quantity = parseInt(match[1], 10);
            const itemName = match[2];
            if (quantity > 0) {
                const item = menuItems.find(i => i.name === itemName);
                if (item) itemsToAdd.push({ item, quantity });
            }
        }
    }
    return itemsToAdd;
};

// --- API Function ---
const fetchWithRetry = async (url, options, retries = 3) => {
    // Mocking API for demo purposes since we don't have a real key here
    // In production, uncomment the real fetch logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        ok: true,
        json: async () => ({
            candidates: [{ content: { parts: [{ text: "Thank you for your message. As Jay's Bistro Concierge, I'd be delighted to assist you with that request." }] } }]
        })
    };
};

// --- Components ---

const PrimaryButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      bg-zinc-900 text-white font-sans text-sm tracking-widest uppercase px-8 py-4 
      hover:bg-[#C5A059] transition-all duration-300 
      ${className}
    `}
  >
    {children}
  </button>
);

const SectionHeading = ({ title, subtitle }) => (
    <div className="text-center mb-16 space-y-4">
        <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase">{subtitle}</span>
        <h2 className="font-serif text-4xl md:text-5xl text-zinc-900">{title}</h2>
        <div className="w-24 h-px bg-[#C5A059] mx-auto mt-6"></div>
    </div>
);

const JaysBistro = () => {
  const [activeTab, setActiveTab] = useState("Tea & Refreshments");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const filteredItems = useMemo(() => MENU_ITEMS.filter(item => item.category === activeTab), [activeTab]);

  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      }
      setIsCartOpen(true); // Open cart on first add
      return [...prevCart, { ...item, quantity }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart.reduce((acc, item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          if (newQuantity > 0) acc.push({ ...item, quantity: newQuantity });
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  // --- Chat Logic ---
  const handleChatSubmit = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Parse for orders
    const itemsToAdd = parseOrderFromText(text, MENU_ITEMS);
    if (itemsToAdd.length > 0) {
        itemsToAdd.forEach(({ item, quantity }) => addToCart(item, quantity));
    }

    // Mock API call
    try {
        const response = await fetchWithRetry(); // Using mock function
        const result = await response.json();
        const responseText = result.candidates[0].content.parts[0].text;
        
        let finalResponse = responseText;
        if (itemsToAdd.length > 0) {
            finalResponse = `I've added those items to your tray. ${responseText}`;
        }
        
        setChatHistory(prev => [...prev, { role: 'assistant', text: finalResponse }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: "I apologize, I am unable to connect to the concierge service momentarily." }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- Sub-Components ---

  const MenuCard = ({ item }) => (
    <div className="group">
      <div className="relative overflow-hidden mb-6 aspect-[4/5]">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
             <button 
                onClick={() => addToCart(item)}
                className="bg-white text-zinc-900 px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#C5A059] hover:text-white transition-colors"
             >
                Add to Tray
             </button>
        </div>
      </div>
      
      <div className="text-center px-2">
        <h3 className="font-serif text-xl text-zinc-900 mb-2">{item.name}</h3>
        <p className="text-zinc-500 text-sm mb-3 leading-relaxed font-light">{item.description}</p>
        <span className="block text-[#C5A059] font-bold text-lg">
          {formatPrice(item.price)}
        </span>
      </div>
    </div>
  );

  const HeroSlideshow = () => {
    const slides = MENU_ITEMS.filter(item => item.slideTitle).slice(0, 3);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setActiveSlideIndex(prevIndex => (prevIndex + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }, [slides.length]);

    return (
      <header className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlideIndex ? 'opacity-60' : 'opacity-0'}`}
          >
             <img src={slide.image} className="w-full h-full object-cover" alt="Hero" />
          </div>
        ))}
        
        {/* Overlay content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <p className="text-[#C5A059] font-bold tracking-[0.3em] text-sm md:text-base uppercase mb-6 animate-fade-in-up">
                Welcome to Jay's Bistro
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight animate-fade-in-up delay-100">
                {slides[activeSlideIndex].slideTitle}
            </h1>
            <p className="text-zinc-200 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                {slides[activeSlideIndex].slideSubtitle}
            </p>
            <div className="animate-fade-in-up delay-300">
                <button 
                    onClick={() => document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' })}
                    className="border border-white text-white px-8 py-4 hover:bg-white hover:text-zinc-900 transition-all duration-300 uppercase tracking-widest text-sm"
                >
                    View Menu
                </button>
            </div>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-[#C5A059] selection:text-white">
      <FontStyles />
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button className="md:hidden text-zinc-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <MenuIcon />
            </button>

            {/* Desktop Links Left */}
            <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-bold text-zinc-500">
                <a href="#" className={`hover:text-[#C5A059] transition-colors ${scrolled ? 'text-zinc-600' : 'text-white/80'}`}>Home</a>
                <a href="#" className={`hover:text-[#C5A059] transition-colors ${scrolled ? 'text-zinc-600' : 'text-white/80'}`}>Story</a>
            </div>

            {/* Logo */}
            <div className={`text-2xl md:text-3xl font-serif font-bold tracking-tighter text-center absolute left-1/2 transform -translate-x-1/2 ${scrolled ? 'text-zinc-900' : 'text-white'}`}>
                Jay's <span className="text-[#C5A059]">Bistro</span>
            </div>

            {/* Desktop Links Right + Icons */}
            <div className="flex items-center gap-6 md:gap-8">
                 <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-bold text-zinc-500">
                    <a href="#menu-section" className={`hover:text-[#C5A059] transition-colors ${scrolled ? 'text-zinc-600' : 'text-white/80'}`}>Menu</a>
                    <a href="#" className={`hover:text-[#C5A059] transition-colors ${scrolled ? 'text-zinc-600' : 'text-white/80'}`}>Contact</a>
                </div>
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className={`relative p-2 transition-colors ${scrolled ? 'text-zinc-900' : 'text-white'}`}
                >
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                        {cartCount}
                    </span>
                    )}
                </button>
            </div>
        </div>
      </nav>

      <HeroSlideshow />

      {/* Story Section (L'Avenue Style) */}
      <section className="py-24 px-6 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
                <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase">Our Story</span>
                <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-tight">
                    Where Atmosphere Meets <span className="italic text-[#C5A059]">Culinary Art</span>
                </h2>
                <p className="text-zinc-500 leading-loose font-light">
                    Nestled in the heart of Victoria Island, Jay's Bistro offers an escape from the bustling city. Inspired by the chic cafes of Paris and the vibrant flavors of Lagos, we created a space that honors tradition while embracing modern elegance.
                </p>
                <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-zinc-300"></div>
                    <span className="font-serif text-lg italic">Chef Jay</span>
                </div>
            </div>
            <div className="relative">
                <div className="absolute top-4 -left-4 w-full h-full border border-[#C5A059] z-0"></div>
                <img 
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" 
                    alt="Interior" 
                    className="relative z-10 w-full h-[500px] object-cover"
                />
            </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
            <SectionHeading title="The Collection" subtitle="Discover Flavors" />

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-8 mb-16">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.label)}
                        className={`
                            text-sm uppercase tracking-widest pb-2 transition-all duration-300
                            ${activeTab === cat.label 
                                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                                : 'text-zinc-400 hover:text-zinc-600'}
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {filteredItems.map((item) => (
                    <MenuCard key={item.id} item={item} />
                ))}
            </div>
        </div>
      </section>

      {/* Reservation Banner */}
      <section className="py-20 bg-zinc-900 text-white text-center px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Experience the Ambiance</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Book a table for an unforgettable evening. Reservations recommended for weekend dining.</p>
          <PrimaryButton className="bg-white text-black hover:bg-[#C5A059] hover:text-white">
            Make a Reservation
          </PrimaryButton>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] pt-20 pb-10 border-t border-zinc-200">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                <div className="text-center md:text-left">
                    <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-4">Jay's Bistro</h3>
                    <p className="text-zinc-500 text-sm">Victoria Island, Lagos</p>
                </div>
                
                <div className="flex gap-6">
                    {[Instagram, Facebook, Twitter].map((Icon, i) => (
                        <a key={i} href="#" className="w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:border-[#C5A059] hover:text-[#C5A059] transition-all">
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-zinc-200 pt-8 text-xs text-zinc-400 uppercase tracking-widest">
                <p>&copy; 2024 Jay's Bistro. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Cart Drawer (Clean & Light) */}
      <div className={`fixed inset-0 z-[60] transition-all duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-zinc-900">Your Tray</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-serif text-lg">Your tray is empty.</p>
               </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                        <img src={item.image} className="w-20 h-24 object-cover" alt={item.name} />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-serif text-zinc-900 text-lg leading-tight">{item.name}</h4>
                                <p className="text-[#C5A059] text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <button onClick={() => updateQuantity(item.id, -1)} className="text-zinc-400 hover:text-zinc-900"><Minus size={16}/></button>
                                <span className="text-sm font-medium">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="text-zinc-400 hover:text-zinc-900"><Plus size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-8 bg-zinc-50">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm">Total</span>
                    <span className="font-serif text-2xl text-zinc-900">{formatPrice(cartTotal)}</span>
                </div>
                <PrimaryButton className="w-full">Checkout</PrimaryButton>
            </div>
          )}
        </div>
      </div>
      
      {/* ChatBot (Concierge Style) */}
      <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-8 right-8 z-50 bg-[#C5A059] text-white p-4 rounded-full shadow-lg hover:bg-zinc-900 transition-colors duration-300"
        >
          {isChatOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-[90vw] max-w-sm bg-white rounded-lg shadow-2xl border border-zinc-100 overflow-hidden animate-fade-in-up">
            <div className="bg-[#C5A059] p-4 text-white flex justify-between items-center">
                <span className="font-serif italic text-lg">Concierge</span>
                <span className="text-xs uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Online</span>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#FDFBF7]">
                {chatHistory.length === 0 && (
                    <div className="text-center mt-8 text-zinc-400 text-sm">
                        <p>How may I assist with your order?</p>
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 text-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-700 shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-zinc-400 italic p-2">Concierge is typing...</div>}
            </div>
            <div className="p-3 bg-white border-t border-zinc-100 flex gap-2">
                <input 
                    className="flex-1 bg-zinc-50 border-none outline-none px-3 text-sm text-zinc-700"
                    placeholder="Type your request..."
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit(e.target.value)}
                />
                <button className="text-[#C5A059] hover:text-zinc-900"><Send size={18} /></button>
            </div>
        </div>
      )}

    </div>
  );
};

export default JaysBistro;