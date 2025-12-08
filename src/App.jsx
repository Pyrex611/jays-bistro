import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, MapPin, Phone, ArrowRight, 
  Bot, Send, Menu as MenuIcon, Instagram, Facebook, Twitter, 
  ChevronLeft, Star
} from 'lucide-react';

// --- Styles (Injecting L'Avenue inspired Fonts & Animations) ---
const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
      
      :root {
        --color-cream: #F9F7F2;
        --color-gold: #C5A059;
        --color-black: #1A1A1A;
        --color-green: #2C3E30;
      }

      body { background-color: var(--color-cream); color: var(--color-black); }
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Montserrat', sans-serif; }
      
      .fade-in { animation: fadeIn 0.6s ease-out forwards; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      .btn-morph { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    `}
  </style>
);

// --- Data ---
const MENU_ITEMS = [
  // Curated / Featured (Shown on Home)
  { id: 1, category: "Tea", name: "Classic Arabian Blend", price: 1200, description: "Heritage spice infusion with cardamom and rosewater.", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=800", featured: true },
  { id: 8, category: "Meals", name: "Signature Jollof Risotto", price: 4500, description: "Arborio rice, tomato reduction, grilled beef fillet.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800", featured: true },
  { id: 5, category: "Appetizers", name: "Smoky Goat Pepper Soup", price: 3500, description: "Slow-simmered broth, tender smoked goat, native spices.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", featured: true },
  
  // Full Menu Only
  { id: 2, category: "Tea", name: "Midnight Espresso Tonic", price: 1800, description: "Single-origin espresso, tonic water, orange peel.", image: "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&q=80&w=800" },
  { id: 3, category: "Tea", name: "Hibiscus & Ginger Zobo", price: 1500, description: "Hibiscus petals, fresh ginger, organic honey.", image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=800" },
  { id: 9, category: "Meals", name: "Pesto Shrimp Tagliatelle", price: 6000, description: "Fresh pasta, basil pesto, grilled jumbo shrimp.", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=800" },
  { id: 10, category: "Meals", name: "Pan-Seared Salmon", price: 7500, description: "Atlantic salmon, creamy mash, asparagus.", image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=800" },
  { id: 6, category: "Appetizers", name: "Bistro Chicken Satay", price: 2800, description: "Grilled skewers, peanut dipping sauce.", image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&q=80&w=800" },
  { id: 11, category: "Bites", name: "Spiced Meat Samosa", price: 1500, description: "Crispy pastry, spiced minced lamb.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" },
];

const CATEGORIES = ["All", "Tea", "Appetizers", "Meals", "Bites"];

// --- Utilities ---
const formatPrice = (p) => "₦" + p.toLocaleString();

// --- Components ---

const PrimaryButton = ({ children, onClick, className = '', variant = 'dark' }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300
      ${variant === 'dark' 
        ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' 
        : 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'}
      ${className}
    `}
  >
    {children}
  </button>
);

// The "Smart" Button that morphs into quantity controls
const AddToCartButton = ({ item, cart, addToCart, updateQuantity }) => {
  const cartItem = cart.find(i => i.id === item.id);
  
  if (cartItem) {
    return (
      <div className="flex items-center justify-between bg-[#1A1A1A] text-white px-4 py-3 rounded-none w-full animate-fadeIn">
        <button 
            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
            className="hover:text-[#C5A059] transition-colors"
        >
            <Minus size={16} />
        </button>
        <span className="font-sans font-bold text-sm">{cartItem.quantity}</span>
        <button 
            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
            className="hover:text-[#C5A059] transition-colors"
        >
            <Plus size={16} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => addToCart(item)}
      className="w-full bg-white border border-[#1A1A1A] text-[#1A1A1A] py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
    >
      Add to Order
    </button>
  );
};

