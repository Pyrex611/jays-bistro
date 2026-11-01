import { describe, expect, it } from "vitest";
import { normalizeText, searchItems } from "../lib/search.js";
import { MENU_ITEMS } from "../data/menu.js";

const items = [
  { id: 1, name: "Party Jollof Rice", description: "Smoky party rice", category: "Meals" },
  { id: 2, name: "Chicken Shawarma", description: "Wrapped with veg and sauce", category: "Bites" },
  { id: 3, name: "Egusi Soup", description: "Melon soup, often with rice", category: "Soups" },
  { id: 4, name: "Classic Arabian Blend", description: "Heritage Arabian tea", category: "Beverages" },
];

describe("normalizeText", () => {
  it("lowercases, strips accents and punctuation", () => {
    expect(normalizeText("  Crème-Brûlée!! ")).toBe("creme brulee");
    expect(normalizeText(null)).toBe("");
  });
});

describe("searchItems", () => {
  it("returns nothing for an empty query", () => {
    expect(searchItems(items, "   ")).toEqual([]);
  });

  it("matches names by prefix and ignores case", () => {
    expect(searchItems(items, "SHAW").map((i) => i.id)).toEqual([2]);
  });

  it("requires every word to match", () => {
    expect(searchItems(items, "party rice").map((i) => i.id)).toEqual([1]);
    expect(searchItems(items, "party shawarma")).toEqual([]);
  });

  it("finds by description and category, ranking name matches first", () => {
    expect(searchItems(items, "rice").map((i) => i.id)).toEqual([1, 3]); // name match before description match
    expect(searchItems(items, "beverages").map((i) => i.id)).toEqual([4]);
    expect(searchItems(items, "tea").map((i) => i.id)).toEqual([4]);
  });

  it("works on the real catalogue", () => {
    expect(searchItems(MENU_ITEMS, "jollof").length).toBeGreaterThan(0);
    expect(searchItems(MENU_ITEMS, "zzzzqqq")).toEqual([]);
  });
});
