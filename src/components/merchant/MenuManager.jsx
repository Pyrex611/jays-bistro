import { useMemo, useState } from "react";
import { ImageOff, Plus, Search, Tags } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { Switch, btnGhost } from "./ui.jsx";
import ItemEditor from "./ItemEditor.jsx";
import CategoryManager from "./CategoryManager.jsx";
import { searchItems } from "../../lib/search.js";
import { formatPrice } from "../../lib/format.js";
import { nextItemId } from "../../lib/menuDoc.js";

const blank = (category) => ({ id: 0, category, name: "", price: 0, description: "", image: "", imageStyle: "cutout", featured: false, isActive: true, isAvailable: true });

/** Menu tab: find a dish, flip "in stock", edit, add, delete, manage categories. Edits go to the draft; Publish makes them live. */
export default function MenuManager({ draft, setDraft }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  const iconOf = useMemo(() => Object.fromEntries(draft.categories.map((c) => [c.name, c.icon])), [draft.categories]);
  const list = useMemo(() => {
    const base = query.trim() ? searchItems(draft.items, query) : draft.items;
    return filter === "All" ? base : base.filter((i) => i.category === filter);
  }, [draft.items, query, filter]);

  const patchItem = (id, patch) => setDraft((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  const saveItem = (item) => {
    setDraft((d) => {
      const exists = d.items.some((i) => i.id === item.id && item.id);
      return { ...d, items: exists ? d.items.map((i) => (i.id === item.id ? item : i)) : [...d.items, { ...item, id: nextItemId(d.items) }] };
    });
    setEditing(null);
  };

  const deleteItem = (id) => {
    setDraft((d) => ({
      ...d,
      items: d.items.filter((i) => i.id !== id),
      layout: { heroIds: d.layout.heroIds.filter((x) => x !== id), subheroIds: d.layout.subheroIds.filter((x) => x !== id) },
    }));
    setEditing(null);
  };

  const saveCategories = (categories, renames) => {
    setDraft((d) => ({ ...d, categories, items: d.items.map((i) => ({ ...i, category: renames[i.category] ?? i.category })) }));
    if (filter !== "All" && renames[filter]) setFilter(renames[filter]);
    setShowCategories(false);
  };

  return (
    <div>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${draft.items.length} dishes…`} aria-label="Search dishes" className="h-12 w-full rounded-full border border-cream-300 bg-cream-50 pl-10 pr-4 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200" />
      </div>

      <div className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {["All", ...draft.categories.map((c) => c.name)].map((name) => (
          <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)} className={`flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ring-1 ${filter === name ? "bg-leaf-700 text-white ring-leaf-700" : "bg-cream-50 text-ink-700 ring-cream-300"}`}>
            {name}{name !== "All" && <span className="ml-1 opacity-60">{draft.items.filter((i) => i.category === name).length}</span>}
          </button>
        ))}
        <button type="button" onClick={() => setShowCategories(true)} className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-leaf-700 ring-1 ring-leaf-300"><Tags size={14} /> Edit</button>
      </div>

      <ul className="mt-4 space-y-2.5 pb-28">
        {list.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-2.5">
            <button type="button" onClick={() => setEditing(item)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Edit ${item.name}`}>
              <div className="h-14 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-leaf-800">
                <FoodImage src={item.image} alt="" variant={item.imageStyle} icon={iconOf[item.category]} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-1" : ""}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{item.name}</p>
                <p className="truncate text-xs text-ink-500">{item.category} · <span className="font-semibold text-leaf-700">{formatPrice(item.price)}</span></p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {!item.isActive && <span className="rounded bg-ink-200 px-1.5 py-px text-[10px] font-bold text-ink-700">Hidden</span>}
                  {item.image === "menu/placeholder.svg" && <span className="inline-flex items-center gap-0.5 rounded bg-sun-100 px-1.5 py-px text-[10px] font-bold text-sun-800"><ImageOff size={10} />No photo</span>}
                </div>
              </div>
            </button>
            <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
              <Switch checked={item.isAvailable} onChange={(v) => patchItem(item.id, { isAvailable: v })} label={`${item.name} in stock`} />
              <span className="text-[10px] font-semibold text-ink-500">{item.isAvailable ? "In stock" : "Sold out"}</span>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="py-10 text-center text-sm text-ink-500">No dishes found.</li>}
      </ul>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20">
        <div className="mx-auto flex max-w-2xl justify-end px-4">
          <button type="button" onClick={() => setEditing(blank(filter !== "All" ? filter : draft.categories[0]?.name ?? ""))} className={`${btnGhost} pointer-events-auto !border-0 !bg-sun-500 !text-leaf-950 shadow-fab`}><Plus size={18} strokeWidth={2.5} /> Add dish</button>
        </div>
      </div>

      {editing && <ItemEditor item={editing} categories={draft.categories} onSave={saveItem} onDelete={deleteItem} onClose={() => setEditing(null)} />}
      {showCategories && <CategoryManager categories={draft.categories} items={draft.items} onChange={saveCategories} onClose={() => setShowCategories(false)} />}
    </div>
  );
}
