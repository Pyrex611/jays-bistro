import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { CATEGORIES } from '../data/menu.js';
import { Search, X } from 'lucide-react';

const CategoryPills = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  return (
    <div className="mt-3">
      {/* Inline Search Bar */}
      <div className="relative mb-2.5">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search food, drinks, snacks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-stone-200 text-stone-800 text-xs rounded-full pl-8 pr-8 py-2 outline-none focus:border-caramel-500 shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Horizontal Pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => {
          const active = cat.key === selectedCategory;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition shadow-sm ${
                active
                  ? "bg-caramel-500 text-white ring-1 ring-caramel-600"
                  : "bg-caramel-100 text-caramel-800 ring-1 ring-caramel-200 hover:bg-caramel-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPills;