import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import HeroCarousel from "../storefront/HeroCarousel.jsx";
import SubHero from "../storefront/SubHero.jsx";
import { Card, Sheet, btnGhost } from "./ui.jsx";
import { LIMITS } from "../../lib/menuDoc.js";
import { buildMenuModel } from "../../lib/menuModel.js";
import { searchItems } from "../../lib/search.js";
import { formatPrice } from "../../lib/format.js";

const noop = () => {};

/** Pick a dish for a slot. */
function Picker({ items, exclude, onPick, onClose, title }) {
  const [q, setQ] = useState("");
  const options = useMemo(() => {
    const pool = items.filter((i) => i.isActive && !exclude.includes(i.id));
    return q.trim() ? searchItems(pool, q) : pool;
  }, [items, exclude, q]);
  return (
    <Sheet open title={title} onClose={onClose}>
      <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" aria-label="Search dishes" className="mb-3 h-12 w-full rounded-full border border-cream-300 bg-cream-50 px-4 text-base outline-none focus:border-leaf-500" />
      <ul className="space-y-2">
        {options.map((i) => (
          <li key={i.id}>
            <button type="button" onClick={() => onPick(i.id)} className="flex w-full items-center gap-3 rounded-2xl border border-cream-300 bg-cream-100 p-2 text-left hover:bg-cream-200">
              <div className="h-12 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-leaf-800"><FoodImage src={i.image} alt="" variant={i.imageStyle} className={`h-full w-full ${i.imageStyle === "cutout" ? "p-1" : ""}`} /></div>
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{i.name}</span><span className="text-xs text-ink-500">{i.category} · {formatPrice(i.price)}</span></span>
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="py-6 text-center text-sm text-ink-500">No dishes to add.</li>}
      </ul>
    </Sheet>
  );
}

function Row({ item, onUp, onDown, onRemove, first, last }) {
  return (
    <li className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-100 p-2">
      <div className="h-12 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-leaf-800"><FoodImage src={item.image} alt="" variant={item.imageStyle} className={`h-full w-full ${item.imageStyle === "cutout" ? "p-1" : ""}`} /></div>
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.name}</span>
      {[[onUp, ArrowUp, "Move up", first], [onDown, ArrowDown, "Move down", last]].map(([fn, Icon, label, off]) => (
        <button key={label} type="button" onClick={fn} disabled={off} aria-label={`${label}: ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-200 disabled:opacity-25"><Icon size={16} /></button>
      ))}
      <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
    </li>
  );
}

/** Home-screen tab: choose what appears in the hero carousel and the two sub-hero cards, with a live preview. */
export default function LayoutManager({ draft, setDraft }) {
  const [picker, setPicker] = useState(null); // "hero" | 0 | 1
  const model = useMemo(() => buildMenuModel({ items: draft.items, categories: draft.categories, heroIds: draft.layout.heroIds, subheroIds: draft.layout.subheroIds, settings: draft.settings }), [draft]);
  const byId = model.byId;
  const { heroIds, subheroIds } = draft.layout;

  const setLayout = (patch) => setDraft((d) => ({ ...d, layout: { ...d.layout, ...patch } }));
  const move = (ids, i, dir) => {
    const next = [...ids];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    return next;
  };

  const pick = (id) => {
    if (picker === "hero") setLayout({ heroIds: [...heroIds, id] });
    else {
      const next = [...subheroIds];
      next[picker] = id;
      setLayout({ subheroIds: next.filter((x) => x != null) });
    }
    setPicker(null);
  };

  return (
    <div className="space-y-5 pb-28">
      <Card className="!p-0 overflow-hidden">
        <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-ink-500">Live preview</p>
        <div className="mx-auto max-w-md bg-cream-100 pb-4" aria-hidden="false">
          <HeroCarousel items={model.hero} iconByCategory={model.iconByCategory} onOpenProduct={noop} />
          <SubHero items={model.subhero} iconByCategory={model.iconByCategory} onOpenProduct={noop} />
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-base font-extrabold text-leaf-800">Hero carousel</h2>
          <span className="text-xs text-ink-500">{heroIds.length}/{LIMITS.maxHero} slides</span>
        </div>
        <ul className="space-y-2">
          {heroIds.map((id, i) => byId[id] && (
            <Row key={id} item={byId[id]} first={i === 0} last={i === heroIds.length - 1} onUp={() => setLayout({ heroIds: move(heroIds, i, -1) })} onDown={() => setLayout({ heroIds: move(heroIds, i, 1) })} onRemove={() => setLayout({ heroIds: heroIds.filter((x) => x !== id) })} />
          ))}
        </ul>
        {heroIds.length === 0 && <p className="py-3 text-center text-xs text-ink-500">The carousel is hidden until you add a slide.</p>}
        <button type="button" disabled={heroIds.length >= LIMITS.maxHero} onClick={() => setPicker("hero")} className={`${btnGhost} mt-3 w-full`}><Plus size={16} /> Add slide</button>
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-base font-extrabold text-leaf-800">Two feature cards</h2>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((slot) => {
            const item = byId[subheroIds[slot]];
            return (
              <div key={slot} className="rounded-2xl border border-cream-300 bg-cream-100 p-2.5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-500">{slot === 0 ? "Left (orange)" : "Right (green)"}</p>
                {item ? (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-10 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-leaf-800"><FoodImage src={item.image} alt="" variant={item.imageStyle} className="h-full w-full" /></div>
                    <span className="line-clamp-2 text-xs font-bold leading-tight">{item.name}</span>
                  </div>
                ) : <p className="mb-2 py-2 text-xs text-ink-500">Empty</p>}
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setPicker(slot)} className="flex-1 rounded-full bg-cream-50 py-2 text-xs font-bold ring-1 ring-cream-400">{item ? "Change" : "Choose"}</button>
                  {item && <button type="button" onClick={() => setLayout({ subheroIds: subheroIds.filter((_, i) => i !== slot) })} aria-label="Remove" className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 ring-1 ring-red-200"><Trash2 size={13} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {picker !== null && <Picker title={picker === "hero" ? "Add hero slide" : "Choose a dish"} items={draft.items} exclude={picker === "hero" ? heroIds : []} onPick={pick} onClose={() => setPicker(null)} />}
    </div>
  );
}
