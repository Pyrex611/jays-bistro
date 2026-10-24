import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { CATEGORIES } from '../data/menu.js';
import { CategoryIcons } from '../data/categoryIcons.jsx';
import { Search, X } from 'lucide-react';

const CategoryPills = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  return (
    <div className="mt-3">
      {/* Search Input */}
      <div className="relative mb-2.5">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search food, drinks, shawarma..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-stone-200 text-stone-800 text-xs rounded-full pl-8 pr-8 py-2 outline-none focus:border-bistro-500 shadow-sm transition"
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

      {/* Bonti-Styled Category Pills with Line-Art Stroke Pencil Icons */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => {
          const active = cat.key === selectedCategory;
          const IconComponent = CategoryIcons[cat.key] || CategoryIcons.All;
          
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition shadow-sm ${
                active
                  ? "bg-bistro-700 text-white ring-1 ring-bistro-800"
                  : "bg-caramel-100 text-caramel-900 ring-1 ring-caramel-200 hover:bg-caramel-200"
              }`}
            >
              <IconComponent size={13} className={active ? "text-white" : "text-caramel-800"} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPills;