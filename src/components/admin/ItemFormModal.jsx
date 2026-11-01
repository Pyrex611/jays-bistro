import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { CATEGORIES } from '../../data/menu.js';
import { X, Sparkles } from 'lucide-react';

const ItemFormModal = ({ itemToEdit, onClose }) => {
  const { addProduct, updateProduct } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category: 'Meals',
    price: '',
    description: '',
    image: '',
    isHero: false,
    isDualGrid: null
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        tagline: itemToEdit.tagline || '',
        category: itemToEdit.category || 'Meals',
        price: itemToEdit.price || '',
        description: itemToEdit.description || '',
        image: itemToEdit.image || '',
        isHero: !!itemToEdit.isHero,
        isDualGrid: itemToEdit.isDualGrid || null
      });
    }
  }, [itemToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    if (itemToEdit) {
      updateProduct(itemToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-caramel-600" />
            <h3 className="font-bold text-sm text-stone-900">
              {itemToEdit ? 'Edit Menu Dish' : 'Add New Dish to Jay\'s Menu'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full text-stone-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto scrollbar-hide text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Dish Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Smoky Jollof Deluxe"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
              >
                {CATEGORIES.filter(c => c.key !== "All").map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Price (₦ Naira)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 4500"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Short Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Firewood-smoked with tender beef"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Full Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe seasoning, ingredients, sides included..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-caramel-500"
            />
          </div>

          {/* Placement Toggles */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isHero}
                onChange={(e) => setFormData({ ...formData, isHero: e.target.checked })}
                className="rounded accent-caramel-600"
              />
              <span className="font-bold text-stone-800">Pin to Hero Top Carousel</span>
            </label>

            <div className="flex items-center gap-3 pt-1 border-t border-stone-200">
              <span className="font-bold text-stone-700">Dual Grid Spotlight:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="dualSpotlight"
                  checked={formData.isDualGrid === 'left'}
                  onChange={() => setFormData({ ...formData, isDualGrid: 'left' })}
                  className="accent-caramel-600"
                />
                <span>Left</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="dualSpotlight"
                  checked={formData.isDualGrid === 'right'}
                  onChange={() => setFormData({ ...formData, isDualGrid: 'right' })}
                  className="accent-caramel-600"
                />
                <span>Right</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="dualSpotlight"
                  checked={!formData.isDualGrid}
                  onChange={() => setFormData({ ...formData, isDualGrid: null })}
                  className="accent-caramel-600"
                />
                <span>None</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-stone-300 font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-stone-900 text-white font-bold uppercase tracking-wider hover:bg-caramel-600 transition shadow-md"
            >
              Save Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;