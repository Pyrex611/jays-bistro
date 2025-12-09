import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, MapPin, Phone, ArrowRight, 
  Bot, Send, Menu as MenuIcon, Instagram, Facebook, Twitter, 
  ChevronLeft, Star, Clock, Sun, Moon 
} from 'lucide-react';

// --- Configuration ---
const WHATSAPP_NUMBER = "2348001234567"; 
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Plot+42+Victoria+Island+Lagos";
const CHATBOT_API_KEY = ""; 

// --- Data ---
const MENU_ITEMS = [
  // Curated / Featured (Shown on Hero & Home)
  { id: 8, category: "Meals", name: "Signature Jollof Risotto", price: 4500, description: "Arborio rice, tomato reduction, grilled beef fillet.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 10, category: "Meals", name: "Pan-Seared Salmon", price: 7500, description: "Atlantic salmon, creamy mash, asparagus.", image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 1, category: "Tea", name: "Classic Arabian Blend", price: 1200, description: "Heritage spice infusion with cardamom and rosewater.", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=1920", featured: true },
  
  // Full Menu
  { id: 5, category: "Appetizers", name: "Smoky Goat Pepper Soup", price: 3500, description: "Slow-simmered broth, tender smoked goat, native spices.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
  { id: 2, category: "Tea", name: "Midnight Espresso Tonic", price: 1800, description: "Single-origin espresso, tonic water, orange peel.", image: "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&q=80&w=800" },
  { id: 3, category: "Tea", name: "Hibiscus & Ginger Zobo", price: 1500, description: "Hibiscus petals, fresh ginger, organic honey.", image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=800" },
  { id: 9, category: "Meals", name: "Pesto Shrimp Tagliatelle", price: 6000, description: "Fresh pasta, basil pesto, grilled jumbo shrimp.", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=800" },
  { id: 6, category: "Appetizers", name: "Bistro Chicken Satay", price: 2800, description: "Grilled skewers, peanut dipping sauce.", image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&q=80&w=800" },
  { id: 11, category: "Bites", name: "Spiced Meat Samosa", price: 1500, description: "Crispy pastry, spiced minced lamb.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" },
];

const CATEGORIES = ["All", "Tea", "Appetizers", "Meals", "Bites"];

// Hardcoded colors for the permanent dark footer
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
    message += `\n\nPlease confirm availability and address details.`;
    
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// --- Components ---

const PrimaryButton = ({ children, onClick, className = '', variant = 'dark' }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300
      bg-[var(--color-primary-button-bg)] text-[var(--color-primary-button-text)]
      hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]
      ${variant === 'outline' ? 'bg-transparent border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-black' : ''}
      ${className}
    `}
  >
    {children}
  </button>
);

const AddToCartButton = ({ item, cart, addToCart, updateQuantity }) => {
  const cartItem = cart.find(i => i.id === item.id);
  
  if (cartItem) {
    return (
      <div className="flex items-center justify-between bg-[var(--color-text)] text-[var(--color-bg)] px-3 py-2 w-full animate-pulse">
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="hover:text-[var(--color-accent)]"><Minus size={14} /></button>
        <span className="font-sans font-bold text-sm">{cartItem.quantity}</span>
        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="hover:text-[var(--color-accent)]"><Plus size={14} /></button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => addToCart(item)}
      className="w-full bg-transparent border border-[var(--color-text)] text-[var(--color-text)] py-2 text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-text)] hover:text-[var(--color-bg-secondary)] transition-all duration-300"
    >
      Add
    </button>
  );
};

const MenuCard = ({ item, cart, addToCart, updateQuantity }) => (
  <div className="group bg-bg-secondary p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-[var(--color-accent)]/30">
    <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-[var(--color-border)]">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
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

// New Component for Nav Links
const NavLink = ({ page, current, setPage, scrolled, children, theme }) => {
    const isDarkBackground = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const defaultColor = (scrolled || current !== 'home') ? 'var(--color-text)' : (isDarkBackground ? 'var(--color-text)' : 'white');

    return (
        <button
            onClick={() => setPage(page)}
            className={`
                text-xs font-bold uppercase tracking-widest transition-colors duration-300 relative pb-1
                ${current === page ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]/80'}
            `}
            style={{ color: defaultColor }}
        >
            {children}
        </button>
    );
};

// --- Styles (Injecting L'Avenue inspired Fonts & Animations) ---
const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
      
      /* Base Accent Color */
      :root {
        --color-accent: #C5A059; /* Gold */
      }
      
      /* LIGHT MODE DEFINITIONS */
      .light-theme {
        --color-bg: #F9F7F2; /* Cream */
        --color-text: #1A1A1A; /* Black */
        --color-bg-secondary: #FFFFFF;
        --color-text-secondary: #555555;
        --color-border: #EEEEEE;
        --color-nav-bg: rgba(255, 255, 255, 0.95);
        --color-hero-overlay: rgba(26, 26, 26, 0.6);
        --color-primary-button-bg: #1A1A1A;
        --color-primary-button-text: #FFFFFF;
      }

      /* DARK MODE DEFINITIONS */
      .dark-theme {
        --color-bg: #1A1A1A; /* Dark Charcoal */
        --color-text: #F9F7F2; /* Cream Text */
        --color-bg-secondary: #2C2C2C;
        --color-text-secondary: #AAAAAA;
        --color-border: #333333;
        --color-nav-bg: rgba(26, 26, 26, 0.95);
        --color-hero-overlay: rgba(0, 0, 0, 0.5);
        --color-primary-button-bg: #C5A059;
        --color-primary-button-text: #1A1A1A;
      }

      body { 
        background-color: var(--color-bg); 
        color: var(--color-text); 
        overflow-x: hidden; 
        transition: background-color 0.5s ease; /* Smooth transition */
        -webkit-overflow-scrolling: touch; 
      }
      
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Montserrat', sans-serif; }
      
      /* Utility classes using variables */
      .text-primary { color: var(--color-text); }
      .bg-primary { background-color: var(--color-bg); }
      .bg-secondary { background-color: var(--color-bg-secondary); }
      .text-secondary { color: var(--color-text-secondary); }
      .border-primary { border-color: var(--color-border); }
      .text-accent { color: var(--color-accent); }
      
      /* Smooth View Transitions (FAST FADE-IN) */
      .view-fade-in { animation: fadeInPage 0.4s ease-out forwards; }
      @keyframes fadeInPage { from { opacity: 0; } to { opacity: 1; } }

      /* Hero Animation FIX: will-change helps mitigate blinking/jank */
      .ken-burns { animation: kenBurns 20s infinite alternate; will-change: transform; }
      @keyframes kenBurns { from { transform: scale(1); } to { transform: scale(1.15); } }
      
      /* Hide Scrollbar for clean UI */
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
  // Theme State: 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system'); 

  // Hero Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = MENU_ITEMS.filter(item => item.featured).slice(0, 3); 

  // --- Theme Logic ---
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
        // Simple manual cycle: system -> light -> dark -> system
        if (prev === 'system') newTheme = 'light';
        else if (prev === 'light') newTheme = 'dark';
        else newTheme = 'system';
        
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
  };

  // Effect to apply theme on load and state change
  useEffect(() => {
    applyTheme(theme);
    // Listen for system theme changes if set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
        if (theme === 'system') {
            applyTheme('system');
        }
    };
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [theme]);
  // --- End Theme Logic ---


  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Chat Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Cart Logic
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

  // Chat API Logic
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    const apiKey = CHATBOT_API_KEY; 
    
    // Safety check: if no API key is set, give a friendly message.
    if (!apiKey) {
        setChatHistory(prev => [...prev, { role: 'model', text: "I'm a simulated concierge. Please set a valid API key to enable live chat functionality. For orders, please use the WhatsApp link in the cart." }]);
        setIsTyping(false);
        return;
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are the concierge at Jay's Bistro. Answer politely, chic, and sophisticated. Current Menu: ${MENU_ITEMS.map(i => i.name).join(', ')}.`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\nUser: " + chatInput }] }]
            })
        });
        
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to connect right now. We may be experiencing a high volume of requests.";
        
        setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please try WhatsApp for immediate service." }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- Views ---

  const HeroSection = () => (
    <section className="relative h-screen flex items-end justify-end bg-bg-secondary overflow-hidden">
        {heroSlides.map((slide, index) => (
            <div 
                key={slide.id}
                // Use CSS variable for the overlay opacity
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                style={{ backgroundColor: index === currentSlide ? 'var(--color-hero-overlay)' : 'transparent'}}
            >
                <img 
                    src={slide.image} 
                    className={`w-full h-full object-cover ${index === currentSlide ? 'ken-burns' : ''}`} 
                    alt="Hero" 
                    style={{ opacity: index === currentSlide ? '0.6' : '0' }} 
                />
            </div>
        ))}
        
        {/* Overlay Content */}
        <div className="relative z-20 w-full h-full flex flex-col justify-center items-center text-center px-4">
             <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-6 animate-[fadeIn_1s_ease-out]">
                Welcome to Jay's Bistro
             </p>
             <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight max-w-4xl mx-auto animate-[fadeIn_1s_ease-out_0.2s_both]">
                {heroSlides[currentSlide].name}
             </h1>
        </div>

        {/* Bottom Right Order Button */}
        <div className="absolute bottom-12 right-6 md:right-12 z-30 animate-[slideInRight_0.5s_ease-out]">
            <div className="bg-bg-secondary/10 backdrop-blur-md border border-white/20 p-6 rounded-none max-w-xs text-left">
                <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">Featured Dish</p>
                <h3 className="text-white font-serif text-xl mb-4">{heroSlides[currentSlide].name}</h3>
                <button 
                    onClick={() => addToCart(heroSlides[currentSlide])}
                    className="flex items-center gap-3 bg-accent text-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                    Order Now <ArrowRight size={16} />
                </button>
            </div>
        </div>
    </section>
  );

  const HomeView = () => (
    <div className="view-fade-in">
      <HeroSection />
      
      {/* Intro */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">The Experience</span>
        <h2 className="font-serif text-4xl text-primary mt-4 mb-8">Where atmosphere meets culinary art</h2>
        <p className="text-secondary leading-loose font-light">
            Nestled in Victoria Island, we offer an escape from the bustling city. Inspired by chic Parisian cafes and the vibrant flavors of Lagos.
        </p>
      </section>

      {/* Favorites (Partial Menu) - COMPACT LIST */}
      <section className="py-20 bg-bg-secondary">
        <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="font-serif text-3xl text-primary">Curated Favorites</h2>
                    <p className="text-secondary text-sm mt-2">A glimpse into our kitchen.</p>
                </div>
            </div>
            
            {/* Compact List Layout with Price and Button side-by-side (responsive) */}
            <div className="space-y-8 max-w-3xl mx-auto"> 
                {heroSlides.map(item => ( // Only 3 featured items
                    <div key={item.id} className="pb-8 border-b border-primary/10 flex items-start gap-4">
                        
                        {/* Mini Picture/Thumbnail */}
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover flex-shrink-0 rounded-sm"
                        />
                        
                        <div className="flex flex-1 justify-between items-start">
                            {/* Dish Name & Description */}
                            <div className="w-full"> {/* Removed md:w-3/5 for better mobile text space */}
                                <h3 className="font-serif text-xl font-medium text-primary">{item.name}</h3>
                                <p className="text-secondary text-sm leading-relaxed mt-1">{item.description}</p>
                            </div>

                            {/* Price and Button Group - Responsive Layout */}
                            <div className="flex flex-col items-end gap-2 min-w-[150px] justify-end md:flex-row md:items-center md:gap-4 md:min-w-[200px] ml-4 flex-shrink-0">
                                {/* Price */}
                                <span className="text-accent font-serif font-bold text-lg italic">{formatPrice(item.price)}</span>
                                {/* Button Container (fixed width for consistency) */}
                                <div className="w-24 mt-2 md:mt-0"> 
                                    <AddToCartButton 
                                        item={item} 
                                        cart={cart} 
                                        addToCart={addToCart} 
                                        updateQuantity={updateQuantity} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show Full Menu Button */}
            <div className="mt-12 text-center">
                 <PrimaryButton onClick={() => setCurrentPage('menu')} variant="outline">
                    Show Full Menu
                    <ArrowRight size={16} className="ml-2 inline" />
                 </PrimaryButton>
            </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-24 px-4 container mx-auto">
          <div className="text-center mb-12">
             <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Ambience</span>
             <h2 className="font-serif text-4xl mt-2 text-primary">Visual Chronicle</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 h-[500px]">
              <div className="col-span-2 row-span-2 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-1 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-2 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
              <div className="col-span-1 row-span-1 relative overflow-hidden group"><img src="https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" /></div>
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

            {/* Sticky Categories */}
            <div className="sticky top-16 z-30 bg-bg/95 backdrop-blur py-4 mb-12 flex justify-center gap-6 overflow-x-auto no-scrollbar border-b border-accent/20">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)} 
                        className={`text-sm uppercase tracking-widest pb-2 transition-all whitespace-nowrap ${activeCategory === cat ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'}`}
                    >
                        {cat}
                    </button>
                ))}
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
                <p>
                    **Jay's Bistro** was founded on the principle that exceptional food should be complemented by an equally exquisite atmosphere. We drew inspiration from the subtle elegance of Parisian bistros and fused it with the bold, vibrant flavors of West Africa.
                </p>
                <p>
                    Our menu is a curated journey, highlighting locally sourced ingredients transformed through classic and modern culinary techniques. We believe in simplicity, quality, and presentation that delights both the eye and the palate.
                </p>
                <p>
                    Join us for an experience where every cup of tea and every dish tells a story of heritage and sophistication. We look forward to welcoming you to our table.
                </p>
            </div>

            <div className="mt-16 text-center">
                <p className="text-secondary mb-4">Contact us for reservations and events.</p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <PrimaryButton variant="dark">Make a Reservation</PrimaryButton>
                </a>
            </div>
        </div>
    );
};

  const renderView = () => {
      switch (currentPage) {
          case 'menu':
              return <MenuView />;
          case 'about':
              return <AboutView />;
          case 'home':
          default:
              return <HomeView />;
      }
  }

  // Helper to determine icon color (white on transparent hero, black/primary on scroll/sub-pages)
  const isDarkNavText = scrolled || currentPage !== 'home';
  const navTextColor = isDarkNavText ? 'var(--color-text)' : 'white';


  return (
    <div className="min-h-screen font-sans">
      <GlobalStyles />
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${scrolled ? 'py-4 shadow-sm' : 'bg-transparent py-6'}`}
        style={{ backgroundColor: scrolled ? 'var(--color-nav-bg)' : 'transparent' }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
            
            {/* LEFT: Logo/Title Group */}
            <div className="flex items-center gap-4">
                {/* Back Button (Mobile/Sub-Pages) */}
                {currentPage !== 'home' && (
                    <button 
                        onClick={() => setCurrentPage('home')} 
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors"
                        style={{ color: navTextColor }}
                    >
                        <ChevronLeft size={16} /> 
                    </button>
                )}
                
                {/* Logo & Text */}
                <div 
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center gap-2 cursor-pointer transition-colors duration-500"
                >
                    {/* Placeholder Logo Icon */}
                    <div className={`w-5 h-5 border-2 border-accent flex items-center justify-center transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                        <Star size={12} className="text-accent" />
                    </div> 
                    <div 
                        className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500`}
                        style={{ color: navTextColor }}
                    >
                        Jay's <span className="text-accent">Bistro</span>
                    </div>
                </div>
            </div>

            {/* CENTER: Navigation Links (Desktop Only) */}
            <div className="hidden md:flex items-center gap-10">
                <NavLink page="home" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Home</NavLink>
                <NavLink page="menu" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Menu</NavLink>
                <NavLink page="about" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>About Us</NavLink>
            </div>

            {/* RIGHT: Cart/Utility */}
            <div className="flex items-center gap-6">
                
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 transition-colors duration-500 hover:text-accent"
                    style={{ color: navTextColor }}
                    title={`Current theme: ${theme}. Click to switch.`}
                >
                    {theme === 'dark' || (theme === 'system' && document.body.className === 'dark-theme') ? <Sun size={22} /> : <Moon size={22} />}
                </button>

                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 transition-colors duration-500 hover:text-accent"
                    style={{ color: navTextColor }}
                >
                    <ShoppingBag size={22} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
          {renderView()}
      </main>

      {/* Expanded Footer (Fixed Dark Theme) */}
      <footer 
        className="pt-20 pb-10 border-t" 
        style={{ backgroundColor: FOOTER_BG, color: FOOTER_TEXT_PRIMARY, borderColor: '#333333' }}
      >
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
                    <span>Plot 42, **Victoria Island**,<br/>Lagos, Nigeria</span>
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group hover:text-white transition-colors" style={{ color: FOOTER_TEXT_SECONDARY }}>
                    <Phone size={18} className="text-accent group-hover:scale-110 transition-transform" />
                    <span>+234 800 123 4567</span>
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
                    {/* Hardcoded inputs for dark mode styling */}
                    <input type="email" placeholder="Your email address" className="bg-[#2C2C2C] border-none text-white px-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none" />
                    <button className="bg-accent text-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Subscribe</button>
                </div>
            </div>
        </div>
        <div className="text-center text-xs uppercase tracking-widest pt-8 border-t" style={{ color: FOOTER_TEXT_SECONDARY, borderColor: '#333333' }}>
            © {new Date().getFullYear()} Jay's Bistro. All rights reserved.
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
         <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-bg-secondary shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="font-serif text-2xl text-primary">Your Selection</h2>
                <button onClick={() => setIsCartOpen(false)}><X className="text-secondary hover:text-primary" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-secondary">
                        <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                        <p>Your tray is empty.</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                             <img src={item.image} className="w-16 h-16 object-cover bg-border" alt={item.name} />
                             <div className="flex-1">
                                 <h4 className="font-serif text-lg text-primary">{item.name}</h4>
                                 <p className="text-accent text-sm">{formatPrice(item.price * item.quantity)}</p>
                             </div>
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
                    <div className="flex justify-between mb-6 text-lg font-bold text-primary">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <a 
                        href={generateWhatsAppLink(cart)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-[#25D366] text-white text-center py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors"
                    >
                        Checkout on WhatsApp
                    </a>
                </div>
            )}
         </div>
      </div>

      {/* Concierge Chat Bot */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-6 right-6 z-50 bg-accent text-primary p-4 rounded-full shadow-xl hover:bg-primary hover:text-accent transition-colors hover:scale-110 duration-300">
        {isChatOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm bg-bg-secondary shadow-2xl rounded-lg overflow-hidden border border-border animate-[fadeIn_0.3s_ease-out]">
             {/* Chatbot Header - Inverted Colors for Contrast */}
             <div className="p-4 flex justify-between items-center" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
                 <span className="font-serif italic">Concierge</span>
                 <span className="text-[10px] uppercase tracking-widest bg-green-500/20 text-green-400 px-2 py-1 rounded animate-pulse">Online</span>
             </div>
             
             {/* Chat Messages Body */}
             <div className="h-64 p-4 bg-bg overflow-y-auto">
                 <div className="space-y-4">
                    {chatHistory.length === 0 && <div className="text-secondary text-center text-xs mt-4">How can I help you today?</div>}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-bg' : 'bg-bg-secondary border border-border text-primary shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                    {isTyping && <div className="text-xs text-secondary italic">Typing...</div>}
                 </div>
             </div>
             
             {/* Chat Input */}
             <div className="p-3 bg-bg-secondary border-t border-border flex gap-2">
                 <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Ask about our menu..." 
                    className="flex-1 bg-transparent text-sm outline-none text-primary" 
                 />
                 <button onClick={handleChatSend} className="text-accent hover:text-primary"><Send size={18} /></button>
             </div>
        </div>
      )}
    </div>
  );
};

export default JaysBistro;