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
