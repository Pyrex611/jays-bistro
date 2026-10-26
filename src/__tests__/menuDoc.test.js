import { describe, expect, it } from "vitest";
import { defaultMenuDoc, nextItemId, validateMenuDoc } from "../lib/menuDoc.js";

const valid = () => defaultMenuDoc();

describe("validateMenuDoc", () => {
  it("accepts the bundled default document", () => {
    const r = validateMenuDoc(valid());
    expect(r.ok).toBe(true);
    expect(r.doc.items).toHaveLength(64);
  });

  it("reports every problem with a readable label", () => {
    const doc = valid();
    doc.items[0].name = "x";
    doc.items[1].price = 12.5;
    doc.items[2].description = "y".repeat(300);
    doc.items[3].category = "Nope";
    doc.items[4].image = "http://insecure.example/x.png";
    doc.items[5].id = doc.items[6].id;
    const r = validateMenuDoc(doc);
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects script-ish image sources", () => {
    for (const bad of ["javascript:alert(1)", "data:text/html;base64,AAAA", "//evil.example/x.png", "../secret.png"]) {
      const doc = valid();
      doc.items[0].image = bad;
      expect(validateMenuDoc(doc).ok, bad).toBe(false);
    }
  });

  it("accepts merchant uploads (https) and bundled paths", () => {
    const doc = valid();
    doc.items[0].image = "https://bucket.s3.eu-west-1.amazonaws.com/images/a.webp";
    doc.items[1].image = "menu/placeholder.svg";
    expect(validateMenuDoc(doc).ok).toBe(true);
  });

  it("rejects duplicate category names and empty category lists", () => {
    const dup = valid();
    dup.categories.push({ name: "meals", icon: "meals" });
    expect(validateMenuDoc(dup).ok).toBe(false);
    expect(validateMenuDoc({ ...valid(), categories: [] }).ok).toBe(false);
  });

  it("drops layout ids that point to missing items and caps slot counts", () => {
    const doc = valid();
    doc.layout = { heroIds: [1, 1, 999999, 2, 3, 4, 5, 6, 7, 8], subheroIds: [3, 4, 5] };
    const r = validateMenuDoc(doc);
    expect(r.ok).toBe(true);
    expect(r.doc.layout.heroIds).toEqual([1, 2, 3, 4, 5, 6]);
    expect(r.doc.layout.subheroIds).toHaveLength(2);
  });

  it("falls back to a safe icon for unknown keys", () => {
    const doc = valid();
    doc.categories[0].icon = "<script>";
    expect(validateMenuDoc(doc).doc.categories[0].icon).toBe("meals");
  });

  it("rejects non-objects", () => {
    expect(validateMenuDoc(null).ok).toBe(false);
    expect(validateMenuDoc("menu").ok).toBe(false);
  });
});

describe("nextItemId", () => {
  it("is one more than the highest id", () => {
    expect(nextItemId([{ id: 3 }, { id: 41 }, { id: 7 }])).toBe(42);
    expect(nextItemId([])).toBe(1);
  });
});
