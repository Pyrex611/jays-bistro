import { useEffect, useRef } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import CategoryIcon from "../icons/CategoryIcon.jsx";

/**
 * Sticky bar under the header. Two layers in the same 56 px strip:
 *   • pills (line-art icons) that follow the scroll and slide the active pill into view, with a magnifier pinned at the end
 *   • the search field, which replaces the pills when the magnifier is tapped (saves a whole row on the first screen)
 */
export default function CategoryBar({ groups, active, onSelect, searchOpen, query, onQueryChange, onOpenSearch, onCloseSearch }) {
  const scroller = useRef(null);
  const input = useRef(null);

  // Keep the active pill centred as the user scrolls the menu (horizontal only, never moves the page).
  useEffect(() => {
    const row = scroller.current;
    const pill = row?.querySelector(`[data-pill="${CSS.escape(active ?? "")}"]`);
    if (!row || !pill) return;
    const left = pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);

  return (
    <div data-category-bar className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 bg-cream-100/95 backdrop-blur">
      <div className="relative h-14">
        <nav
          ref={scroller}
          aria-label="Menu categories"
          aria-hidden={searchOpen}
          className={`scrollbar-hide absolute inset-0 flex items-center gap-2 overflow-x-auto pl-4 pr-16 transition duration-200 ${searchOpen ? "pointer-events-none -translate-x-3 opacity-0" : "opacity-100"}`}
        >
          {groups.map((g) => {
            const on = g.name === active;
            return (
              <button
                key={g.name}
                type="button"
                data-pill={g.name}
                aria-current={on ? "true" : undefined}
                tabIndex={searchOpen ? -1 : 0}
                onClick={() => onSelect(g.name)}
                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full py-2 pl-3 pr-3.5 text-xs font-bold tracking-wide ring-1 transition-colors duration-300 ${on ? "bg-leaf-700 text-white ring-leaf-700" : "bg-cream-50 text-ink-700 ring-cream-300 hover:bg-cream-200"}`}
              >
                <CategoryIcon name={g.icon} size={18} className={on ? "text-sun-300" : "text-leaf-600"} />
                <span>{g.name}</span>
              </button>
            );
          })}
        </nav>

        {/* soft fade + the magnifier pinned at the end of the row */}
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream-100 via-cream-100/90 to-transparent transition-opacity ${searchOpen ? "opacity-0" : "opacity-100"}`} />
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search the menu"
          tabIndex={searchOpen ? -1 : 0}
          className={`absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-leaf-700 shadow-sm ring-1 ring-cream-300 transition hover:bg-cream-200 active:scale-95 ${searchOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <Search size={18} />
        </button>

        <div className={`absolute inset-0 flex items-center gap-2 px-3 transition duration-200 ${searchOpen ? "opacity-100" : "pointer-events-none translate-x-3 opacity-0"}`} aria-hidden={!searchOpen}>
          <button type="button" onClick={onCloseSearch} tabIndex={searchOpen ? 0 : -1} aria-label="Close search" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-cream-200">
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex-1">
            <input
              ref={input}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              tabIndex={searchOpen ? 0 : -1}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCloseSearch();
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="Search jollof, shawarma, tea…"
              aria-label="Search the menu"
              autoComplete="off"
              // 16px text prevents iOS Safari from zooming the page on focus
              className="h-11 w-full rounded-full border border-cream-300 bg-cream-50 pl-4 pr-10 text-base text-ink-900 outline-none placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => { onQueryChange(""); input.current?.focus(); }} aria-label="Clear search" className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
