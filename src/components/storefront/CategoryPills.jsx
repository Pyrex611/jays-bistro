import CategoryIcon from "../icons/CategoryIcon.jsx";

/** Sticky horizontal category filter with line-art icons (stays under the header while the menu scrolls). */
export default function CategoryPills({ categories, selected, onSelect, dimmed = false }) {
  return (
    <nav
      aria-label="Menu categories"
      className="scrollbar-hide sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 flex gap-2 overflow-x-auto bg-cream-100/95 px-4 py-2 backdrop-blur"
    >
      {categories.map((c) => {
        const active = !dimmed && c.name === selected;
        return (
          <button
            key={c.name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(c.name)}
            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full py-2 pl-3 pr-3.5 text-xs font-bold tracking-wide ring-1 transition ${
              active ? "bg-leaf-700 text-white ring-leaf-700" : "bg-cream-50 text-ink-700 ring-cream-300 hover:bg-cream-200"
            }`}
          >
            <CategoryIcon name={c.icon} size={18} className={active ? "text-sun-300" : "text-leaf-600"} />
            <span>{c.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
