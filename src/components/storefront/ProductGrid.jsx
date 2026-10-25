import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ items, quantities, onOpenProduct, onAdd }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-400">Nothing here yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} quantity={quantities[item.id] || 0} onOpen={onOpenProduct} onAdd={onAdd} />
      ))}
    </div>
  );
}
