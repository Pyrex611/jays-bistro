import { describe, expect, it } from "vitest";
import { CATEGORIES, MENU_ITEMS } from "../data/menu.js";
import { HERO_ITEM_IDS, SUBHERO_ITEM_IDS } from "../data/layout.js";
import { ALL_CATEGORY, buildMenuModel } from "../lib/menuModel.js";
import { ICON_KEYS } from "../lib/categoryIcons.js";

describe("menu catalogue integrity", () => {
  it("has unique integer ids", () => {
    const ids = MENU_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(Number.isInteger(id)).toBe(true));
  });

  it("gives every item a valid category, a positive integer price and an image", () => {
    const names = new Set(CATEGORIES.map((c) => c.name));
    MENU_ITEMS.forEach((item) => {
      expect(names.has(item.category), `${item.name}: category ${item.category}`).toBe(true);
      expect(Number.isInteger(item.price) && item.price > 0, `${item.name}: price`).toBe(true);
      expect(item.image, `${item.name}: image`).toBeTruthy();
      expect(["cutout", "photo"]).toContain(item.imageStyle);
    });
  });

  it("ships the full catalogue, all active and in stock", () => {
    expect(MENU_ITEMS).toHaveLength(64);
    expect(MENU_ITEMS.every((i) => i.isActive && i.isAvailable)).toBe(true);
  });

  it("uses only valid image sources and icon keys", () => {
    MENU_ITEMS.forEach((i) => expect(/^(https:\/\/|menu\/)/.test(i.image), `${i.name}: ${i.image}`).toBe(true));
    CATEGORIES.forEach((c) => expect(ICON_KEYS).toContain(c.icon));
  });

  it("only references active items in hero and sub-hero", () => {
    const active = new Set(MENU_ITEMS.filter((i) => i.isActive).map((i) => i.id));
    [...HERO_ITEM_IDS, ...SUBHERO_ITEM_IDS].forEach((id) => expect(active.has(id), `id ${id}`).toBe(true));
  });
});

describe("photo integrity", () => {
  // Dishes that may legitimately share one photo (same dish in different sizes, or close variants).
  const ALLOWED_SHARED = [[19, 20], [21, 22, 23, 24], [6, 7], [29, 30], [54, 55, 56], [57, 61]];
  const PLACEHOLDERS = [42, 43, 44, 45, 46, 50, 60, 63, 64]; // honest icon tile until a real photo exists

  it("never lets two different dishes share a photo unless that pairing is on the allow-list", () => {
    const groups = new Map();
    MENU_ITEMS.filter((i) => i.image !== "menu/placeholder.svg").forEach((i) => (groups.get(i.image) ?? groups.set(i.image, []).get(i.image)).push(i.id));
    const shared = [...groups.values()].filter((ids) => ids.length > 1);
    shared.forEach((ids) => expect(ALLOWED_SHARED.some((allowed) => ids.every((id) => allowed.includes(id))), `ids ${ids} share a photo`).toBe(true));
  });

  it("uses the placeholder only for the dishes that have no accurate photo yet", () => {
    expect(MENU_ITEMS.filter((i) => i.image === "menu/placeholder.svg").map((i) => i.id)).toEqual(PLACEHOLDERS);
  });
});

describe("home screen defaults", () => {
  it("puts the six signature dishes in the hero and two Arabian teas in the sub-hero", () => {
    expect(HERO_ITEM_IDS).toEqual([1, 36, 2, 3, 21, 51]);
    expect(SUBHERO_ITEM_IDS.map((id) => MENU_ITEMS.find((i) => i.id === id).category)).toEqual(["Beverages", "Beverages"]);
    expect(SUBHERO_ITEM_IDS.map((id) => MENU_ITEMS.find((i) => i.id === id).name.toLowerCase()).every((n) => n.includes("arabian"))).toBe(true);
    expect(SUBHERO_ITEM_IDS.some((id) => HERO_ITEM_IDS.includes(id))).toBe(false);
  });
});

describe("buildMenuModel", () => {
  const items = [
    { id: 1, category: "Meals", name: "A", price: 100, isActive: true },
    { id: 2, category: "Meals", name: "B", price: 200, isActive: false },
    { id: 3, category: "Soups", name: "C", price: 300 },
  ];
  const categories = [{ name: "Meals", icon: "m" }, { name: "Soups", icon: "s" }, { name: "Empty", icon: "e" }];

  it("excludes inactive items (a missing flag counts as active)", () => {
    const model = buildMenuModel({ items, categories });
    expect(model.activeItems.map((i) => i.id)).toEqual([1, 3]);
    expect(model.byId[2]).toBeUndefined();
  });

  it("prepends All and hides categories with no active items", () => {
    const model = buildMenuModel({ items, categories });
    expect(model.categories.map((c) => c.name)).toEqual([ALL_CATEGORY.name, "Meals", "Soups"]);
  });

  it("keeps sold-out items visible but flagged, and normalises settings", () => {
    const model = buildMenuModel({ items: [{ id: 1, category: "Meals", name: "A", price: 1, isAvailable: false }, { id: 2, category: "Meals", name: "B", price: 1 }], categories, settings: { deliveryFee: "700" } });
    expect(model.byId[1].isAvailable).toBe(false);
    expect(model.byId[2].isAvailable).toBe(true);
    expect(model.settings).toMatchObject({ acceptingOrders: true, deliveryEnabled: true, deliveryFee: 700, minOrder: 0 });
  });

  it("skips hero/sub-hero ids that are missing or inactive and caps sub-hero at two", () => {
    const model = buildMenuModel({ items, categories, heroIds: [1, 2, 99, 3], subheroIds: [3, 1, 1] });
    expect(model.hero.map((i) => i.id)).toEqual([1, 3]);
    expect(model.subhero).toHaveLength(2);
  });
});
describe("model groups", () => {
  it("exposes the storefront pills without an All entry, in menu order", () => {
    const m = buildMenuModel({ items: MENU_ITEMS, categories: CATEGORIES, heroIds: HERO_ITEM_IDS, subheroIds: SUBHERO_ITEM_IDS });
    expect(m.groups.map((g) => g.name)).toEqual(["Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"]);
    expect(m.categories[0].name).toBe("All");
  });
});

