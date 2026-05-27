import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, X, Plus, Minus, MapPin, 
  Bot, Send, Search, Home as HomeIcon, 
  Menu as MenuIcon, SlidersHorizontal, ChevronLeft, Check
} from 'lucide-react';

// --- Image Assets ---
import isiEwuImg from './assets/images/Isi-Ewu.jpg';
import arabianImg from './assets/images/classic-arabian.jpg';
import ceasarImg from './assets/images/IMG_2113.PNG';
import basmatiImg from './assets/images/IMG_2134.PNG';
import samosaImg from './assets/images/IMG_2135.PNG';
import bunsImg from './assets/images/IMG_2136.PNG';
import jollofImg from './assets/images/IMG_2138.PNG';
import yamEggImg from './assets/images/IMG_1989.PNG'; 

// --- Configuration & Data ---
const WHATSAPP_NUMBER = "2348062624447"; 
const CHATBOT_API_KEY = "PLACEHOLDER_GEMINI_API_KEY_A1B2C3D4E5F6G7H8I9"; 

const CATEGORIES = [
  { name: "All", icon: "🍽️" },
  { name: "Meals", icon: "🍛" },
  { name: "Protein", icon: "🥩" },
  { name: "Starters", icon: "🥟" },
  { name: "Bites", icon: "🍔" },
  { name: "Beverages", icon: "🥤" },
  { name: "Soups", icon: "🥣" }
];

