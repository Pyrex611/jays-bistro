import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, MapPin, Phone, ArrowRight, 
  Bot, Send, Menu as MenuIcon, Instagram, Facebook, Twitter, 
  ChevronLeft, Star, Clock, Sun, Moon, ChevronRight
} from 'lucide-react';

// --- Configuration ---
const WHATSAPP_NUMBER = "2348062624447"; 
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Precious+event+Centre+Makurdi";
const CHATBOT_API_KEY = "PLACEHOLDER_GEMINI_API_KEY_A1B2C3D4E5F6G7H8I9"; 

// --- Data ---
const MENU_ITEMS = [
  // --- Curated / Featured (Shown on Hero) ---
  { id: 1, category: "Meals", name: "Party Jollof Rice", price: 1500, description: "Signature smoky party jollof served with grilled beef.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 2, category: "Protein", name: "Isi-ewu", price: 6000, description: "Traditional spicy goat head delicacy in rich palm oil sauce.", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 3, category: "Beverages", name: "Classic Arabian Blend", price: 3000, description: "Heritage spice infusion with cardamom and rosewater.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1920", featured: true },

  // --- Full Menu (Selected items for brevity, ensure all your items are here) ---
  { id: 4, category: "Beverages", name: "Double Root (1L)", price: 3500, description: "Powerful herbal blend for vitality and wellness.", image: "https://images.unsplash.com/photo-1544517176-655510493a28?auto=format&fit=crop&q=80&w=800" },
  { id: 12, category: "Starters", name: "Spiced Meat Samosa", price: 1500, description: "Crispy triangular pastry filled with spiced minced meat.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" },
  { id: 15, category: "Bites", name: "Fish Roll", price: 1000, description: "Flaky pastry rolled with a savory fish filling.", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800" },
  { id: 19, category: "Bites", name: "6' Pizza", price: 12000, description: "Personal size pizza loaded with cheese and toppings.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
  { id: 21, category: "Bites", name: "Chicken Shawarma (SS)", price: 3500, description: "Creamy Chicken shawarma with Single Sausage.", image: "https://images.unsplash.com/photo-1633321702518-7feccaf9cdf3?auto=format&fit=crop&q=80&w=800" },
  { id: 50, category: "Protein", name: "Smoky Goat Pepper Soup", price: 3000, description: "Slow-simmered broth with tender smoked goat.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
  { id: 51, category: "Protein", name: "Bistro Chicken Wings", price: 5000, description: "Succulent grilled wings in bistro glaze.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800" },
  { id: 42, category: "Meals", name: "Pounded Yam", price: 1200, description: "Smooth, stretchy pounded yam.", image: "https://images.unsplash.com/photo-1643487372226-78a0f8eb5b62?auto=format&fit=crop&q=80&w=800" },
  { id: 62, category: "Soups", name: "Egusi", price: 500, description: "Rich melon seed soup with spinach.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
];

const CATEGORIES = ["All", "Starters", "Beverages", "Meals", "Bites", "Protein", "Soups"];

const FOOTER_BG = '#1A1A1A'; 
const FOOTER_TEXT_PRIMARY = '#F9F7F2';
const FOOTER_TEXT_SECONDARY = '#AAAAAA';

// --- Utilities ---
const formatPrice = (p) => "₦" + p.toLocaleString();

const generateWhatsAppLink = (cart) => {
    if (cart.length === 0) return `https://wa.me/${WHATSAPP_NUMBER}`;
    let message = "Hello Jay's Bistro, I would like to place an order:\n\n";
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `▪ ${item.quantity}x ${item.name} - ${formatPrice(itemTotal)}\n`;
    });
    message += `\n*Total Order Value: ${formatPrice(total)}*`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// --- Components ---

const PrimaryButton = ({ children, onClick, className = '', variant = 'dark' }) => {
  const baseClasses = "px-8 py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 transform active:scale-95 bg-[var(--color-primary-button-bg)] text-[var(--color-primary-button-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]";
  const outlineClasses = "bg-transparent border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-black";
  const finalClassName = `${baseClasses} ${variant === 'outline' ? outlineClasses : ''} ${className}`;
  return <button onClick={onClick} className={finalClassName}>{children}</button>;
};

const AddToCartButton = ({ item, cart, addToCart, updateQuantity }) => {
  const cartItem = cart.find(i => i.id === item.id);
  if (cartItem) {
    return (
      <div className="flex items-center justify-between bg-[var(--color-text)] text-[var(--color-bg)] px-3 py-2 w-full animate-pulse rounded-sm">
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="hover:text-[var(--color-accent)]"><Minus size={14} /></button>
        <span className="font-sans font-bold text-sm">{cartItem.quantity}</span>
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="hover:text-[var(--color-accent)]"><Plus size={14} /></button>
      </div>
    );
  }
  return (
    <button 
      onClick={() => addToCart(item)}
      className="w-full bg-transparent border border-[var(--color-text)] text-[var(--color-text)] py-2 text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-text)] hover:text-[var(--color-bg-secondary)] transition-all duration-300 active:scale-95"
    >
      Add
    </button>
  );
};

const MenuCard = ({ item, cart, addToCart, updateQuantity }) => (
  <div className="group bg-bg-secondary p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-[var(--color-accent)]/30 rounded-sm">
    <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-[var(--color-border)] rounded-sm">
      <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
    </div>
    <div className="text-center mb-4">
      <h3 className="font-serif text-lg text-primary mb-2">{item.name}</h3>
      <p className="text-secondary text-xs leading-relaxed mb-3 h-10 line-clamp-2 px-2">{item.description}</p>
      <span className="block text-accent font-serif font-bold text-lg italic">{formatPrice(item.price)}</span>
    </div>
    <div className="px-2 pb-2">
        <AddToCartButton item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
    </div>
  </div>
);

const NavLink = ({ page, current, setPage, scrolled, children, theme }) => {
    const isDarkBackground = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const defaultColor = (scrolled || current !== 'home') ? 'var(--color-text)' : (isDarkBackground ? 'var(--color-text)' : 'white');
    return (
        <button onClick={() => setPage(page)} className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 relative pb-1 ${current === page ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]/80'}`} style={{ color: defaultColor }}>
            {children}
        </button>
    );
};

// --- Styles ---
const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&family=Sacramento&display=swap');
      :root { --color-accent: #C5A059; }
      html { scroll-behavior: smooth; }
      .light-theme {
        --color-bg: #F9F7F2; --color-text: #1A1A1A; 
        --color-bg-secondary: #FFFFFF; --color-text-secondary: #555555;
        --color-border: #EEEEEE; --color-nav-bg: rgba(255, 255, 255, 0.90);
        --color-hero-overlay: rgba(26, 26, 26, 0.4);
        --color-primary-button-bg: #1A1A1A; --color-primary-button-text: #FFFFFF;
      }
      .dark-theme {
        --color-bg: #1A1A1A; --color-text: #F9F7F2; 
        --color-bg-secondary: #2C2C2C; --color-text-secondary: #AAAAAA;
        --color-border: #333333; --color-nav-bg: rgba(26, 26, 26, 0.90);
        --color-hero-overlay: rgba(0, 0, 0, 0.6);
        --color-primary-button-bg: #C5A059; --color-primary-button-text: #1A1A1A;
      }
      body { background-color: var(--color-bg); color: var(--color-text); overflow-x: hidden; transition: background-color 0.5s ease; -webkit-overflow-scrolling: touch; }
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Montserrat', sans-serif; }
	  .font-handwritten { font-family: 'Sacramento', cursive; }
      .text-primary { color: var(--color-text); }
      .bg-primary { background-color: var(--color-bg); }
      .bg-secondary { background-color: var(--color-bg-secondary); }
      .text-secondary { color: var(--color-text-secondary); }
      .text-accent { color: var(--color-accent); }
      .view-fade-in { animation: fadeInPage 0.4s ease-out forwards; }
      @keyframes fadeInPage { from { opacity: 0; } to { opacity: 1; } }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      /* Snap scrolling utilities */
      .snap-x { scroll-snap-type: x mandatory; }
      .snap-center { scroll-snap-align: center; }
    `}
  </style>
);

// --- Main Application ---
const JaysBistro = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system'); 

  // Hero Slides (Filtered)
  const heroSlides = MENU_ITEMS.filter(item => item.featured).slice(0, 3); 

  useEffect(() => {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke="#C5A059" stroke-width="4" fill="#1A1A1A" /><text x="50" y="45" font-family="cursive" font-size="24" fill="#F9F7F2" text-anchor="middle" dominant-baseline="middle">Jay's</text><text x="50" y="70" font-family="cursive" font-size="20" fill="#C5A059" text-anchor="middle" dominant-baseline="middle">Bistro</text></svg>`;
    const blob = new Blob([svgIcon], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
    return () => URL.revokeObjectURL(url);
  }, []);

  const applyTheme = (mode) => {
    let bodyClass = 'light-theme';
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        bodyClass = 'dark-theme';
    }
    document.body.className = bodyClass;
  };

  const toggleTheme = () => {
    setTheme(prev => {
        let newTheme;
        if (prev === 'system') newTheme = 'light';
        else if (prev === 'light') newTheme = 'dark';
        else newTheme = 'system';
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
  };

  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [theme]);

  // Pseudo-Router logic
  useEffect(() => {
      const path = window.location.pathname;
      if (path.includes('menu')) setCurrentPage('menu');
      else if (path.includes('about')) setCurrentPage('about');
      else setCurrentPage('home');
  }, []);

  useEffect(() => {
      const path = currentPage === 'home' ? '/' : `/${currentPage}`;
      if (window.location.pathname !== path) {
          window.history.pushState(null, '', path);
      }
      const handlePopState = () => {
          const newPath = window.location.pathname;
          if (newPath.includes('menu')) setCurrentPage('menu');
          else if (newPath.includes('about')) setCurrentPage('about');
          else setCurrentPage('home');
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > 0) acc.push({ ...item, quantity: newQ });
      } else {
        acc.push(item);
      }
      return acc;
    }, []));
  };

  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    if (!CHATBOT_API_KEY || CHATBOT_API_KEY.includes('PLACEHOLDER')) {
        setTimeout(() => {
            setChatHistory(prev => [...prev, { role: 'model', text: "I'm the concierge at Jay's Bistro. I can see you're interested in our menu. While my live connection is currently offline for this demo, I recommend the Signature Jollof Risotto!" }]);
            setIsTyping(false);
        }, 1000);
        return;
    }
    
    // ... API call logic here if key is valid ...
    setIsTyping(false); // Fallback for now
  };

  // --- Revised Hero Section: Horizontal Scroll (No Flashing) ---
  const HeroSection = () => (
    <section className="relative h-screen w-full bg-bg-secondary overflow-hidden">
        {/* Fixed "Welcome" Overlay - Stays put while images slide */}
        <div className="absolute top-32 left-0 w-full z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
             <p className="text-accent text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4 shadow-black drop-shadow-md animate-[fadeIn_1s_ease-out]">Welcome to</p>
             <h2 className="font-handwritten text-6xl md:text-8xl text-white drop-shadow-xl animate-[fadeIn_1s_ease-out_0.2s_both]">Jay's Bistro</h2>
        </div>

        {/* Scroll Container */}
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {heroSlides.map((slide) => (
                <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-center">
                    {/* Image */}
                    <img 
                        src={slide.image} 
                        alt={slide.name} 
                        className="w-full h-full object-cover" 
                    />
                    {/* Dark Overlay per slide to ensure text pop */}
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Content specific to this slide */}
                    <div className="absolute bottom-24 left-0 w-full flex flex-col items-center justify-end pb-12 px-4 text-center z-20">
                        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight max-w-4xl mx-auto mb-8 drop-shadow-lg">
                            {slide.name}
                        </h1>
                        <button 
                            onClick={() => addToCart(slide)} 
                            className="flex items-center gap-3 bg-accent text-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg"
                        >
                            Order Now <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Scroll Indicator Hint */}
        <div className="absolute bottom-6 w-full text-center z-20 animate-bounce pointer-events-none opacity-70">
            <span className="text-white text-[10px] uppercase tracking-widest">Swipe / Scroll</span>
        </div>
    </section>
  );

  const HomeView = () => (
    <div className="view-fade-in">
      <HeroSection />
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">The Experience</span>
        <h2 className="font-serif text-4xl text-primary mt-4 mb-8">Where atmosphere meets culinary art</h2>
        <p className="text-secondary leading-loose font-light">Nestled in Makurdi, we offer an escape from the bustling city. Inspired by chic Parisian cafes and the vibrant flavors of Benue State.</p>
      </section>
      <section className="py-20 bg-bg-secondary">
        <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div><h2 className="font-serif text-3xl text-primary">Curated Favorites</h2><p className="text-secondary text-sm mt-2">A glimpse into our kitchen.</p></div>
            </div>
            <div className="space-y-8 max-w-3xl mx-auto"> 
                {heroSlides.map(item => (
                    <div key={item.id} className="pb-8 border-b border-primary/10 flex items-start gap-4">
                        <img src={item.image} alt={item.name} loading="lazy" className="w-16 h-16 object-cover flex-shrink-0 rounded-sm" />
                        <div className="flex flex-1 flex-col md:flex-row justify-between items-start"> 
                            <div className="w-full md:flex-1 mb-4 md:mb-0">
                                <h3 className="font-serif text-xl font-medium text-primary">{item.name}</h3>
                                <p className="text-secondary text-sm leading-relaxed mt-1">{item.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 justify-end md:flex-row md:items-center md:gap-4 md:min-w-[200px] ml-0 md:ml-4 flex-shrink-0 w-full md:w-auto">
                                <span className="text-accent font-serif font-bold text-lg italic">{formatPrice(item.price)}</span>
                                <div className="w-24 mt-2 md:mt-0"><AddToCartButton item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} /></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
                 <PrimaryButton onClick={() => setCurrentPage('menu')} variant="outline">Show Full Menu <ArrowRight size={16} className="ml-2 inline" /></PrimaryButton>
            </div>
        </div>
      </section>
      <section className="pb-24 px-4 container mx-auto">
          <div className="text-center mb-12"><span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Ambience</span><h2 className="font-serif text-4xl mt-2 text-primary">Visual Chronicle</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 h-[500px]">
              <div className="col-span-2 row-span-2 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-1 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-2 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-1 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&q=80&w=800" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
          </div>
      </section>
    </div>
  );

  const MenuView = () => {
    const filtered = activeCategory === "All" ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === activeCategory);
    
    return (
        <div className="pt-32 pb-20 min-h-screen view-fade-in container mx-auto px-6">
            <div className="text-center mb-16">
                <h1 className="font-serif text-5xl md:text-6xl mb-4 text-primary">The Menu Carte</h1>
                <p className="text-secondary font-light max-w-xl mx-auto">Discover flavors crafted with passion, from our signature teas to our fusion entrees.</p>
            </div>

            {/* Sticky Categories FIX: Increased top to 70px to clear navbar, added shadow & solid bg, aligned left */}
            <div className="sticky top-[70px] z-30 bg-[var(--color-bg)] py-4 mb-12 border-b border-accent/20 -mx-6 px-6 shadow-sm transition-colors duration-300">
                <div className="flex justify-start gap-4 md:gap-6 overflow-x-auto no-scrollbar w-full">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-sm uppercase tracking-widest pb-2 transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filtered.map(item => (
                    <MenuCard key={item.id} item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
                ))}
            </div>
            <div className="mt-20 text-center border-t border-primary/10 pt-10">
                <p className="text-secondary mb-6">Need assistance? Speak to our concierge.</p>
                <button onClick={() => setIsChatOpen(true)} className="text-accent font-serif italic text-xl hover:underline">Chat with Jay</button>
            </div>
        </div>
    );
  };
  
  const AboutView = () => {
    useEffect(() => { window.scrollTo(0,0); }, []);
    return (
        <div className="pt-32 pb-20 min-h-screen view-fade-in container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
                <h1 className="font-serif text-5xl md:text-6xl mb-4 text-primary">Our Story & Philosophy</h1>
                <p className="text-accent font-light text-sm tracking-widest uppercase">The heart of Jay's Bistro</p>
            </div>
            <div className="text-secondary space-y-8 text-lg leading-relaxed">
                <p>**Jay's Bistro** was founded on the principle that exceptional food should be complemented by an equally exquisite atmosphere. We drew inspiration from the subtle elegance of Parisian bistros and fused it with the bold, vibrant flavors of West Africa.</p>
                <p>Our menu is a curated journey, highlighting locally sourced ingredients transformed through classic and modern culinary techniques. We believe in simplicity, quality, and presentation that delights both the eye and the palate.</p>
                <p>Join us for an experience where every cup of tea and every dish tells a story of heritage and sophistication. We look forward to welcoming you to our table.</p>
            </div>
            <div className="mt-16 text-center">
                <p className="text-secondary mb-4">Contact us for reservations and events.</p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"><PrimaryButton variant="dark">Make a Reservation</PrimaryButton></a>
            </div>
        </div>
    );
};

  const renderView = () => {
      switch (currentPage) {
          case 'menu': return <MenuView />;
          case 'about': return <AboutView />;
          case 'home': default: return <HomeView />;
      }
  }

  const isDarkNavText = scrolled || currentPage !== 'home';
  const navTextColor = isDarkNavText ? 'var(--color-text)' : 'white';

  return (
    <div className="min-h-screen font-sans">
      <GlobalStyles />
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? 'py-4 shadow-md backdrop-blur-lg' : 'bg-transparent py-6'}`}
        style={{ backgroundColor: scrolled ? 'var(--color-nav-bg)' : 'transparent' }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {currentPage !== 'home' && (
                    <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors" style={{ color: navTextColor }}>
                        <ChevronLeft size={16} /> 
                    </button>
                )}
                <div onClick={() => setCurrentPage('home')} className="cursor-pointer transition-colors duration-500">
					<div className={`w-16 h-16 rounded-full border-2 border-accent flex flex-col items-center justify-center transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'} bg-bg-secondary`} style={{ borderColor: navTextColor }}>
						<span className="font-handwritten leading-none text-xl" style={{ color: navTextColor }}>Jay's</span>
						<span className="font-handwritten leading-none text-xl text-accent">Bistro</span>
					</div>
				</div>
            </div>
            <div className="hidden md:flex items-center gap-10">
                <NavLink page="home" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Home</NavLink>
                <NavLink page="menu" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Menu</NavLink>
                <NavLink page="about" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>About Us</NavLink>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={toggleTheme} className="p-2 transition-colors duration-300 hover:text-accent" style={{ color: navTextColor }} title={`Current theme: ${theme}`}>
                    {theme === 'dark' || (theme === 'system' && document.body.className === 'dark-theme') ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 transition-colors duration-300 hover:text-accent" style={{ color: navTextColor }}>
                    <ShoppingBag size={22} />
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-accent text-orange text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{cartCount}</span>}
                </button>
            </div>
        </div>
      </nav>

      <main>{renderView()}</main>

      <footer className="pt-20 pb-10 border-t" style={{ backgroundColor: FOOTER_BG, color: FOOTER_TEXT_PRIMARY, borderColor: '#333333' }}>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold">Jay's Bistro</h3>
                <p className="text-sm leading-relaxed" style={{ color: FOOTER_TEXT_SECONDARY }}>Defining modern dining with a touch of traditional elegance.</p>
                <div className="flex gap-4">
                    <Instagram size={20} className="hover:text-accent cursor-pointer" />
                    <Twitter size={20} className="hover:text-accent cursor-pointer" />
                    <Facebook size={20} className="hover:text-accent cursor-pointer" />
                </div>
            </div>
            <div>
                <h4 className="font-serif text-accent text-lg mb-6">Visit Us</h4>
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group hover:text-white transition-colors mb-4" style={{ color: FOOTER_TEXT_SECONDARY }}>
                    <MapPin size={18} className="text-accent mt-1 group-hover:scale-110 transition-transform" />
                    <span>**Precious Events**,<br/>Makurdi, Nigeria</span>
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group hover:text-white transition-colors" style={{ color: FOOTER_TEXT_SECONDARY }}>
                    <Phone size={18} className="text-accent group-hover:scale-110 transition-transform" />
                    <span>+234 806 262 4447</span>
                </a>
            </div>
            <div>
                <h4 className="font-serif text-accent text-lg mb-6">Opening Hours</h4>
                <ul className="space-y-3 text-sm" style={{ color: FOOTER_TEXT_SECONDARY }}>
                    <li className="flex justify-between"><span>Mon - Fri</span> <span>08:00 - 22:00</span></li>
                    <li className="flex justify-between"><span>Saturday</span> <span>09:00 - 23:00</span></li>
                    <li className="flex justify-between"><span>Sunday</span> <span>10:00 - 22:00</span></li>
                </ul>
            </div>
            <div>
                <h4 className="font-serif text-accent text-lg mb-6">Newsletter</h4>
                <div className="flex flex-col gap-3">
                    <input type="email" placeholder="Your email address" className={`bg-[#2C2C2C] border-none text-white px-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none`} />
                    <button className={`bg-accent text-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors`}>Subscribe</button>
                </div>
            </div>
        </div>
        <div className="text-center text-xs uppercase tracking-widest pt-8 border-t" style={{ color: FOOTER_TEXT_SECONDARY, borderColor: '#333333' }}>
            © {new Date().getFullYear()} Jay's Bistro. All rights reserved. Designed by Pyrexx.
        </div>
      </footer>

      <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
         <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-bg-secondary shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="font-serif text-2xl text-primary">Your Selection</h2>
                <button onClick={() => setIsCartOpen(false)}><X className="text-secondary hover:text-primary" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-secondary"><ShoppingBag size={48} strokeWidth={1} className="mb-4" /><p>Your tray is empty.</p></div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                             <img src={item.image} className="w-16 h-16 object-cover bg-border" alt={item.name} />
                             <div className="flex-1"><h4 className="font-serif text-lg text-primary">{item.name}</h4><p className="text-accent text-sm">{formatPrice(item.price * item.quantity)}</p></div>
                             <div className="flex items-center border border-border">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-border"><Minus size={14} className="text-primary"/></button>
                                 <span className="w-8 text-center text-sm font-bold text-primary">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-border"><Plus size={14} className="text-primary"/></button>
                             </div>
                        </div>
                    ))
                )}
            </div>
            {cart.length > 0 && (
                <div className="p-8 bg-bg border-t border-border">
                    <div className="flex justify-between mb-6 text-lg font-bold text-primary"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
                    <a href={generateWhatsAppLink(cart)} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#25D366] text-white text-center py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors">Checkout on WhatsApp</a>
                </div>
            )}
         </div>
      </div>

      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-6 right-6 z-50 bg-accent text-primary p-4 rounded-full shadow-xl hover:bg-primary hover:text-accent transition-colors hover:scale-110 duration-300">
        {isChatOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm bg-bg-secondary shadow-2xl rounded-lg overflow-hidden border border-border animate-[fadeIn_0.3s_ease-out]">
             <div className="p-4 flex justify-between items-center" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
                 <span className="font-serif italic">Concierge</span>
                 <span className="text-[10px] uppercase tracking-widest bg-green-500/20 text-green-400 px-2 py-1 rounded animate-pulse">Online</span>
             </div>
             <div className="h-64 p-4 bg-bg overflow-y-auto">
                 <div className="space-y-4">
                    {chatHistory.length === 0 && <div className="text-secondary text-center text-xs mt-4">How can I help you today?</div>}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 text-sm ${msg.role === 'user' ? 'bg-accent text-primary' : 'bg-bg-secondary border border-border text-primary shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                    {isTyping && <div className="text-xs text-secondary italic">Typing...</div>}
                 </div>
             </div>
             <div className="p-3 bg-bg-secondary border-t border-border flex gap-2">
                 <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} placeholder="Ask about our menu..." className="flex-1 bg-transparent text-sm outline-none text-primary" />
                 <button onClick={handleChatSend} className="text-accent hover:text-primary"><Send size={18} /></button>
             </div>
        </div>
      )}
    </div>
  );
};

export default JaysBistro;