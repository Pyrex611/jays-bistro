import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, ChefHat, Coffee, Utensils, Star, ArrowRight, Menu } from 'lucide-react';

const App = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("Tea & Refreshments");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle Scroll for Navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Mock Data ---
  const categories = [
    { id: 'tea', label: "Tea & Refreshments", icon: <Coffee size={18} /> },
    { id: 'appetizers', label: "Appetizers", icon: <Star size={18} /> },
    { id: 'meals', label: "Meals", icon: <Utensils size={18} /> },
    { id: 'bites', label: "Bites & Small Chops", icon: <ChefHat size={18} /> },
  ];

  const menuItems = [
    // Tea & Refreshments
    { id: 1, category: "Tea & Refreshments", name: "Classic Arabian Tea", price: 1200, description: "Our signature spiced tea blend with cardamom and cloves.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800" },
    { id: 2, category: "Tea & Refreshments", name: "Mint Infusion", price: 1000, description: "Fresh mint leaves steeped to perfection with honey.", image: "https://images.unsplash.com/photo-1596918839088-7512534563a3?auto=format&fit=crop&q=80&w=800" },
    { id: 3, category: "Tea & Refreshments", name: "Zobo Chill", price: 1500, description: "Iced hibiscus tea infused with ginger and pineapple.", image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800" },
    { id: 4, category: "Tea & Refreshments", name: "Karak Chai", price: 1400, description: "Strong tea simmered with milk and spices.", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=800" },

    // Appetizers
    { id: 5, category: "Appetizers", name: "Spicy Goat Meat Pepper Soup", price: 3500, description: "A fiery broth with tender cuts of goat meat.", image: "https://images.unsplash.com/photo-1543826173-1beeb97525d8?auto=format&fit=crop&q=80&w=800" },
    { id: 6, category: "Appetizers", name: "Grilled Chicken Wings", price: 2800, description: "Glazed in our special spicy orange BBQ sauce.", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=800" },
    
    // Meals
    { id: 7, category: "Meals", name: "Jay's Special Jollof", price: 4500, description: "Smoky party jollof rice served with fried plantain and beef.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800" },
    { id: 8, category: "Meals", name: "Grilled Fish & Chips", price: 6000, description: "Fresh croaker fish grilled to perfection served with yam chips.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
    { id: 9, category: "Meals", name: "Creamy Alfredo Pasta", price: 5000, description: "Fettuccine tossed in a rich parmesan sauce with chicken strips.", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800" },

    // Bites & Small Chops
    { id: 10, category: "Bites & Small Chops", name: "Spring Rolls (3pcs)", price: 1200, description: "Crispy pastry filled with minced vegetables and chicken.", image: "https://images.unsplash.com/photo-1544025162-d76690b67f11?auto=format&fit=crop&q=80&w=800" },
    { id: 11, category: "Bites & Small Chops", name: "Samosa Trio", price: 1200, description: "Golden fried pockets of spiced minced meat.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800" },
    { id: 12, category: "Bites & Small Chops", name: "Puff Puff Basket", price: 1000, description: "Sweet, fluffy fried dough balls, dusted with sugar.", image: "https://images.unsplash.com/photo-1630405433873-91851d45763e?auto=format&fit=crop&q=80&w=800" },
  ];

  // --- Cart Logic ---
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    // setIsCartOpen(true); // Removed auto-open behavior
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Formatting Currency
  const formatPrice = (price) => {
    return "₦" + price.toLocaleString();
  };

  const filteredItems = menuItems.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
              J
            </div>
            <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-gray-900 md:text-white'}`}>
              Jay's Bistro
            </span>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-orange-50 rounded-full transition-colors group"
          >
            <div className={`p-2 rounded-full ${scrolled ? 'bg-orange-100 text-orange-600' : 'bg-white/20 backdrop-blur-md text-gray-900 md:text-white'} group-hover:bg-orange-500 group-hover:text-white transition-all`}>
              <ShoppingBag size={24} />
            </div>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md transform scale-110">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1600" 
            alt="Bistro Atmosphere" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-16">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm font-semibold mb-4 backdrop-blur-sm">
            Est. 2018
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Taste the <span className="text-orange-500">Tradition</span>,<br />
            Savor the Moment.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto font-light">
            From our humble beginnings serving Arabian tea to a full culinary experience. Welcome to Jay's.
          </p>
          <button 
            onClick={() => {
              const menuSection = document.getElementById('menu-section');
              menuSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Explore Menu <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* --- Menu Section --- */}
      <section id="menu-section" className="py-20 px-4 md:px-6 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 sticky top-24 z-30 py-2 bg-gray-50/95 backdrop-blur-sm md:static md:bg-transparent">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.label)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 border
                ${activeTab === cat.label 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 transform scale-105' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50'}
              `}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                  {formatPrice(item.price)}
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">{item.description}</p>
                
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                >
                  <Plus size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Cart Drawer (Sidebar) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300">
              {/* Cart Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Your Order <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{cartCount}</span>
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <ShoppingBag size={64} className="mb-4 text-gray-200" />
                    <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                    <p className="text-sm">Looks like you haven't added anything yet.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 text-orange-500 font-medium hover:underline"
                    >
                      Start Ordering
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-orange-500 font-medium text-sm mb-2">{formatPrice(item.price)}</p>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                               onClick={() => removeFromCart(item.id)}
                               className="ml-auto text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service Charge (5%)</span>
                      <span>{formatPrice(cartTotal * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal * 1.05)}</span>
                    </div>
                  </div>
                  <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 flex justify-between px-6">
                    <span>Checkout</span>
                    <span>{formatPrice(cartTotal * 1.05)}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                 <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">J</div>
                 <span className="text-2xl font-bold">Jay's Bistro</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Combining minimal modern design with the authentic taste of home. 
              </p>
            </div>
            
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="hover:text-orange-500 transition-colors">Instagram</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Facebook</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Jay's Bistro. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;