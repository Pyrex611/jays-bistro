import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, MessageSquare, X, Trash2, MapPin, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// --- GLOBAL STYLES & DATA ---

// Color Palette: Deep Charcoal Grey (#3A3A3A), Golden Amber (#C79143), Warm Beige/Milky Ash (#EDEAE3)
const COLORS = {
    PRIMARY: '#3A3A3A', // Deep Charcoal Grey (Base/Text)
    SECONDARY: '#C79143', // Golden Amber (Accent)
    BACKGROUND: '#EDEAE3', // Warm Beige / Milky Ash (Main Background - "Darker but milkier")
    CARD_BG: '#FFFFFF', // White for cards
    BUTTON_HOVER: '#555555', // Mid Grey
};

// Data used for the slideshow and grid - Updated with actual image URLs
const menuItems = [
    { 
        id: 1, 
        name: "Agbado Asun Delight", 
        category: "Appetizers", 
        price: 3500, 
        description: "Roasted sweet corn kernels tossed in spicy Asun pepper mix. A Lagos street food classic, elevated.", 
        imageUrl: "https://images.unsplash.com/photo-1627883582136-1e6a113d9646?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 2, 
        name: "Eforiro Royale", 
        category: "African Hearth", 
        price: 8500, 
        description: "A majestic slow-cooked spinach stew simmered in smoked fish, assorted meats, and vibrant pepper blend. Served with pounded yam.", 
        imageUrl: "https://images.unsplash.com/photo-1623838424269-80e5b3f11e95?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 3, 
        name: "Omo Ofe (Hibiscus Tea)", 
        category: "Heritage Teas", 
        price: 2500, 
        description: "Our signature Zobo blend, infused with fragrant ginger, cinnamon, and a hint of citrus peel. Rich, vibrant, and refreshing.", 
        imageUrl: "https://images.unsplash.com/photo-1628172825852-7d34d2847d06?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 4, 
        name: "Sisi's Sweet Puff Puff", 
        category: "Sweet Endings", 
        price: 4000, 
        description: "Golden, fluffy dough balls, spiced with nutmeg and cinnamon, served with a sticky caramel dipping sauce.", 
        imageUrl: "https://images.unsplash.com/photo-1625938479590-30d8d07e6b01?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 5, 
        name: "Jollof 'N' King Prawns", 
        category: "Continental", 
        price: 9800, 
        description: "Smokey, party-style Jollof rice served alongside colossal grilled king prawns marinated in garlic and chili.", 
        imageUrl: "https://images.unsplash.com/photo-1546252999-92b0289f2526?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 6, 
        name: "Classic Suya Skewers", 
        category: "Appetizers", 
        price: 4200, 
        description: "Tender strips of beef marinated in a potent blend of peanuts and spices, grilled to perfection and served with fresh onions.", 
        imageUrl: "https://images.unsplash.com/photo-1614271891781-a7593c68383a?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
        id: 7, 
        name: "Fufu & Egusi", 
        category: "African Hearth", 
        price: 7800, 
        description: "Smooth, supple Fufu served with a hearty, oil-rich melon seed soup, loaded with leafy greens and premium cuts.", 
        imageUrl: "https://images.unsplash.com/photo-1623910385317-0e6d62f44c4b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
];

const categories = [...new Set(menuItems.map(item => item.category))];

// --- HELPER COMPONENTS ---

// 1. Navbar Component
const Navbar = ({ cartCount, onCartClick, cartPulseKey }) => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 25 }}
            className={`sticky top-0 z-50 w-full bg-white py-4 px-6 flex justify-between items-center transition-all duration-300 shadow-lg border-b border-gray-100`}
        >
            {/* Logo */}
            <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-widest font-heading" style={{ color: COLORS.PRIMARY }}>
                    JAY'S BISTRO
                </span>
            </div>

            {/* Cart Icon (Pulsing) */}
            <motion.div 
                className="relative cursor-pointer"
                key={cartPulseKey} 
                initial={{ scale: 1 }}
                animate={cartPulseKey !== 0 ? { scale: [1, 1.2, 0.95, 1] } : { scale: 1 }} 
                transition={cartPulseKey !== 0 ? { duration: 0.5, type: 'spring', stiffness: 500 } : {}}
                onClick={onCartClick}
            >
                <ShoppingBag className="w-6 h-6 hover:text-orange-700 transition-colors" style={{ color: COLORS.PRIMARY }} />
                {cartCount > 0 && (
                    <span 
                        className="absolute -top-2 -right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white"
                        style={{ backgroundColor: COLORS.SECONDARY }}
                    >
                        {cartCount}
                    </span>
                )}
            </motion.div>
        </motion.nav>
    );
};

