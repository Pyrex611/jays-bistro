import ProductCard from "./ProductCard.jsx";
import CategoryIcon from "../icons/CategoryIcon.jsx";

const Grid = ({ items, iconByCategory, quantities, onOpenProduct, onAdd }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
    {items.map((item) => (
      <ProductCard key={item.id} item={item} icon={iconByCategory[item.category]} quantity={quantities[item.id] || 0} onOpen={onOpenProduct} onAdd={onAdd} />
    ))}
  </div>
);

/**
 * The menu body. Three modes:
 *   searching      → ranked results with a count
 *   one category   → that category's grid
 *   All            → every category as a titled section (so the whole menu is scannable by scrolling)
 */
export default function MenuSections({ mode, query, items, categories, iconByCategory, quantities, onOpenProduct, onAdd, onClearSearch }) {
  const shared = { iconByCategory, quantities, onOpenProduct, onAdd };

  if (mode === "search") {
    return (
      <div aria-live="polite">
        <p className="mb-3 text-xs font-semibold text-ink-500">
          {items.length === 0 ? "No dishes match" : `${items.length} dish${items.length === 1 ? "" : "es"} for`} &ldquo;{query.trim()}&rdquo;
        </p>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cream-400 bg-cream-50 p-6 text-center">
            <CategoryIcon name="all" size={36} className="mx-auto text-leaf-600" />
            <p className="mt-2 text-sm font-bold">Nothing like that on the menu yet</p>
            <p className="mt-1 text-xs text-ink-500">Check the spelling, or try a category like &ldquo;soup&rdquo; or &ldquo;rice&rdquo;.</p>
            <button type="button" onClick={onClearSearch} className="mt-3 rounded-full bg-leaf-700 px-4 py-2 text-xs font-bold text-white">Show full menu</button>
          </div>
        ) : (
          <Grid items={items} {...shared} />
        )}
      </div>
    );
  }

  if (mode === "all") {
    return (
      <div className="space-y-8">
        {categories
          .filter((c) => c.name !== "All")
          .map((c) => {
            const inCategory = items.filter((i) => i.category === c.name);
            if (!inCategory.length) return null;
            return (
              <section key={c.name} aria-labelledby={`cat-${c.name}`}>
                <h2 id={`cat-${c.name}`} className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-leaf-800">
                  <CategoryIcon name={c.icon} size={22} className="text-sun-600" />
                  {c.name}
                  <span className="text-xs font-semibold text-ink-400">{inCategory.length}</span>
                </h2>
                <Grid items={inCategory} {...shared} />
              </section>
            );
          })}
      </div>
    );
  }

  return items.length === 0 ? <p className="py-8 text-center text-sm text-ink-500">Nothing here yet.</p> : <Grid items={items} {...shared} />;
}
