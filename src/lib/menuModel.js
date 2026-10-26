import { normalizeSettings } from "./settings.js";

/**
 * Turns a menu document (static or from storage) into the shape the UI consumes.
 * Pure function.
 */

export const ALL_CATEGORY = { name: "All", icon: "all" };

/**
 * @param {object} input
 * @param {Array} input.items
 * @param {Array} input.categories     ordered [{ name, icon }]
 * @param {number[]} [input.heroIds]
 * @param {number[]} [input.subheroIds]
 * @param {object} [input.settings]
 */
export function buildMenuModel({ items, categories, heroIds = [], subheroIds = [], settings }) {
  const activeItems = items
    .filter((item) => item.isActive !== false)
    .map((item) => ({ ...item, isAvailable: item.isAvailable !== false }));
  const byId = Object.fromEntries(activeItems.map((item) => [item.id, item]));
  const pick = (ids) => ids.map((id) => byId[id]).filter(Boolean);

  const visibleCategories = categories.filter((c) => activeItems.some((item) => item.category === c.name));
  const iconByCategory = Object.fromEntries(categories.map((c) => [c.name, c.icon]));

  return {
    activeItems,
    byId,
    categories: [ALL_CATEGORY, ...visibleCategories],
    iconByCategory,
    hero: pick(heroIds),
    subhero: pick(subheroIds).slice(0, 2),
    settings: normalizeSettings(settings),
  };
}
