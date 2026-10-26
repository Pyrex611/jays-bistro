import { Search, X } from "lucide-react";

/** Menu search. `type="search"` + 16px text: right mobile keyboard, no iOS zoom. */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative mb-3">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search jollof, shawarma, tea…"
        aria-label="Search the menu"
        autoComplete="off"
        className="h-12 w-full rounded-full border border-cream-300 bg-cream-50 pl-10 pr-11 text-base text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
