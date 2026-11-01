import ProductCard from "./ProductCard.jsx";
import CategoryIcon from "../icons/CategoryIcon.jsx";

/**
 * The menu body: ONE continuous grid (no category headings repeating down the page). The sticky category bar follows the scroll
 * (see useScrollSpy); each group's first card carries `data-group-start` so the bar knows where we are and can jump there.
 * While searching, ranked results replace the grid.
 */
export default function MenuSections({ mode, query, items, groups, iconByCategory, quantities, onOpenProduct, onAdd, onDecrement, onClearSearch }) {
  const shared = { onOpen: onOpenProduct, onAdd, onDecrement };

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
            <p className="mt-1 text-xs text-ink-500">Check the spelling, or try a word like &ldquo;soup&rdquo; or &ldquo;rice&rdquo;.</p>
            <button type="button" onClick={onClearSearch} className="mt-3 rounded-full bg-leaf-700 px-4 py-2 text-xs font-bold text-white">Back to the menu</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {items.map((item) => <ProductCard key={item.id} item={item} icon={iconByCategory[item.category]} quantity={quantities[item.id] || 0} {...shared} />)}
          </div>
        )}
      </div>
    );
  }

  // Grouped order keeps each category contiguous; the first card of each group is the scroll anchor.
  const ordered = groups.flatMap((g) => items.filter((i) => i.category === g.name));
  const firstIds = new Set(groups.map((g) => items.find((i) => i.category === g.name)?.id).filter((id) => id != null));

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      {ordered.map((item) => (
        <ProductCard key={item.id} item={item} icon={iconByCategory[item.category]} quantity={quantities[item.id] || 0} groupStart={firstIds.has(item.id)} {...shared} />
      ))}
    </div>
  );
}
