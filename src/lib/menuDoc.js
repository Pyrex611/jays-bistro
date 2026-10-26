import { CATEGORIES, MENU_ITEMS } from "../data/menu.js";
import { HERO_ITEM_IDS, SUBHERO_ITEM_IDS } from "../data/layout.js";
import { DEFAULT_ICON, ICON_KEYS } from "./categoryIcons.js";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settings.js";

/**
 * The menu document: the single JSON object the merchant edits and the storefront reads.
 *   { version, updatedAt, categories[], items[], layout:{heroIds[], subheroIds[]}, settings }
 * Validation here runs on the server (authoritative) and in the portal (instant feedback).
 */

export const LIMITS = { name: 80, description: 280, maxPrice: 10_000_000, maxHero: 6, maxSubhero: 2, maxItems: 500 };

export function defaultMenuDoc() {
  return {
    version: 0,
    updatedAt: null,
    categories: CATEGORIES.map((c) => ({ ...c })),
    items: MENU_ITEMS.map((i) => ({ ...i })),
    layout: { heroIds: [...HERO_ITEM_IDS], subheroIds: [...SUBHERO_ITEM_IDS] },
    settings: { ...DEFAULT_SETTINGS },
  };
}

export const nextItemId = (items) => items.reduce((max, i) => Math.max(max, i.id), 0) + 1;

const isSafeImage = (src) => typeof src === "string" && src.length <= 600 && /^(https:\/\/|menu\/|uploads\/|\/__local\/images\/)/.test(src);
const isPlainString = (v) => typeof v === "string";

/**
 * @returns {{ ok: true, doc: object } | { ok: false, errors: string[] }}
 */
export function validateMenuDoc(input) {
  const errors = [];
  if (!input || typeof input !== "object") return { ok: false, errors: ["Menu must be an object"] };

  // categories
  const rawCats = Array.isArray(input.categories) ? input.categories : [];
  if (rawCats.length === 0) errors.push("At least one category is required");
  const seenCats = new Set();
  const categories = rawCats.map((c, i) => {
    const name = isPlainString(c?.name) ? c.name.trim() : "";
    if (name.length < 2 || name.length > 30) errors.push(`Category ${i + 1}: name must be 2–30 characters`);
    if (seenCats.has(name.toLowerCase())) errors.push(`Category "${name}" is duplicated`);
    seenCats.add(name.toLowerCase());
    return { name, icon: ICON_KEYS.includes(c?.icon) ? c.icon : DEFAULT_ICON };
  });

  // items
  const rawItems = Array.isArray(input.items) ? input.items : [];
  if (rawItems.length > LIMITS.maxItems) errors.push(`Too many items (max ${LIMITS.maxItems})`);
  const seenIds = new Set();
  const items = rawItems.map((it, i) => {
    const label = `Item ${i + 1}${it?.name ? ` (${it.name})` : ""}`;
    const id = Number(it?.id);
    if (!Number.isInteger(id) || id < 1) errors.push(`${label}: invalid id`);
    if (seenIds.has(id)) errors.push(`${label}: duplicate id ${id}`);
    seenIds.add(id);

    const name = isPlainString(it?.name) ? it.name.trim() : "";
    if (name.length < 2 || name.length > LIMITS.name) errors.push(`${label}: name must be 2–${LIMITS.name} characters`);

    const price = Number(it?.price);
    if (!Number.isInteger(price) || price < 1 || price > LIMITS.maxPrice) errors.push(`${label}: price must be a whole number of naira (1–${LIMITS.maxPrice})`);

    const description = isPlainString(it?.description) ? it.description.trim() : "";
    if (description.length > LIMITS.description) errors.push(`${label}: description is over ${LIMITS.description} characters`);

    if (!seenCats.has(String(it?.category ?? "").trim().toLowerCase())) errors.push(`${label}: unknown category "${it?.category}"`);
    if (!isSafeImage(it?.image)) errors.push(`${label}: image must be an https URL or a path under menu/ or uploads/`);

    return {
      id,
      category: String(it?.category ?? "").trim(),
      name,
      price,
      description,
      image: it?.image,
      imageStyle: it?.imageStyle === "cutout" ? "cutout" : "photo",
      featured: Boolean(it?.featured),
      isActive: it?.isActive !== false,
      isAvailable: it?.isAvailable !== false,
    };
  });

  // layout (unknown ids are dropped silently — an item may have been deleted)
  const ids = new Set(items.map((i) => i.id));
  const clean = (arr, max) => [...new Set((Array.isArray(arr) ? arr : []).map(Number))].filter((id) => ids.has(id)).slice(0, max);
  const heroIds = clean(input.layout?.heroIds, LIMITS.maxHero);
  const subheroIds = clean(input.layout?.subheroIds, LIMITS.maxSubhero);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    doc: {
      version: Number.isInteger(input.version) ? input.version : 0,
      updatedAt: input.updatedAt ?? null,
      categories,
      items,
      layout: { heroIds, subheroIds },
      settings: normalizeSettings(input.settings),
    },
  };
}
