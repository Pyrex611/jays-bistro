import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, Coffee, Utensils, Zap, Salad, 
  Clock, MapPin, Phone, MessageSquare, Send, Bot, Loader2, ScrollText,
  Instagram, Facebook, Twitter, Mail, ArrowRight, ChevronRight
} from 'lucide-react';

// --- Configuration Data ---
const MENU_ITEMS = [
  // Tea & Refreshments (Primary Focus)
  { 
    id: 1, 
    category: "Tea & Refreshments", 
    name: "Classic Arabian Blend", 
    price: 1200, 
    description: "Our heritage spice infusion with cardamom and rosewater, honoring the bistro's origin. Served with lemon and honey.", 
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "The Heritage Blend", 
    slideSubtitle: "Timeless Arabian Tea, perfected with Cardamom & Rosewater, served with lemon and honey." 
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
    description: "A rich, slow-simmered broth featuring tender pieces of smoked goat meat, perfect for sharing.", 
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "The Signature Starter", 
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
    name: "The Signature Jollof Risotto", 
    price: 4500, 
    description: "Arborio rice cooked in a complex tomato base, served with plantain crisps and grilled beef fillet.", 
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800", 
    slideTitle: "Main Course Innovation", 
    slideSubtitle: "West African soul meets Italian technique: Jollof Risotto with Grilled Fillet." 
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
    description: "Atlantic salmon, perfectly seared, served over a bed of creamy mashed potatoes and asparagus.", 
    image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=800" 
  },

  // Bites
  { 
    id: 11, 
    category: "Bites & Small Chops", 
    name: "Spicy Meat Samosa", 
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
  { id: 'tea', label: "Tea & Refreshments", icon: Coffee, titleIcon: <Coffee size={24} /> },
  { id: 'appetizers', label: "Appetizers", icon: Salad, titleIcon: <Salad size={24} /> },
  { id: 'meals', label: "Meals", icon: Utensils, titleIcon: <Utensils size={24} /> },
  { id: 'bites', label: "Bites & Small Chops", icon: Zap, titleIcon: <Zap size={24} /> },
];

// --- Utility Functions ---

const formatPrice = (price) => "₦" + price.toLocaleString();

const parseOrderFromText = (text, menuItems) => {
    let itemsToAdd = [];
    const menuNames = menuItems.map(item => item.name);
    const patterns = menuNames.map(name => ({
        name,
        // Regex to find: (Quantity) (Item Name) - e.g., "2 Classic Arabian Blend"
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

// Function to handle API call with exponential backoff
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // If response is not OK, throw error to trigger retry (unless it's a 4xx client error)
            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            } else {
                return response; // Return for client errors like 400
            }
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error("Failed to fetch content after multiple retries.");
            }
        }
    }
};


// --- Components ---

const PrimaryButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl 
      hover:bg-orange-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30 
      focus:ring-4 focus:ring-orange-500/50 active:scale-95 ${className}
    `}
  >
    {children}
  </button>
);

const JaysBistro = () => {
  const [activeTab, setActiveTab] = useState("Tea & Refreshments");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Store chat history using roles 'user' and 'assistant'
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const filteredItems = useMemo(() => MENU_ITEMS.filter(item => item.category === activeTab), [activeTab]);
  const activeCategory = useMemo(() => CATEGORIES.find(cat => cat.label === activeTab), [activeTab]);

  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      }
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

  // Chatbot Logic
  const handleChatSubmit = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', text };
    // Optimistically add user message to history
    setChatHistory(prev => [...prev, userMessage]);
    setIsTyping(true);

    // 1. Check for immediate order actions in the text
    const itemsToAdd = parseOrderFromText(text, MENU_ITEMS);
    let finalUserQuery = text;
    let confirmationMessage = '';

    if (itemsToAdd.length > 0) {
        itemsToAdd.forEach(({ item, quantity }) => addToCart(item, quantity));
        confirmationMessage = `(Action: I have successfully added ${itemsToAdd.map(i => `${i.quantity} x ${i.item.name}`).join(' and ')} to the user's shopping cart. The user is aware of this action.)`;
        // Inject the cart status action into the prompt for context
        finalUserQuery += `\n\n${confirmationMessage}`;
    }

    // 2. Prepare Cart Status for AI context injection
    const currentCartSummary = cart.map(item => `${item.quantity} x ${item.name} (${formatPrice(item.price * item.quantity)})`).join('; ');
    const cartStatus = cart.length > 0 
        ? `The user's current order (Cart) contains: ${currentCartSummary}. Total: ${formatPrice(cartTotal)}.`
        : `The user's cart is currently empty.`;

    // 3. Prepare System Prompt (updated with cart context and instructions)
    const menuList = MENU_ITEMS.map(i => `${i.name} (${formatPrice(i.price)})`).join('; ');
    const systemPrompt = `You are Jay, the friendly and sophisticated virtual assistant for Jay's Bistro. Your persona is professional, warm, and helpful. 
Your core knowledge base is the menu items: ${menuList}. 
***CONTEXT AWARENESS***
The current state of the user's shopping cart is: ${cartStatus}
***INSTRUCTIONS***
1. If the user asks about their 'full order', 'what they have', or their 'current order', summarize the cart contents from the CONTEXT AWARENESS section.
2. If the user's message contains an 'Action' note (meaning items were added to the cart by the application logic), CONFIRM the addition elegantly in your response before answering the rest of the query.
3. If the user asks to remove an item, politely inform them they can use the basket icon on the main page to manage quantities.
4. Do NOT mention that you are an AI. Respond as Jay, the bistro's assistant.
5. When asked about the menu, only list names and prices, or provide an elegant description if asked for recommendations.
`;

    // 4. Prepare Chat History for API (Map local roles to API roles)
    let apiHistory = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: msg.text }]
    }));
    
    // Add the new user message (which may contain the hidden action note)
    apiHistory.push({ role: 'user', parts: [{ text: finalUserQuery }] });

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: apiHistory, // Send the full history for context
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I seem to be having trouble connecting right now. Please try again in a moment.";
        
        // Add assistant response to local history
        setChatHistory(prev => [...prev.slice(0, prev.length - 1), userMessage, { role: 'assistant', text: responseText }]);

    } catch (error) {
        console.error("Gemini API Error:", error);
        setChatHistory(prev => [...prev, { role: 'assistant', text: "I'm currently experiencing a high volume of orders. Could you please check the menu directly or try asking again in a minute?" }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- Sub-Components ---

  const MenuCard = ({ item, index }) => (
    <div 
      className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden group flex flex-col transform hover:-translate-y-2 border border-zinc-700/50"
      style={{ animation: `fadeInUp 0.5s ease-out forwards ${index * 0.1}s`, opacity: 0 }}
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x560/3f3f46/ffffff?text=Food+Image+Unavailable" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
        <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur text-orange-500 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
          {item.category}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col relative">
        <h3 className="font-bold text-xl text-white mb-2 leading-tight group-hover:text-orange-500 transition-colors">{item.name}</h3>
        <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{item.description}</p>
        
        <div className="flex justify-between items-center pt-4 border-t border-zinc-700/50 mt-auto">
          <span className="text-2xl font-black text-white tracking-tight">
            {formatPrice(item.price)}
          </span>
          <button 
            onClick={() => addToCart(item)}
            className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const HeroSlideshow = () => {
    const slides = MENU_ITEMS.filter(item => item.slideTitle).slice(0, 3);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setActiveSlideIndex(prevIndex => (prevIndex + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
    }, [slides.length]);

    return (
      <header className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${index === activeSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-brightness-75 bg-gradient-to-b from-zinc-900/80 via-transparent to-zinc-900 flex items-end justify-center pb-20 md:pb-32">
              <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
                <div className="overflow-hidden mb-2">
                    <span className={`inline-block text-orange-500 font-bold text-xs md:text-sm tracking-widest uppercase mb-2 transition-transform duration-700 delay-300 ${index === activeSlideIndex ? 'translate-y-0' : 'translate-y-10 opacity-0'}`}>
                        Exquisite Dining
                    </span>
                </div>
                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tighter drop-shadow-2xl transition-all duration-700 delay-100 ${index === activeSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.slideTitle || slide.name}
                </h1>
                <p className={`text-sm md:text-lg text-zinc-200 max-w-2xl mx-auto font-light leading-relaxed mb-8 transition-all duration-700 delay-200 ${index === activeSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.slideSubtitle || slide.description}
                </p>
                <div className={`transition-all duration-700 delay-500 ${index === activeSlideIndex ? 'opacity-100' : 'opacity-0'}`}>
                   <PrimaryButton onClick={() => document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' })} className="text-base px-8 py-3 flex items-center gap-3 mx-auto">
                        Explore Menu <ArrowRight size={18} />
                   </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
            {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setActiveSlideIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${index === activeSlideIndex ? 'bg-orange-500 w-12' : 'bg-white/30 w-6 hover:bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
      </header>
    );
  };

  const ChatBot = () => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleSend = () => {
      if (inputValue.trim() !== '' && !isTyping) {
        handleChatSubmit(inputValue);
        setInputValue('');
      }
    };

    return (
      <>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 
            ${isChatOpen ? 'bg-zinc-800 text-orange-500 rotate-180 border border-orange-500' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-orange-500/50'}`}
        >
          {isChatOpen ? <X size={28} /> : <Bot size={28} />}
        </button>

        <div className={`fixed bottom-24 right-8 z-50 w-[90vw] max-w-sm bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50 transition-all duration-300 origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-zinc-700/50 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-t-2xl flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bot size={20} className="text-orange-500" /> Jay's Assistant
            </h3>
            <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
            {chatHistory.length === 0 && (
              <div className="text-center text-zinc-500 mt-10">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ScrollText size={32} className="text-orange-500" />
                </div>
                <p className="text-zinc-300 font-medium">How may I serve you today?</p>
                <p className="text-xs mt-2 text-zinc-500">I can take your order directly here.</p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 rounded-bl-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-zinc-700/50 bg-zinc-900/50 rounded-b-2xl flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your order..."
              className="flex-1 bg-zinc-800 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-zinc-700 placeholder:text-zinc-600"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !inputValue.trim()}
              className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-orange-500 selection:text-white">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 py-3 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 transform group-hover:rotate-12 transition-transform duration-300">
              J
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-orange-500 transition-colors">
              Jay's Bistro
            </span>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full hover:bg-zinc-800 transition-all group"
          >
            <div className="relative">
                <ShoppingBag size={24} className="text-zinc-300 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-zinc-950 animate-pulse-slow">
                    {cartCount}
                </span>
                )}
            </div>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <HeroSlideshow />

      {/* Menu Section */}
      <section id="menu-section" className="py-28 px-4 md:px-8 container mx-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-3">Our Collection</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Culinary Masterpieces</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">Explore our diverse menu, from traditional Arabian teas to modern fusion entrees, crafted with passion and precision.</p>
        </div>

        {/* Categories */}
        <div className="sticky top-20 z-40 mb-16 py-4 bg-zinc-950/80 backdrop-blur-xl border-y border-zinc-800/50">
            <div className="flex overflow-x-auto whitespace-nowrap justify-start md:justify-center gap-3 px-4 py-2 custom-scrollbar">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.label)}
                        className={`
                            flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border
                            ${activeTab === cat.label 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20 scale-105' 
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'}
                        `}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, idx) => (
            <MenuCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 pt-20 pb-10 border-t border-zinc-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-50"></div>
        
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30">J</div>
                        <span className="text-2xl font-bold text-white">Jay's Bistro</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        Combining the warmth of traditional hospitality with the elegance of modern cuisine. An unforgettable dining experience in the heart of Lagos.
                    </p>
                    <div className="flex gap-4">
                        {[Facebook, Instagram, Twitter].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
                    <ul className="space-y-4 text-zinc-400 text-sm">
                        {['Home', 'Our Story', 'Menu', 'Reservations', 'Private Events'].map(link => (
                            <li key={link}>
                                <a href="#" className="hover:text-orange-500 transition-colors flex items-center gap-2 group">
                                    <ChevronRight size={14} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-lg">Contact Us</h4>
                    <ul className="space-y-4 text-zinc-400 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                            <span>Plot 42, Victoria Island,<br/>Lagos, Nigeria</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-orange-500 flex-shrink-0" />
                            <span>+234 800 123 4567</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-orange-500 flex-shrink-0" />
                            <span>reservations@jaysbistro.com</span>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-lg">Newsletter</h4>
                    <p className="text-zinc-400 text-sm mb-4">Subscribe for seasonal updates and exclusive offers.</p>
                    <div className="flex flex-col gap-3">
                        <input type="email" placeholder="Your email address" className="bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 text-sm transition-colors" />
                        <button className="bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Jay's Bistro. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[60] transition-all duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
            <h2 className="text-xl font-bold text-white">Your Order</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p>Your cart is currently empty.</p>
                  <PrimaryButton onClick={() => setIsCartOpen(false)} className="text-sm">Browse Menu</PrimaryButton>
               </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <img 
                            src={item.image} 
                            className="w-20 h-20 rounded-lg object-cover bg-zinc-800" 
                            alt={item.name} 
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x560/3f3f46/ffffff?text=Food+Image+Unavailable" }}
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-white text-sm mb-1">{item.name}</h4>
                            <p className="text-orange-500 font-bold text-sm mb-3">{formatPrice(item.price * item.quantity)}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center hover:bg-zinc-600"><Minus size={12}/></button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center hover:bg-zinc-600"><Plus size={12}/></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-6 bg-zinc-900 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-2xl font-bold text-white">{formatPrice(cartTotal)}</span>
                </div>
                <PrimaryButton className="w-full">Proceed to Checkout</PrimaryButton>
            </div>
          )}
        </div>
      </div>
      
      {/* ChatBot Component */}
      <ChatBot />

      <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #f97316; }
      `}</style>
    </div>
  );
};

export default JaysBistro;