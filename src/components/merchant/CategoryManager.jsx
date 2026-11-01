import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CategoryIcon from "../icons/CategoryIcon.jsx";
import { Sheet, btnGhost, btnPrimary } from "./ui.jsx";
import { inputClass } from "../ui/formStyles.js";
import { ICON_KEYS } from "../../lib/categoryIcons.js";

const ICONS = ICON_KEYS.filter((k) => k !== "all");

/** Rename, re-icon, add and remove categories. A category can only be removed when it has no dishes. */
export default function CategoryManager({ categories, items, onChange, onClose }) {
  const [rows, setRows] = useState(categories.map((c) => ({ ...c, original: c.name })));
  const [error, setError] = useState("");
  const count = (name) => items.filter((i) => i.category === name).length;

  const update = (i, patch) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const save = () => {
    const names = rows.map((r) => r.name.trim());
    if (names.some((n) => n.length < 2 || n.length > 30)) return setError("Each category needs a name of 2–30 characters.");
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return setError("Category names must be different from each other.");
    const renames = Object.fromEntries(rows.filter((r) => r.original && r.original !== r.name.trim()).map((r) => [r.original, r.name.trim()]));
    onChange(rows.map((r, i) => ({ name: names[i], icon: r.icon })), renames);
  };

  return (
    <Sheet open title="Categories" onClose={onClose} footer={<button type="button" className={`${btnPrimary} w-full`} onClick={save}>Save categories</button>}>
      <ul className="space-y-3">
        {rows.map((row, i) => {
          const n = row.original ? count(row.original) : 0;
          return (
            <li key={row.original ?? `new-${i}`} className="rounded-2xl border border-cream-300 bg-cream-100 p-3">
              <div className="flex items-center gap-2">
                <input aria-label="Category name" className={`${inputClass(false)} !h-11`} value={row.name} onChange={(e) => update(i, { name: e.target.value })} />
                <button type="button" disabled={n > 0} onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} aria-label={`Delete ${row.name}`} title={n > 0 ? `${n} dishes use this category` : "Delete"} className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 size={16} /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Icon">
                {ICONS.map((k) => (
                  <button key={k} type="button" aria-pressed={row.icon === k} aria-label={k} onClick={() => update(i, { icon: k })} className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${row.icon === k ? "bg-leaf-700 text-sun-300 ring-leaf-700" : "bg-cream-50 text-leaf-600 ring-cream-300"}`}><CategoryIcon name={k} size={18} /></button>
                ))}
              </div>
              {n > 0 && <p className="mt-1.5 text-[11px] text-ink-500">{n} dish{n === 1 ? "" : "es"}</p>}
            </li>
          );
        })}
      </ul>
      <button type="button" className={`${btnGhost} mt-3 w-full`} onClick={() => setRows((r) => [...r, { name: "", icon: "meals", original: null }])}><Plus size={16} /> Add category</button>
      {error && <p role="alert" className="mt-3 text-xs font-medium text-red-600">{error}</p>}
    </Sheet>
  );
}
