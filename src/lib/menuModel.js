/**
 * Turns raw menu rows + layout slots into the shape the UI consumes.
 * Pure function: the same code path serves static data (Sprint 1) and database rows (Phase 2).
 */

export const ALL_CATEGORY = { name: "All", icon: "🍽️" };

/**
 * @param {object} input
 * @param {Array} input.items        raw menu items (may include inactive ones)
 * @param {Array} input.categories   ordered category definitions [{ name, icon }]
 * @param {number[]} [input.heroIds]
 * @param {number[]} [input.subheroIds]
 */
export function buildMenuModel({ items, categories, heroIds = [], subheroIds = [] }) {
  const activeItems = items.filter((item) => item.isActive !== false);
  const byId = Object.fromEntries(activeItems.map((item) => [item.id, item]));
  const pick = (ids) => ids.map((id) => byId[id]).filter(Boolean);

  // Only surface categories that currently have at least one active item.
  const visibleCategories = categories.filter((c) => activeItems.some((item) => item.category === c.name));

  return {
    activeItems,
    byId,
    categories: [ALL_CATEGORY, ...visibleCategories],
    hero: pick(heroIds),
    subhero: pick(subheroIds).slice(0, 2),
  };
}