// 2. Hero Slideshow Component (Taller, Captivating Imagery)
const HeroSlideshow = ({ onOrderNowClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = menuItems.slice(0, 4); 

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length);
        }, 5000); 

        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length);
    const prevSlide = () => setCurrentIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full overflow-hidden shadow-2xl">
            {/* Aspect ratio changed to 2/1 for more height - Contains actual food images */}
            <div className="aspect-[2/1] relative"> 
                <AnimatePresence initial={false}>
                    {slides.map((slide, index) => (
                        index === currentIndex && (
                            <motion.div
                                key={slide.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.0 }}
                                className="absolute inset-0 bg-cover bg-center"
                                // Image URL from menuItems is used here
                                style={{ backgroundImage: `url(${slide.imageUrl})` }}
                            >
                                {/* Dark overlay for text contrast */}
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-between p-6 md:p-12">
                                    <div className="text-white max-w-lg">
                                        <h2 className="font-heading text-4xl md:text-6xl font-extrabold mb-2 leading-tight">
                                            {slide.name}
                                        </h2>
                                        <p className="text-sm md:text-lg opacity-90 font-sans">{slide.description}</p>
                                    </div>
                                    
                                    {/* Order Now Button */}
                                    <motion.button
                                        onClick={onOrderNowClick}
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(199, 145, 67, 0.8)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="py-3 px-6 text-white font-bold rounded-lg shadow-xl uppercase tracking-wider text-sm md:text-base font-heading"
                                        style={{ backgroundColor: COLORS.SECONDARY }}
                                    >
                                        Order Now
                                    </motion.button>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
                    <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {slides.map((_, index) => (
                        <div 
                            key={index}
                            className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${index === currentIndex ? 'ring-2 ring-white' : 'bg-white bg-opacity-50 hover:bg-opacity-80'}`}
                            onClick={() => setCurrentIndex(index)}
                            style={{ backgroundColor: index === currentIndex ? COLORS.SECONDARY : 'white' }}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};


// 3. Menu Item Card Component (Updated Colors and Image Fallback)
const MenuItemCard = ({ item, index, onAddToCart }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)" }}
            className="group relative rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col transition-all duration-300 border border-gray-100"
            style={{ backgroundColor: COLORS.CARD_BG }}
        >
            {/* Image Area - Square Aspect */}
            <div className="aspect-square w-full overflow-hidden relative">
                {/* Using actual image URLs - Confirmed to use real food pictures */}
                <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    onError={(e) => { 
                        // Fallback image if the URL fails
                        e.target.onerror = null; 
                        e.target.src = `https://placehold.co/400x400/${COLORS.BACKGROUND.substring(1)}/${COLORS.PRIMARY.substring(1)}?text=Jay's+Dish`; 
                    }}
                />
            </div>

            {/* Content & Action */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl mb-1 font-semibold" style={{ color: COLORS.PRIMARY }}>{item.name}</h3>
                <p className="text-stone-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <div className="mt-auto flex justify-between items-center pt-2">
                    <p className="font-extrabold text-xl font-heading tracking-wide" style={{ color: COLORS.SECONDARY }}>
                        ₦{item.price.toLocaleString()}
                    </p>
                    
                    {/* Add Button */}
                    <motion.button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white p-2 rounded-full shadow-lg transition-colors"
                        style={{ backgroundColor: COLORS.PRIMARY }}
                    >
                        <Plus size={20} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// 4. Cart Sliding Panel Component 
const CartPanel = ({ cart, isCartOpen, onClose, onRemove }) => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[99]"
                    />

                    {/* Cart Drawer */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="fixed top-0 right-0 w-full max-w-sm h-full shadow-2xl z-[100] flex flex-col p-6 overflow-y-auto"
                        style={{ backgroundColor: COLORS.BACKGROUND }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-stone-200">
                            <h3 className="font-heading text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>Your Order</h3>
                            <button onClick={onClose} className="text-stone-400 hover:text-red-500 transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        
                        {/* Cart Items */}
                        <div className="flex-grow py-4 space-y-4">
                            {cart.length === 0 ? (
                                <p className="text-stone-500 italic mt-8 text-center">Start your order by selecting a taste from the collection.</p>
                            ) : (
                                Object.values(cart.reduce((acc, item) => {
                                    acc[item.id] = acc[item.id] || { ...item, quantity: 0 };
                                    acc[item.id].quantity++;
                                    return acc;
                                }, {})).map((item) => (
                                    <motion.div 
                                        key={item.id} 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex justify-between items-center p-3 rounded-lg border border-stone-100 shadow-sm"
                                        style={{ backgroundColor: COLORS.CARD_BG }}
                                    >
                                        <div className="flex-grow">
                                            <p className="font-sans font-semibold text-stone-800">{item.name}</p>
                                            <p className="text-sm" style={{ color: COLORS.SECONDARY }}>{item.quantity} x ₦{item.price.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => onRemove(item.id)} 
                                            className="text-stone-300 hover:text-red-500 p-2 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        <div className="pt-6 border-t border-stone-200">
                            <div className="flex justify-between items-center mb-4 font-bold text-xl font-heading" style={{ color: COLORS.PRIMARY }}>
                                <span>TOTAL:</span>
                                <span className="text-3xl" style={{ color: COLORS.SECONDARY }}>₦{total.toLocaleString()}</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-colors disabled:bg-stone-400 font-heading tracking-wider"
                                style={{ backgroundColor: COLORS.PRIMARY, hover: { backgroundColor: COLORS.BUTTON_HOVER } }}
                                disabled={cart.length === 0}
                            >
                                PLACE ORDER
                            </motion.button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

// 5. Sticky Category Tab Bar
const StickyCategoryBar = ({ activeCategory, setActiveCategory }) => {
    const barRef = useRef(null);

    const scrollToCategory = (cat) => {
        setActiveCategory(cat);
        if (barRef.current) {
            const button = barRef.current.querySelector(`[data-category="${cat}"]`);
            if (button) {
                const barWidth = barRef.current.clientWidth;
                const buttonOffset = button.offsetLeft;
                const buttonWidth = button.clientWidth;
                
                barRef.current.scrollTo({
                    left: buttonOffset - (barWidth / 2) + (buttonWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    };

    return (
        <div 
            ref={barRef}
            className="sticky top-[72px] z-40 border-y border-stone-200 overflow-x-auto whitespace-nowrap py-4 px-6 shadow-inner no-scrollbar"
            style={{ backgroundColor: COLORS.CARD_BG }}
        >
            <div className="flex space-x-4 max-w-7xl mx-auto">
                {categories.map((cat) => (
                    <motion.button
                        key={cat}
                        data-category={cat}
                        onClick={() => scrollToCategory(cat)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`text-sm md:text-base font-sans py-2 px-5 rounded-full transition-all duration-300 font-semibold shadow-md border-2 
                            ${
                                activeCategory === cat 
                                    ? 'text-white'
                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                        style={{
                            backgroundColor: activeCategory === cat ? COLORS.PRIMARY : COLORS.CARD_BG,
                            borderColor: activeCategory === cat ? COLORS.PRIMARY : COLORS.BACKGROUND,
                            color: activeCategory === cat ? COLORS.BACKGROUND : COLORS.PRIMARY,
                            boxShadow: activeCategory === cat ? `0 4px 6px -1px ${COLORS.PRIMARY}40` : '0 1px 3px 0 rgba(0,0,0,0.1)',
                        }}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};


// --- MAIN APPLICATION COMPONENT ---
export default function App() {
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [cart, setCart] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false); 
    const [cartPulseKey, setCartPulseKey] = useState(0); 
    
    const menuRef = useRef(null); 

    // Dynamic Filter
    const filteredItems = useMemo(() => {
        // Find items that are used in the hero slideshow
        const heroItemIds = menuItems.slice(0, 4).map(item => item.id);
        
        // Filter by category and exclude the slideshow items unless category has less than 2 items left
        const items = menuItems.filter(item => item.category === activeCategory);
        const filtered = items.filter(item => !heroItemIds.includes(item.id));

        // Fallback: If filtering leaves too few items, show all items in the category.
        return filtered.length < 2 && items.length > 0 ? items : filtered;
    }, [activeCategory]);


    const addToCart = (item) => {
        setCart(prev => [...prev, item]);
        setCartPulseKey(prev => prev + 1); 
    };

    const removeFromCart = (itemId) => {
        const index = cart.map(item => item.id).lastIndexOf(itemId);
        if (index > -1) {
            setCart(prev => prev.filter((_, i) => i !== index));
        }
    };

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const scrollToMenu = () => {
        menuRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.BACKGROUND, color: COLORS.PRIMARY }}>
            {/* Custom font injection */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
                .font-heading { font-family: 'Poppins', sans-serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <Navbar 
                cartCount={cart.length} 
                onCartClick={toggleCart} 
                cartPulseKey={cartPulseKey}
            />

            {/* 1. HERO SLIDESHOW (Taller, Captivating Imagery) */}
            <HeroSlideshow onOrderNowClick={scrollToMenu} />

            {/* 2. REFINED TEXT HERO SECTION (SHORTER) */}
            <header className="relative py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="font-heading text-5xl md:text-7xl font-extrabold tracking-tighter"
                    >
                        THE KITCHEN'S <span style={{ color: COLORS.SECONDARY }}>SOUL</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="mt-4 text-lg md:text-xl font-sans max-w-3xl mx-auto text-stone-600"
                    >
                        Where global sophistication meets the vibrant, authentic heart of Nigerian flavor.
                    </motion.p>
                </div>
            </header>

            {/* 3. MENU LAYOUT */}
            <main ref={menuRef} className="max-w-7xl mx-auto pt-8">
                
                <StickyCategoryBar 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory}
                />
                
                <section id="menu" className="p-6 md:p-12">
                    
                    <h2 className="font-heading text-4xl font-bold mb-4" style={{ color: COLORS.PRIMARY }}>
                        The Collection
                    </h2>
                    
                    <p className="font-heading text-2xl font-light mb-8" style={{ color: COLORS.SECONDARY }}>
                        &mdash; {activeCategory}
                    </p>

                    {/* Food Grid with Cascade Animation */}
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence>
                            {filteredItems.map((item, index) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    index={index} 
                                    onAddToCart={addToCart} 
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
            </main>

            {/* 4. The Concierge Chatbot */}
            <div className="fixed bottom-8 right-8 z-40"> 
                <motion.button 
                    onClick={toggleChat}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white p-4 rounded-full shadow-xl transition-colors duration-300 flex items-center justify-center"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                >
                    <MessageSquare className="w-6 h-6" />
                </motion.button>
            </div>
            
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-8 w-80 shadow-2xl rounded-2xl overflow-hidden border border-stone-100 z-50"
                        style={{ backgroundColor: COLORS.CARD_BG }}
                    >
                        <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: COLORS.PRIMARY }}>
                            <span className="font-heading">Jay's Concierge</span>
                            <button onClick={toggleChat} className="text-stone-400 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-4 h-64 overflow-y-auto" style={{ backgroundColor: COLORS.BACKGROUND }}>
                            <motion.div 
                                initial={{ x: -10 }} 
                                animate={{ x: 0 }} 
                                className="p-3 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm text-sm text-stone-600 mb-2"
                                style={{ backgroundColor: COLORS.CARD_BG }}
                            >
                                Welcome! I can assist with flavor profiles, dietary restrictions, or table reservations.
                            </motion.div>
                        </div>
                        <div className="p-3 border-t border-stone-100" style={{ backgroundColor: COLORS.CARD_BG }}>
                            <input type="text" placeholder="Ask your question..." className="w-full text-sm outline-none text-stone-700 placeholder:text-stone-400 p-2 border rounded-lg" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* 5. The Cart Panel */}
            <CartPanel 
                cart={cart} 
                isCartOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                onRemove={removeFromCart}
            />

            {/* 6. FOOTER (Informative and Themed) */}
            <footer className="py-16 mt-20" style={{ backgroundColor: COLORS.PRIMARY, color: COLORS.BACKGROUND }}>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    
                    {/* Column 1: Location */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start mb-2" style={{ color: COLORS.SECONDARY }}>
                            <MapPin size={24} className="mr-3" />
                            <h4 className="font-heading text-xl font-bold uppercase tracking-wider">Find Our Spot</h4>
                        </div>
                        <address className="not-italic text-stone-300 font-sans leading-relaxed">
                            14, The Spice Route Tower, <br />
                            Victoria Island, Lagos, Nigeria. <br />
                            <a href="#" className="underline hover:opacity-80 transition-opacity" style={{ color: COLORS.SECONDARY }}>View Directions</a>
                        </address>
                    </div>

                    {/* Column 2: Contact */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start mb-2" style={{ color: COLORS.SECONDARY }}>
                            <Phone size={24} className="mr-3" />
                            <h4 className="font-heading text-xl font-bold uppercase tracking-wider">Book A Table</h4>
                        </div>
                        <p className="text-stone-300 font-sans leading-relaxed">
                            Reservations Hotline: <span className='font-semibold'>+234 81 123 4567</span> <br />
                            General Enquiries: <a href="mailto:contact@jaysbistro.com" className="underline hover:opacity-80 transition-opacity" style={{ color: COLORS.SECONDARY }}>contact@jaysbistro.com</a>
                        </p>
                    </div>

                    {/* Column 3: Hours */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start mb-2" style={{ color: COLORS.SECONDARY }}>
                            <Clock size={24} className="mr-3" />
                            <h4 className="font-heading text-xl font-bold uppercase tracking-wider">Opening Times</h4>
                        </div>
                        <p className="text-stone-300 font-sans leading-relaxed">
                            Lunch & Dinner: 11:00 AM – 10:00 PM <br />
                            Weekends (Brunch): 10:00 AM – 11:00 PM <br />
                            <span className='italic opacity-70'>(Closed every Tuesday for Deep Cleaning)</span>
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 border-t border-stone-700 mt-12 pt-6 text-center">
                    <p className="text-xs tracking-widest uppercase opacity-70 font-sans">© 2025 JAY'S BISTRO. ALL RIGHTS RESERVED. EXPERIENCE THE VIBRANCE. TASTE THE SOUL.</p>
                </div>
            </footer>
        </div>
    );
}