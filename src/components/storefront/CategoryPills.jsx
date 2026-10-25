/** Horizontally scrolling category filter. */
export default function CategoryPills({ categories, selected, onSelect }) {
  return (
    <nav aria-label="Menu categories" className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto py-1">
      {categories.map((c) => {
        const active = c.name === selected;
        return (
          <button
            key={c.name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(c.name)}
            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm ring-1 transition ${
              active ? "bg-ink-800 text-white ring-ink-800" : "bg-sprout-100 text-ink-700 ring-sprout-200 hover:bg-sprout-200"
            }`}
          >
            <span aria-hidden="true" className="text-sm leading-none">{c.icon}</span>
            <span>{c.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