const MENU_ITEMS = [
  { id: 36, category: "Meals", name: "Basmati Fried Rice", price: 3500, description: "Premium long-grain Basmati stir-fry.", image: basmatiImg, featured: true },
  { id: 3, category: "Beverages", name: "Classic Arabian Blend", price: 3000, description: "Heritage spice infusion with cardamom.", image: arabianImg, featured: true },
  { id: 1, category: "Meals", name: "Party Jollof Rice", price: 1500, description: "Signature smoky party jollof with grilled beef.", image: jollofImg, featured: true },
  { id: 2, category: "Protein", name: "Isi-ewu", price: 6000, description: "Traditional spicy goat head delicacy.", image: isiEwuImg, featured: true },
  { id: 12, category: "Starters", name: "Spiced Meat Samosa", price: 1500, description: "Crispy pastry filled with spiced minced meat.", image: samosaImg },
  { id: 14, category: "Starters", name: "Puff Puff", price: 1500, description: "Classic Nigerian sweet fried dough balls.", image: bunsImg },
  { id: 25, category: "Bites", name: "Chicken Caesar Salad", price: 7000, description: "Fresh greens, grilled chicken breast, and croutons.", image: ceasarImg },
  { id: 48, category: "Meals", name: "Yam and Egg Sauce", price: 3000, description: "Boiled yam paired with savory egg sauce.", image: yamEggImg },
  { id: 51, category: "Protein", name: "Bistro Chicken Wings", price: 5000, description: "Succulent grilled wings in bistro glaze.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800" },
  { id: 21, category: "Bites", name: "Chicken Shawarma", price: 3500, description: "Creamy Chicken shawarma with Single Sausage.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800" },
  { id: 19, category: "Bites", name: "6' Personal Pizza", price: 12000, description: "Personal size pizza loaded with cheese.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
  { id: 62, category: "Soups", name: "Egusi Soup", price: 500, description: "Traditional rich and loaded melon soup.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
];

// Pastel colors for the popular food cards matching the reference image
const CARD_COLORS = ['bg-[#E6EEA9]', 'bg-[#C3E0F5]', 'bg-[#FDE2B4]', 'bg-[#FAD9D5]'];

// --- Utility Functions ---
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

// ==========================================
// SHARED COMPONENTS
// ==========================================

const FoodImage = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    return (
      <img 
        src={error ? `https://placehold.co/400x400/E7E5E4/D97706?text=${encodeURIComponent(alt)}` : src} 
        alt={alt} 
        className={className} 
        loading="lazy" 
        onError={() => setError(true)} 
      />
    );
};

// Top Navigation Bar (Avatar, Location, Cart Top-right)
const TopBar = ({ setIsCartOpen, cartCount, cartBounce }) => (
    <div className="flex justify-between items-center py-4 px-6 bg-[#F9F8F4] sticky top-0 z-30">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200 bg-white shadow-sm flex items-center justify-center">
            {/* User requested jsys_logo.jpg for the logo/favicon replacement */}
            <img src="/jsys_logo.jpg" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1A1A1A/FFFFFF?text=JB"; }} />
        </div>
        
        <div className="flex flex-col items-center justify-center">
            <span className="text-stone-400 text-xs flex items-center gap-1"><MapPin size={12}/> Location</span>
            <span className="font-bold text-sm text-stone-800">Makurdi, NG </span>
        </div>
        
        <button 
            onClick={() => setIsCartOpen(true)} 
            className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center relative shadow-sm hover:shadow-md transition-shadow"
        >
            <ShoppingBag size={20} className="text-stone-800" />
            {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transition-transform ${cartBounce ? 'scale-125' : 'scale-100'}`}>
                    {cartCount}
                </span>
            )}
        </button>
    </div>
);

// Floating Black Bottom Navigation (Reference Image Replica)
const BottomNav = ({ isCartOpen, setIsCartOpen, isChatOpen, setIsChatOpen, cartCount }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const NavItem = ({ icon, label, active, onClick, badge }) => (
        <button 
            onClick={onClick}
            className={`relative flex items-center gap-2 p-3 rounded-full transition-all duration-300 ${active ? 'bg-white text-stone-900 px-5' : 'text-stone-400 hover:text-white'}`}
        >
            {icon}
            {active && <span className="text-sm font-bold tracking-wide animate-[fadeIn_0.2s_ease-in]">{label}</span>}
            {!active && badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
        </button>
    );

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] p-2 rounded-full flex items-center gap-1 sm:gap-2 z-40 shadow-2xl">
            <NavItem icon={<HomeIcon size={20} />} label="Home" active={pathname === '/'} onClick={() => navigate('/')} />
            <NavItem icon={<MenuIcon size={20} />} label="Menu" active={pathname === '/menu'} onClick={() => navigate('/menu')} />
            <NavItem icon={<Search size={20} />} label="Search" active={false} onClick={() => { navigate('/menu'); setTimeout(() => document.getElementById('menu-search')?.focus(), 100); }} />
            <NavItem icon={<ShoppingBag size={20} />} label="Cart" active={isCartOpen} onClick={() => setIsCartOpen(true)} badge={cartCount} />
            <NavItem icon={<Bot size={20} />} label="AI" active={isChatOpen} onClick={() => setIsChatOpen(true)} />
        </div>
    );
};

// ==========================================
// VIEWS
// ==========================================

const HomeView = ({ cart, updateQuantity, navigate }) => {
    const popularItems = MENU_ITEMS.filter(item => item.featured).slice(0, 4);

    return (
        <div className="pb-32 px-6 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl view-fade-in">
            {/* Main Hero Text */}
            <div className="mt-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.1] tracking-tight">
                    Get Your Favorite<br/>Dishes Delivered Fresh
                </h1>
            </div>

            {/* Search Bar */}
            <div 
                onClick={() => { navigate('/menu'); setTimeout(() => document.getElementById('menu-search')?.focus(), 100); }}
                className="bg-white rounded-full p-1 pl-4 flex items-center shadow-sm border border-stone-100 mb-8 cursor-text"
            >
                <Search size={20} className="text-stone-400" />
                <div className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-stone-400 text-sm">
                    Search your cravings...
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center mr-1 text-stone-600">
                    <SlidersHorizontal size={16} />
                </div>
            </div>

            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-[#E1ECA9] to-[#F1F0C4] rounded-3xl p-6 flex items-center justify-between shadow-sm mb-8 relative overflow-hidden">
                <div className="z-10 w-2/3">
                    <h2 className="text-2xl font-bold text-stone-900 leading-tight mb-4">
                        Order a set With<br/>40% discount
                    </h2>
                    <button onClick={() => navigate('/menu')} className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-stone-800 transition-colors">
                        Order Now
                    </button>
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 opacity-90">
                    <FoodImage src={bunsImg} className="w-full h-full object-contain drop-shadow-2xl" alt="Promo" />
                </div>
            </div>

            {/* Categories Section */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-xl text-stone-900">Category</h3>
                    <button onClick={() => navigate('/menu')} className="text-xs font-bold text-stone-500 hover:text-stone-900">See All</button>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-6 px-6">
                    {CATEGORIES.map((cat, idx) => (
                        <button 
                            key={cat.name} 
                            onClick={() => navigate('/menu', { state: { category: cat.name } })}
                            className={`whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all shadow-sm flex-shrink-0 border ${
                                idx === 1 ? 'bg-gradient-to-r from-[#E1ECA9] to-[#F1F0C4] border-transparent text-stone-900' : 'bg-white text-stone-700 border-stone-100'
                            }`}
                        >
                            <span className="text-lg leading-none">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Popular Food Section */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-xl text-stone-900">Popular Food</h3>
                    <button onClick={() => navigate('/menu')} className="text-xs font-bold text-stone-500 hover:text-stone-900">See All</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {popularItems.map((item, index) => {
                        const bgClass = CARD_COLORS[index % CARD_COLORS.length];
                        const quantity = cart.find(i => i.id === item.id)?.quantity || 0;
                        
                        return (
                            <div key={item.id} className={`${bgClass} rounded-[2rem] p-4 flex flex-col relative overflow-hidden group shadow-sm transition-transform hover:scale-[1.02]`}>
                                <div className="h-32 mb-4 mt-2 w-full flex items-center justify-center relative">
                                    <FoodImage src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="w-2/3">
                                        <h4 className="font-bold text-stone-900 text-sm leading-tight mb-1">{item.name}</h4>
                                        <p className="font-bold text-stone-700 text-xs">{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="z-10">
                                        {quantity === 0 ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1, item); }}
                                                className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-md hover:bg-stone-800 transition-colors"
                                            >
                                                <ShoppingBag size={16} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center bg-[#1A1A1A] text-white rounded-full p-1 shadow-md">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-amber-500"><Minus size={14}/></button>
                                                <span className="text-xs font-bold px-1">{quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-amber-500"><Plus size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Dedicated Menu View for QR Code routing
const MenuView = ({ cart, updateQuantity, navigate }) => {
    const location = useLocation();
    const initialCategory = location.state?.category || "All";
    
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(initialCategory);

    const filteredMenu = useMemo(() => {
        return MENU_ITEMS.filter(item => 
            (activeCategory === "All" || item.category === activeCategory) &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeCategory, searchQuery]);

    return (
        <div className="pb-32 min-h-screen bg-[#F9F8F4] view-fade-in max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl px-6">
            <div className="flex items-center gap-4 py-4 mb-2">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-50">
                    <ChevronLeft size={20} className="text-stone-800" />
                </button>
                <h1 className="text-2xl font-bold text-stone-900">Full Menu</h1>
            </div>

            <div className="bg-white rounded-full p-1 pl-4 flex items-center shadow-sm border border-stone-100 mb-6 sticky top-4 z-20">
                <Search size={20} className="text-stone-400" />
                <input 
                    id="menu-search"
                    type="text" 
                    placeholder="Search dishes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-stone-800 font-sans"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-2 text-stone-400 hover:text-stone-800 mr-1">
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="flex overflow-x-auto no-scrollbar gap-3 mb-8 -mx-6 px-6">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.name} 
                        onClick={() => setActiveCategory(cat.name)} 
                        className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex-shrink-0 border ${
                            activeCategory === cat.name 
                            ? 'bg-stone-900 text-white border-stone-900' 
                            : 'bg-white text-stone-700 border-stone-100 hover:bg-stone-50'
                        }`}
                    >
                        <span className="text-base">{cat.icon}</span> {cat.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map(item => {
                        const quantity = cart.find(i => i.id === item.id)?.quantity || 0;
                        return (
                            <div key={item.id} className="bg-white rounded-[2rem] p-3 flex flex-col shadow-sm border border-stone-100">
                                <div className="h-32 w-full bg-stone-50 rounded-2xl mb-3 overflow-hidden">
                                    <FoodImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col flex-1 px-1">
                                    <h4 className="font-bold text-stone-900 text-sm leading-tight mb-1 line-clamp-1">{item.name}</h4>
                                    <p className="text-stone-500 text-xs line-clamp-2 mb-3 flex-1">{item.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="font-bold text-stone-900 text-sm">{formatPrice(item.price)}</span>
                                        {quantity === 0 ? (
                                            <button 
                                                onClick={() => updateQuantity(item.id, 1, item)}
                                                className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-stone-800 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center bg-[#1A1A1A] text-white rounded-full p-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={12}/></button>
                                                <span className="text-xs font-bold px-1">{quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={12}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-stone-500">No items match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const AppContent = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  
  const navigate = useNavigate();

  // Derived State
  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);

  const triggerBounce = () => {
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
  };

  const updateQuantity = (id, delta, itemObj = null) => {
    setCart(prev => {
        const idx = prev.findIndex(i => i.id === id);
        if (idx === -1 && itemObj && delta > 0) {
            triggerBounce();
            return [...prev, { ...itemObj, quantity: delta }];
        }
        let newCart = [...prev];
        if (idx !== -1) {
            newCart[idx].quantity += delta;
            if (newCart[idx].quantity <= 0) newCart.splice(idx, 1);
            else if (delta > 0) triggerBounce();
        }
        return newCart;
    });
  };

  // Chatbot logic state inside Main App so it can share Cart state easily
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatTyping]);

  const handleChatSend = async () => {
      if (!chatInput.trim()) return;
      const userMsg = { role: 'user', text: chatInput };
      setChatHistory(prev => [...prev, userMsg]);
      setChatInput('');
      setIsChatTyping(true);
  
      if (!CHATBOT_API_KEY || CHATBOT_API_KEY.includes('PLACEHOLDER')) {
          setTimeout(() => {
              setChatHistory(prev => [...prev, { role: 'model', text: "I'm in demo mode! Add a real Gemini key to enable my brain." }]);
              setIsChatTyping(false);
          }, 1000);
          return;
      }
      
      try {
          const systemPrompt = `You are Jay's Bistro virtual concierge. Keep responses short and elegant. Menu: ${MENU_ITEMS.map(i => `ID ${i.id}: ${i.name} (₦${i.price})`).join(', ')}. Cart: ${cart.length ? cart.map(i => `ID ${i.id} (x${i.quantity})`).join(', ') : "Empty"}. RESPOND STRICTLY IN JSON format: {"message": "reply", "actions": [{"action": "add"|"remove", "id": 1, "quantity": 1}]}`;
  
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CHATBOT_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents: [...chatHistory.map(m => ({ role: m.role, parts: [{ text: m.role === 'model' ? JSON.stringify({message: m.text, actions:[]}) : m.text }] })), { role: 'user', parts: [{ text: chatInput }] }],
                  generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
              })
          });
  
          const data = await response.json();
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim());
  
          if (parsed.actions?.length > 0) {
              setCart(prevCart => {
                  let newCart = [...prevCart];
                  parsed.actions.forEach(a => {
                      const item = MENU_ITEMS.find(i => i.id === a.id);
                      if (!item) return;
                      const idx = newCart.findIndex(i => i.id === a.id);
                      if (a.action === 'add') {
                          idx >= 0 ? newCart[idx].quantity += a.quantity : newCart.push({ ...item, quantity: a.quantity });
                      } else if (a.action === 'remove' && idx >= 0) {
                          newCart[idx].quantity -= a.quantity;
                          if (newCart[idx].quantity <= 0) newCart.splice(idx, 1);
                      }
                  });
                  return newCart;
              });
              triggerBounce();
          }
          setChatHistory(prev => [...prev, { role: 'model', text: parsed.message }]);
      } catch (error) {
          setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting." }]);
      } finally {
          setIsChatTyping(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] font-sans text-stone-900 selection:bg-[#E1ECA9]">
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800&family=Outfit:wght@400;500;600;700&display=swap');
            .font-serif { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-sans { font-family: 'Outfit', sans-serif; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .view-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}
        </style>

        <TopBar setIsCartOpen={setIsCartOpen} cartCount={cartCount} cartBounce={cartBounce} />

        <Routes>
            <Route path="/" element={<HomeView cart={cart} updateQuantity={updateQuantity} navigate={navigate} />} />
            <Route path="/menu" element={<MenuView cart={cart} updateQuantity={updateQuantity} navigate={navigate} />} />
        </Routes>

        <BottomNav isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} cartCount={cartCount} />

        {/* Cart Drawer */}
        <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
             <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
             
             <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#F9F8F4] shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="p-6 flex justify-between items-center bg-white rounded-b-3xl shadow-sm z-10">
                    <h2 className="font-serif text-2xl font-bold text-stone-900">Your Cart</h2>
                    <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"><X size={18} className="text-stone-600" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400">
                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={32} className="text-stone-300" />
                            </div>
                            <p className="font-sans font-bold text-lg text-stone-600">Your tray is empty</p>
                            <button onClick={() => {setIsCartOpen(false); navigate('/menu');}} className="mt-6 text-[#1A1A1A] font-bold underline underline-offset-4">Explore Menu</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-[2rem] shadow-sm border border-stone-100">
                                 <FoodImage src={item.image} className="w-20 h-20 object-cover rounded-2xl" alt={item.name} />
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-serif font-bold text-stone-900 truncate">{item.name}</h4>
                                    <p className="text-stone-500 text-sm font-bold mb-2">{formatPrice(item.price)}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-stone-100 rounded-full p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-stone-900"><Minus size={12}/></button>
                                            <span className="w-8 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-stone-900"><Plus size={12}/></button>
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        ))
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div className="p-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-sans font-medium text-stone-500">Total Payment</span>
                            <span className="font-sans font-bold text-2xl text-stone-900">{formatPrice(cartTotal)}</span>
                        </div>
                        <a href={generateWhatsAppLink(cart)} target="_blank" rel="noopener noreferrer" className="w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg hover:bg-stone-800 transition-transform active:scale-[0.98] shadow-lg">
                            Checkout Order <Check size={20} strokeWidth={3} />
                        </a>
                    </div>
                )}
             </div>
        </div>

        {/* AI Chatbot Window (Triggered by Bottom Nav) */}
        {isChatOpen && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-none">
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsChatOpen(false)} />
                <div className="w-full max-w-sm bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-stone-100 flex flex-col h-[500px] z-10 pointer-events-auto animate-[fadeIn_0.2s_ease-out]">
                     
                     <div className="p-5 bg-white border-b border-stone-100 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#E1ECA9] rounded-full flex items-center justify-center">
                                 <Bot size={20} className="text-stone-900" />
                             </div>
                             <div>
                                 <h3 className="font-serif font-bold text-stone-900 leading-tight">Jay's AI</h3>
                                 <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">● Online</span>
                             </div>
                         </div>
                         <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full hover:bg-stone-200"><X size={16}/></button>
                     </div>
                     
                     <div className="flex-1 p-5 bg-[#F9F8F4] overflow-y-auto flex flex-col gap-4 no-scrollbar">
                        {chatHistory.length === 0 && (
                            <div className="bg-white p-4 rounded-2xl shadow-sm text-stone-600 text-sm border border-stone-100 mt-2">
                                👋 Hi there! I can help you find dishes, build your order, or check your cart. Try saying: <br/><br/>
                                <span className="font-bold">"Add a Jollof Rice"</span>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3.5 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-[#1A1A1A] text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isChatTyping && <div className="text-stone-400 text-xs italic ml-2">Typing...</div>}
                        <div ref={chatEndRef} />
                     </div>
                     
                     <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
                         <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} placeholder="Ask something..." className="flex-1 bg-stone-100 px-4 py-3 rounded-full text-sm outline-none font-sans" />
                         <button onClick={handleChatSend} disabled={!chatInput.trim() || isChatTyping} className="bg-[#1A1A1A] text-white rounded-full disabled:opacity-50 flex items-center justify-center w-12 h-12 shadow-md"><Send size={18} /></button>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}