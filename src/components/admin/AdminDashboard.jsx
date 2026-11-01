import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import AnalyticsView from './AnalyticsView.jsx';
import BusinessInsightsView from './BusinessInsightsView.jsx';
import ItemFormModal from './ItemFormModal.jsx';
import FoodImage from '../FoodImage.jsx';
import { X, Plus, Edit2, Trash2, Star, Layers, BarChart2, TrendingUp, RotateCcw } from 'lucide-react';

const AdminDashboard = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    deleteProduct,
    toggleHeroStatus,
    setDualSpotlight,
    resetToDefaults
  } = useStore();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'analytics' | 'insights'
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdminOpen) return null;

  const filteredItems = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bistro-700 text-white flex items-center justify-center font-black">
              JB
            </div>
            <div>
              <h2 className="font-extrabold text-base text-stone-900 leading-tight">Jay's Bistro Merchant Portal</h2>
              <p className="text-[10px] text-stone-500 font-medium">Menu Control, Hero Positioning & SMB Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            aria-label="Close Portal"
            className="p-1.5 hover:bg-stone-200 rounded-full text-stone-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Dedicated Tabs */}
        <div className="flex border-b border-stone-200 px-3 bg-white overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'inventory'
                ? 'border-bistro-700 text-bistro-800'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Layers size={14} /> Catalog ({products.length})
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'analytics'
                ? 'border-bistro-700 text-bistro-800'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <BarChart2 size={14} /> Order Analytics
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`py-3 px-3 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'insights'
                ? 'border-caramel-600 text-caramel-800'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <TrendingUp size={14} /> BI & Insights
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {activeTab === 'insights' ? (
            <BusinessInsightsView />
          ) : activeTab === 'analytics' ? (
            <AnalyticsView />
          ) : (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex justify-between items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter catalog dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-full px-3.5 py-1.5 text-xs outline-none focus:border-bistro-500 flex-1"
                />
                
                <button
                  onClick={() => {
                    if (window.confirm("Reset all hero/subhero assignments to Jay's Bistro brand defaults?")) {
                      resetToDefaults();
                    }
                  }}
                  title="Reset layout defaults (Shawarma & Wings in Hero, Arabian Blend & Double Root in Subhero)"
                  className="p-1.5 bg-stone-100 border border-stone-200 rounded-full text-stone-600 hover:bg-stone-200 transition"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-bistro-700 text-white px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 hover:bg-bistro-800 transition shadow-sm whitespace-nowrap"
                >
                  <Plus size={14} /> Add Dish
                </button>
              </div>

              {/* Dish List */}
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3 hover:border-bistro-300 transition"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                      <FoodImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-stone-900 truncate">{item.name}</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-stone-200 text-stone-700">
                          {item.category}
                        </span>
                        {item.isHero && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                            <Star size={9} fill="currentColor" /> Hero
                          </span>
                        )}
                        {item.isDualGrid && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-bistro-100 text-bistro-900">
                            Subhero ({item.isDualGrid})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-extrabold text-caramel-700 mt-0.5">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleHeroStatus(item.id)}
                        title={item.isHero ? "Remove from Hero carousel" : "Pin to Hero carousel"}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition ${
                          item.isHero
                            ? "bg-amber-100 border-amber-300 text-amber-900"
                            : "bg-white border-stone-200 text-stone-400 hover:text-amber-700"
                        }`}
                      >
                        <Star size={13} fill={item.isHero ? "currentColor" : "none"} />
                      </button>

                      <button
                        onClick={() => {
                          const next = item.isDualGrid === 'left' ? 'right' : item.isDualGrid === 'right' ? null : 'left';
                          setDualSpotlight(item.id, next);
                        }}
                        title={`Sub-hero Spotlight: ${item.isDualGrid || 'None'}`}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase transition ${
                          item.isDualGrid
                            ? "bg-bistro-100 border-bistro-300 text-bistro-900"
                            : "bg-white border-stone-200 text-stone-400 hover:text-stone-700"
                        }`}
                      >
                        {item.isDualGrid || 'Subhero'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 transition"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${item.name} from menu?`)) {
                            deleteProduct(item.id);
                          }
                        }}
                        className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <ItemFormModal
            itemToEdit={editingItem}
            onClose={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
          />
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;