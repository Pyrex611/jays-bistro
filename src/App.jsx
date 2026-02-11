import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, MapPin, Phone, ArrowRight, 
  Bot, Send, Menu as MenuIcon, Instagram, Facebook, Twitter, 
  ChevronLeft, Star, Clock, Sun, Moon, Search
} from 'lucide-react';

// --- Configuration ---
const WHATSAPP_NUMBER = "2348062624447"; 
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Precious+event+Centre+Makurdi";
const CHATBOT_API_KEY = "PLACEHOLDER_GEMINI_API_KEY_A1B2C3D4E5F6G7H8I9"; 

//yam_url = "resources/IMG_1989.PNG"

// --- Data ---
const MENU_ITEMS = [
  // --- Curated / Featured (Shown on Hero) ---
  { id: 1, category: "Meals", name: "Party Jollof Rice", price: 1500, description: "Signature smoky party jollof served with grilled beef.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 2, category: "Protein", name: "Isi-ewu", price: 6000, description: "Traditional spicy goat head delicacy in rich palm oil sauce.", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=1920", featured: true },
  { id: 3, category: "Beverages", name: "Classic Arabian Blend (1L)", price: 3000, description: "Heritage spice infusion with cardamom and rosewater.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1920", featured: true },

  // --- Full Menu ---
  { id: 4, category: "Beverages", name: "Double Root (1L)", price: 3500, description: "Powerful herbal blend for vitality and wellness.", image: "https://images.unsplash.com/photo-1544517176-655510493a28?auto=format&fit=crop&q=80&w=800" },
  { id: 5, category: "Beverages", name: "Ginger, Lemon & Cinnamon Tea", price: 2000, description: "Zesty, spicy, and soothing aromatic tea.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800" },
  { id: 6, category: "Beverages", name: "Arabian Tea (1/2L)", price: 1500, description: "A smaller portion of our signature spice tea.", image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=800" },
  { id: 7, category: "Beverages", name: "Arabian Double", price: 2000, description: "Extra strength Arabian blend for the bold.", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&q=80&w=800" },
  { id: 8, category: "Beverages", name: "Pure Honey (1L)", price: 10000, description: "Organic, undiluted locally sourced honey.", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800" },
  { id: 9, category: "Beverages", name: "Date Powder", price: 30000, description: "Natural sweetener alternative made from premium dates.", image: "https://images.unsplash.com/photo-1619684693892-3eb4b3020993?auto=format&fit=crop&q=80&w=800" },
  { id: 10, category: "Beverages", name: "Arabian Tea Pack", price: 6000, description: "Take home the Jay's experience. DIY Tea pack.", image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800" },
  { id: 11, category: "Beverages", name: "Maca Root Pack", price: 6000, description: "Raw Maca root powder supplement.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
  { id: 12, category: "Starters", name: "Spiced Meat Samosa", price: 1500, description: "Crispy triangular pastry filled with spiced minced meat.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" },
  { id: 13, category: "Starters", name: "Spring Roll", price: 3000, description: "Crispy rolls filled with fresh vegetables and meat.", image: "https://images.unsplash.com/photo-1548507200-dd918f830371?auto=format&fit=crop&q=80&w=800" },
  { id: 14, category: "Starters", name: "Puff Puff", price: 1500, description: "Classic Nigerian sweet fried dough balls.", image: "https://images.unsplash.com/photo-1630405433873-91851d45763e?auto=format&fit=crop&q=80&w=800" },
  { id: 15, category: "Bites", name: "Fish Roll", price: 1000, description: "Flaky pastry rolled with a savory fish filling.", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800" },
  { id: 16, category: "Bites", name: "Doughnut", price: 500, description: "Soft, fluffy, sugar-glazed classic doughnut.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800" },
  { id: 17, category: "Bites", name: "Palmia", price: 500, description: "Crunchy, heart-shaped caramelized puff pastry.", image: "https://images.unsplash.com/photo-1612182062633-9524ca862134?auto=format&fit=crop&q=80&w=800" },
  { id: 18, category: "Bites", name: "Meat Pie", price: 1000, description: "Rich minced meat and potato filling in a buttery crust.", image: "https://images.unsplash.com/photo-1572383672419-ab47799d1d39?auto=format&fit=crop&q=80&w=800" },
  { id: 19, category: "Bites", name: "6' Pizza", price: 12000, description: "Personal size pizza loaded with cheese and toppings.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
  { id: 20, category: "Bites", name: "12' Pizza", price: 15000, description: "Large family-sized pizza with the cheesiest pull.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800" },
  { id: 21, category: "Bites", name: "Chicken Shawarma (SS)", price: 3500, description: "Creamy Chicken shawarma with Single Sausage.", image: "https://images.unsplash.com/photo-1633321702518-7feccaf9cdf3?auto=format&fit=crop&q=80&w=800" },
  { id: 22, category: "Bites", name: "Chicken Shawarma (DS)", price: 4000, description: "Loaded Chicken shawarma with Double Sausage.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800" },
  { id: 23, category: "Bites", name: "Beef Shawarma", price: 4500, description: "Tender spiced beef strips wrapped in flatbread.", image: "https://images.unsplash.com/photo-1561651881-d3f87a95a328?auto=format&fit=crop&q=80&w=800" },
  { id: 24, category: "Bites", name: "Combo Shawarma", price: 6000, description: "The ultimate mix of juicy chicken and beef.", image: "https://images.unsplash.com/photo-1642365924747-8a39ec8bb0dc?auto=format&fit=crop&q=80&w=800" },
  { id: 25, category: "Bites", name: "Chicken Caesar Salad", price: 7000, description: "Fresh greens, grilled chicken breast, and croutons.", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800" },
  { id: 26, category: "Bites", name: "Coleslaw", price: 1000, description: "Freshly shredded cabbage and carrots in creamy dressing.", image: "https://images.unsplash.com/photo-1628156627622-426b384f7000?auto=format&fit=crop&q=80&w=800" },
  { id: 27, category: "Bites", name: "Vegetable Salad", price: 6000, description: "A healthy mix of fresh garden vegetables.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
  { id: 28, category: "Meals", name: "Moi-Moi", price: 3000, description: "Rich steamed bean pudding garnished with egg/fish.", image: "https://images.unsplash.com/photo-1648417535492-414457d97773?auto=format&fit=crop&q=80&w=800" },
  { id: 29, category: "Meals", name: "Noodles", price: 2000, description: "Stir-fried noodles with signature spices.", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800" },
  { id: 30, category: "Meals", name: "Garnished Noodles", price: 3500, description: "Noodles stir-fried with vegetables and proteins.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800" },
  { id: 31, category: "Meals", name: "Fried Rice", price: 1500, description: "Classic Nigerian fried rice with mixed veggies.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800" },
  { id: 32, category: "Meals", name: "Coconut Rice", price: 2000, description: "Rice slow-cooked in fresh, rich coconut milk.", image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&q=80&w=800" },
  { id: 33, category: "Meals", name: "Local Rice", price: 3000, description: "Traditional Ofada-style rice with distinct aroma.", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800" },
  { id: 34, category: "Meals", name: "Beans", price: 1500, description: "Soft, honey beans cooked to perfection.", image: "https://images.unsplash.com/photo-1633896949673-1e9ee18a2d18?auto=format&fit=crop&q=80&w=800" },
  { id: 35, category: "Meals", name: "Plantain", price: 1000, description: "Sweet fried plantain (Dodo).", image: "https://images.unsplash.com/photo-1647432924976-47b779b73964?auto=format&fit=crop&q=80&w=800" },
  { id: 36, category: "Meals", name: "Basmati Fried Rice", price: 3500, description: "Premium long-grain Basmati stir-fry.", image: "https://images.unsplash.com/photo-1603133872878-684f10842619?auto=format&fit=crop&q=80&w=800" },
  { id: 37, category: "Meals", name: "Spaghetti", price: 3500, description: "Spaghetti in a rich, spicy tomato sauce.", image: "https://images.unsplash.com/photo-1597393437299-1307682970c3?auto=format&fit=crop&q=80&w=800" },
  { id: 38, category: "Meals", name: "Gizz Dodo", price: 4000, description: "Spicy mix of gizzards and fried plantains.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800" },
  { id: 39, category: "Meals", name: "Chips & Omelette", price: 3500, description: "Fried potato chips served with a farm-fresh omelette.", image: "https://images.unsplash.com/photo-1599120666014-930d774a350c?auto=format&fit=crop&q=80&w=800" },
  { id: 40, category: "Meals", name: "Porridge Yam", price: 3000, description: "Asaro - Yam cooked in a rich palm oil sauce.", image: "https://images.unsplash.com/photo-1629199347895-320c2b29df99?auto=format&fit=crop&q=80&w=800" },
  { id: 41, category: "Meals", name: "Masa", price: 1000, description: "Traditional Northern rice cakes, pan-fried.", image: "https://images.unsplash.com/photo-1626505927329-373a0332308e?auto=format&fit=crop&q=80&w=800" },
  { id: 42, category: "Meals", name: "Pounded Yam", price: 1200, description: "Smooth, stretchy pounded yam.", image: "https://images.unsplash.com/photo-1643487372226-78a0f8eb5b62?auto=format&fit=crop&q=80&w=800" },
  { id: 43, category: "Meals", name: "Semo", price: 1000, description: "Soft Semovita swallow.", image: "https://images.unsplash.com/photo-1643487372226-78a0f8eb5b62?auto=format&fit=crop&q=80&w=800" },
  { id: 44, category: "Meals", name: "Amala", price: 1000, description: "Classic dark yam flour swallow.", image: "https://images.unsplash.com/photo-1643487372226-78a0f8eb5b62?auto=format&fit=crop&q=80&w=800" },
  { id: 45, category: "Meals", name: "Fufu", price: 1000, description: "Fermented cassava dough.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800" },
  { id: 46, category: "Meals", name: "Garri", price: 1000, description: "Eba - Cassava flakes dough.", image: "https://images.unsplash.com/photo-1643487372226-78a0f8eb5b62?auto=format&fit=crop&q=80&w=800" },
  { id: 47, category: "Meals", name: "Yam Stick", price: 1500, description: "Fried yam batons, crispy on the outside.", image: "https://images.unsplash.com/photo-1623594611048-3608cc78949f?auto=format&fit=crop&q=80&w=800" },
  { id: 48, category: "Meals", name: "Yam and Egg Sauce", price: 3000, description: "Boiled yam paired with savory egg sauce.", image: "resources/IMG_1989.PNG" },
  { id: 49, category: "Meals", name: "Eggs", price: 400, description: "Boiled or fried egg.", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800" },
  { id: 50, category: "Protein", name: "Smoky Goat Pepper Soup", price: 3000, description: "Slow-simmered broth with tender smoked goat.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
  { id: 51, category: "Protein", name: "Bistro Chicken Wings", price: 5000, description: "Succulent grilled wings in bistro glaze.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800" },
  { id: 52, category: "Protein", name: "Full Chicken", price: 20000, description: "Whole grilled chicken from the flaming grills.", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800" },
  { id: 53, category: "Protein", name: "Portion O' Chicken", price: 6000, description: "A generous serving of fried or grilled chicken.", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" },
  { id: 54, category: "Protein", name: "Goat Meat", price: 1500, description: "Tender, seasoned goat meat.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800" },
  { id: 55, category: "Protein", name: "Beef", price: 1500, description: "Succulent fried beef piece.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800" },
  { id: 56, category: "Protein", name: "Portion of Beef/Goat", price: 4500, description: "A bowl of assorted savory meats.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800" },
  { id: 57, category: "Protein", name: "Turkey", price: 6000, description: "Fried or grilled turkey wings.", image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800" },
  { id: 58, category: "Protein", name: "Cat Fish (Portion)", price: 1000, description: "Fresh catfish slice in sauce.", image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800" },
  { id: 59, category: "Protein", name: "Croaker Fish", price: 4000, description: "Whole grilled or fried croaker.", image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&q=80&w=800" },
  { id: 60, category: "Protein", name: "Nkwobi", price: 10000, description: "Spicy cow foot delicacy in native sauce.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
  { id: 61, category: "Protein", name: "Vegetable Chicken", price: 20000, description: "Chicken stir-fry with mixed vegetables.", image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800" },
  { id: 62, category: "Soups", name: "Egusi", price: 500, description: "Rich melon seed soup with spinach.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
  { id: 63, category: "Soups", name: "Vegetable Soup", price: 1500, description: "Nutritious Edikang Ikong style soup.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
  { id: 64, category: "Soups", name: "White Soup", price: 2000, description: "Ofe Nsala - Spicy traditional soup.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800" },
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

  // Hero Slides
  const heroSlides = MENU_ITEMS.filter(item => item.featured).slice(0, 5); 

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

  // Fix Flashing: Only update state if value actually changes
  useEffect(() => {
    const handleScroll = () => {
        const isScrolled = window.scrollY > 20;
        if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

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
            setChatHistory(prev => [...prev, { role: 'model', text: "I'm the concierge at Jay's Bistro. I see you're interested in our menu. My live connection is currently offline, but I highly recommend the Signature Jollof Risotto!" }]);
            setIsTyping(false);
        }, 1000);
        return;
    }
    
    // API logic would go here
    setIsTyping(false); 
  };

  const HeroSection = () => (
    <section className="relative h-screen w-full bg-bg-secondary overflow-hidden">
        <div className="absolute top-32 left-0 w-full z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
             <p className="text-accent text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4 shadow-black drop-shadow-md animate-[fadeIn_1s_ease-out]">Welcome to</p>
             <h2 className="font-handwritten text-6xl md:text-8xl text-white drop-shadow-xl animate-[fadeIn_1s_ease-out_0.2s_both]">Jay's Bistro</h2>
        </div>
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {heroSlides.map((slide) => (
                <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-center">
                    <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-24 left-0 w-full flex flex-col items-center justify-end pb-12 px-4 text-center z-20">
                        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight max-w-4xl mx-auto mb-8 drop-shadow-lg">{slide.name}</h1>
                        <button onClick={() => addToCart(slide)} className="flex items-center gap-3 bg-accent text-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg">
                            Order Now <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
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
              <div className="col-span-1 row-span-1 relative overflow-hidden group"><img src="IMG_2113.PNG" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="TEST " /></div>
          </div>
      </section>
    </div>
  );

  const MenuView = () => {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter logic: Match Category AND Search by Name Only
    const filtered = MENU_ITEMS.filter(item => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    return (
        <div className="pt-32 pb-20 min-h-screen view-fade-in container mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="font-serif text-5xl md:text-6xl mb-4 text-primary">The Menu Carte</h1>
                <p className="text-secondary font-light max-w-xl mx-auto">Discover flavors crafted with passion.</p>
            </div>

            {/* Menu Toolbar: Search Left, Categories Centered */}
            <div className="sticky top-[70px] z-30 bg-[var(--color-bg)] py-4 mb-8 border-b border-accent/20 -mx-6 px-6 shadow-sm transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Search Bar - Left on desktop */}
                    <div className="relative w-full md:w-64 flex-shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-accent" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 bg-bg-secondary text-primary border border-primary/10 rounded-full focus:outline-none focus:ring-1 focus:ring-accent text-xs tracking-widest uppercase"
                            placeholder="What are you craving?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Categories - Centered */}
                    <div className="flex-1 flex justify-start md:justify-center overflow-x-auto no-scrollbar w-full md:w-auto">
                        <div className="flex gap-6">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-sm uppercase tracking-widest pb-1 transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Spacer for desktop balance */}
                    <div className="hidden md:block w-64"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filtered.length > 0 ? (
                    filtered.map(item => (
                        <MenuCard key={item.id} item={item} cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-secondary">
                        <p>No delicious items found matching your craving.</p>
                        <button onClick={() => {setSearchQuery(''); setActiveCategory('All');}} className="text-accent hover:underline mt-2 text-sm uppercase tracking-widest">View Full Menu</button>
                    </div>
                )}
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
                    {/* Fixed template literals to prevent build errors */}
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
             <div className="p-4 flex justify-between items-center" style={{ backgroundColor: '#123456', color: '#123456' }}>
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