import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from './ProductCard.jsx';

const ProductGrid = () => {
  const { filteredProducts } = useStore();

  if (filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center text-stone-500 text-sm">
        <p className="font-medium">No dishes match your selection.</p>
        <p className="text-xs text-stone-400 mt-1">Try another category or clear your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;