const MenuCard = ({ item, cart, addToCart, updateQuantity }) => (
  <div className="group bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-[#C5A059]/30">
    <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-gray-100">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
        {item.category}
      </div>
    </div>
    
    <div className="text-center mb-4">
      <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">{item.name}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-3 h-10 line-clamp-2 px-2">{item.description}</p>
      <span className="block text-[#C5A059] font-serif font-bold text-lg italic">
        {formatPrice(item.price)}
      </span>
    </div>

    {/* The Innovation: Button changes state in-place */}
    <div className="px-2 pb-2">
        <AddToCartButton 
            item={item} 
            cart={cart} 
            addToCart={addToCart} 
            updateQuantity={updateQuantity} 
        />
    </div>
  </div>
);

// --- Main Application ---
const JaysBistro = () => {
  // State
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'menu'
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart Logic
  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
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

  // --- Views ---

  // 1. Home View
  const HomeView = () => (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-60">
            <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover" alt="Hero" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
            <p className="text-[#C5A059] text-xs font-bold tracking-[0.3em] uppercase mb-6">Est. 2024</p>
            <h1 className="font-serif text-6xl md:text-8xl mb-8 leading-tight">Taste the <br/><span className="italic text-[#C5A059]">Extraordinary</span></h1>
            <PrimaryButton onClick={() => setCurrentPage('menu')} className="bg-white text-black hover:bg-[#C5A059] hover:text-white">
                View Full Menu
            </PrimaryButton>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase">The Experience</span>
        <h2 className="font-serif text-4xl text-[#1A1A1A] mt-4 mb-8">Where atmosphere meets culinary art</h2>
        <p className="text-gray-500 leading-loose font-light">
            Jay's Bistro is an ode to the finer things. We believe dining is not just about sustenance, but about the rhythm of the evening, the clinking of glasses, and the silent language of great service.
        </p>
      </section>

      {/* Favorites (Partial Menu) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="font-serif text-3xl text-[#1A1A1A]">Curated Favorites</h2>
                    <p className="text-gray-400 text-sm mt-2">A glimpse into our kitchen.</p>
                </div>
                <button onClick={() => setCurrentPage('menu')} className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#C5A059] transition-colors">
                    See All <ArrowRight size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {MENU_ITEMS.filter(i => i.featured).map(item => (
                    <MenuCard key={item.id} item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
                ))}
            </div>

            <div className="mt-12 text-center md:hidden">
                 <PrimaryButton onClick={() => setCurrentPage('menu')} variant="outline">View Full Menu</PrimaryButton>
            </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-6 container mx-auto">
        <div className="text-center mb-12">
             <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase">Ambience</span>
             <h2 className="font-serif text-4xl mt-2">Visual Chronicle</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-2 row-span-2 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
            </div>
            <div className="col-span-1 row-span-2 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
            </div>
        </div>
      </section>
    </div>
  );

  // 2. Menu View
  const MenuView = () => {
    const filtered = activeCategory === "All" ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === activeCategory);
    
    // Auto scroll to top when mounting menu
    useEffect(() => { window.scrollTo(0,0); }, []);

    return (
        <div className="pt-32 pb-20 min-h-screen fade-in container mx-auto px-6">
            <div className="text-center mb-16">
                <h1 className="font-serif text-5xl md:text-6xl mb-4">Our Collection</h1>
                <p className="text-gray-500 font-light max-w-xl mx-auto">Discover flavors crafted with passion, from our signature teas to our fusion entrees.</p>
            </div>

            {/* Sticky Categories */}
            <div className="sticky top-24 z-30 bg-[#F9F7F2]/95 backdrop-blur py-4 mb-12 border-b border-[#C5A059]/20 flex justify-center gap-6 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm uppercase tracking-widest pb-2 transition-all ${activeCategory === cat ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-gray-400 hover:text-black'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {filtered.map(item => (
                    <MenuCard key={item.id} item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
                ))}
            </div>

            <div className="mt-20 text-center border-t border-gray-200 pt-10">
                <p className="text-gray-400 mb-6">Not sure what to pick? Ask our concierge.</p>
                <button onClick={() => setIsChatOpen(true)} className="text-[#C5A059] font-serif italic text-xl hover:underline">Chat with Jay</button>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-[#F9F7F2] text-[#1A1A1A]">
      <GlobalStyles />
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
            {/* Left */}
            <div className="flex items-center gap-6">
                 {currentPage === 'menu' && (
                    <button onClick={() => setCurrentPage('home')} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${scrolled || currentPage === 'menu' ? 'text-black' : 'text-white'}`}>
                        <ChevronLeft size={16} /> Back
                    </button>
                 )}
            </div>

            {/* Center Logo */}
            <div 
                className={`text-2xl font-serif font-bold tracking-tighter absolute left-1/2 -translate-x-1/2 cursor-pointer ${scrolled || currentPage === 'menu' ? 'text-black' : 'text-white'}`}
                onClick={() => setCurrentPage('home')}
            >
                Jay's <span className="text-[#C5A059]">Bistro</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className={`relative p-2 ${scrolled || currentPage === 'menu' ? 'text-black' : 'text-white'}`}
                >
                    <ShoppingBag size={22} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </nav>

      {/* Dynamic Page Rendering */}
      {currentPage === 'home' ? <HomeView /> : <MenuView />}

      {/* Info Bar (L'Avenue Style Sticky Footer/Info) */}
      <div className="bg-[#1A1A1A] text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div className="space-y-2">
                <h4 className="font-serif text-[#C5A059] italic text-xl">Reservations</h4>
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <Phone size={18} className="text-[#C5A059]" />
                    <span className="tracking-widest text-sm">+234 800 123 4567</span>
                </div>
            </div>

            <div className="text-center">
                <span className="font-serif text-2xl font-bold">Jay's Bistro</span>
                <div className="flex justify-center gap-4 mt-4 text-gray-400">
                    <Instagram size={18} className="hover:text-[#C5A059] cursor-pointer" />
                    <Twitter size={18} className="hover:text-[#C5A059] cursor-pointer" />
                    <Facebook size={18} className="hover:text-[#C5A059] cursor-pointer" />
                </div>
            </div>

            <div className="space-y-2 text-center md:text-right">
                <h4 className="font-serif text-[#C5A059] italic text-xl">Location</h4>
                <div className="flex items-center justify-center md:justify-end gap-3">
                    <span className="tracking-widest text-sm">Plot 42, Victoria Island, Lagos</span>
                    <MapPin size={18} className="text-[#C5A059]" />
                </div>
            </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         {/* Backdrop */}
         <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsCartOpen(false)}
         />
         
         {/* Drawer */}
         <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-serif text-2xl">Your Selection</h2>
                <button onClick={() => setIsCartOpen(false)}><X className="text-gray-400 hover:text-black" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                        <p>Your tray is empty.</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                             <img src={item.image} className="w-16 h-16 object-cover bg-gray-100" />
                             <div className="flex-1">
                                 <h4 className="font-serif text-lg">{item.name}</h4>
                                 <p className="text-[#C5A059] text-sm">{formatPrice(item.price * item.quantity)}</p>
                             </div>
                             <div className="flex items-center border border-gray-200">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-100"><Minus size={14}/></button>
                                 <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-100"><Plus size={14}/></button>
                             </div>
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div className="p-8 bg-gray-50">
                    <div className="flex justify-between mb-6 text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <PrimaryButton className="w-full">Proceed to Checkout</PrimaryButton>
                </div>
            )}
         </div>
      </div>

      {/* Concierge Chat Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-white p-4 rounded-full shadow-xl hover:bg-[#1A1A1A] transition-colors"
      >
        {isChatOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-100 fade-in">
             <div className="bg-[#1A1A1A] p-4 text-white flex justify-between items-center">
                 <span className="font-serif italic">Concierge</span>
                 <span className="text-[10px] uppercase tracking-widest bg-green-500/20 text-green-400 px-2 py-1 rounded">Online</span>
             </div>
             <div className="h-64 p-4 bg-[#F9F7F2] overflow-y-auto">
                 <div className="flex justify-start">
                     <div className="bg-white border border-gray-200 p-3 max-w-[80%] text-sm shadow-sm">
                         Hello. How may I assist you with your dining experience today?
                     </div>
                 </div>
             </div>
             <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                 <input placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none" />
                 <button className="text-[#C5A059]"><Send size={18} /></button>
             </div>
        </div>
      )}

    </div>
  );
};

export default JaysBistro;