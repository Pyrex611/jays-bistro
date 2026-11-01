import { describe, expect, it } from "vitest";
import { QUERY_OVERRIDES, normalizeResult, pickScope, queryFor, renderCredits, renderPhotosModule, renderReviewHtml, validateSelection } from "../../scripts/lib/photoTools.mjs";
import { MENU_ITEMS } from "../data/menu.js";

const hit = (over = {}) => ({
  id: "abc123", alt_description: "a bowl of white soup", urls: { raw: "https://images.unsplash.com/photo-1?ixid=zzz", small: "https://images.unsplash.com/photo-1?w=400" },
  user: { name: "Ada <Obi>", links: { html: "https://unsplash.com/@ada" } }, links: { html: "https://unsplash.com/photos/abc123", download_location: "https://api.unsplash.com/photos/abc123/download" }, ...over,
});

describe("scope and queries", () => {
  it("defaults to the dishes that currently show the no-photo tile", () => {
    expect(pickScope(MENU_ITEMS).map((i) => i.id)).toEqual([42, 43, 44, 45, 46, 50, 60, 63, 64]);
  });

  it("--ids wins over everything, --all selects the whole menu", () => {
    expect(pickScope(MENU_ITEMS, { ids: "1, 2,abc,-3" }).map((i) => i.id)).toEqual([1, 2]);
    expect(pickScope(MENU_ITEMS, { all: true })).toHaveLength(64);
    expect(pickScope(MENU_ITEMS, { all: true, ids: "5" }).map((i) => i.id)).toEqual([5]);
  });

  it("uses hand-written queries for the hard dishes and a sensible default otherwise", () => {
    expect(queryFor({ id: 64, name: "White Soup", category: "Soups" })).toBe(QUERY_OVERRIDES[64]);
    expect(queryFor({ id: 99, name: "Arabian Tea (1/2L)", category: "Beverages" })).toBe("Arabian Tea tea drink");
    expect(queryFor({ id: 98, name: "Mystery", category: "Other" })).toBe("Mystery food");
    MENU_ITEMS.filter((i) => i.image === "menu/placeholder.svg").forEach((i) => expect(QUERY_OVERRIDES[i.id], `${i.name} has a curated query`).toBeTruthy());
  });
});

describe("normalizeResult", () => {
  it("keeps a clean record with an 800px crop URL, credit and UTM-tagged links", () => {
    const r = normalizeResult(hit());
    expect(r.url).toBe("https://images.unsplash.com/photo-1?auto=format&fit=crop&q=80&w=800");
    expect(r.credit).toBe("Photo by Ada <Obi> on Unsplash");
    expect(r.creditUrl).toBe("https://unsplash.com/@ada?utm_source=jays_bistro&utm_medium=referral");
    expect(r.pageUrl).toContain("utm_source=jays_bistro");
    expect(r.download).toContain("/download");
  });

  it("drops results that lack an id, image or photographer", () => {
    expect(normalizeResult(null)).toBeNull();
    expect(normalizeResult(hit({ id: undefined }))).toBeNull();
    expect(normalizeResult(hit({ urls: {} }))).toBeNull();
    expect(normalizeResult(hit({ user: {} }))).toBeNull();
  });
});

describe("review page", () => {
  const entries = [{ item: { id: 42, name: "Pounded Yam", category: "Meals" }, query: "pounded yam", candidates: [normalizeResult(hit())] }, { item: { id: 43, name: "Semo", category: "Meals" }, query: "semo", candidates: [] }];
  const html = renderReviewHtml(entries, new Date("2026-11-01T10:00:00Z"));

  it("lists each dish with its candidates, a Skip option and the instructions", () => {
    ["#42 · Pounded Yam", "searched “pounded yam”", 'name="d42"', "Skip", "Copy selection", "docs/photo-selection.json", "npm run photos:apply", "2026-11-01T10:00:00.000Z"].forEach((t) => expect(html).toContain(t));
    expect(html).toContain("No results");
  });

  it("escapes photographer names and descriptions so the sheet can't be broken or injected into", () => {
    expect(html).not.toContain("Ada <Obi>");
    expect(html).toContain("Ada &lt;Obi&gt;");
    expect(renderReviewHtml([{ item: { id: 1, name: "<img src=x onerror=alert(1)>", category: "Meals" }, query: "q", candidates: [] }])).not.toContain("<img src=x");
  });
});

describe("validateSelection and generated files", () => {
  const good = { url: "https://images.unsplash.com/photo-1?w=800", credit: "Photo by Ada on Unsplash", creditUrl: "https://unsplash.com/@ada", alt: "pounded yam", download: "https://api.unsplash.com/x" };

  it("accepts a good pick and rejects unknown dishes, foreign hosts and missing credit", () => {
    expect(validateSelection({ 42: good }, MENU_ITEMS)).toMatchObject({ ok: true, photos: { 42: { url: good.url } } });
    const bad = validateSelection({ 9999: good, 43: { ...good, url: "https://evil.example/x.jpg" }, 44: { ...good, credit: "" }, 45: { ...good, creditUrl: "http://x" } }, MENU_ITEMS);
    expect(bad.ok).toBe(false);
    expect(bad.errors).toHaveLength(4);
    expect(validateSelection([], MENU_ITEMS).ok).toBe(false);
    expect(validateSelection(null, MENU_ITEMS).ok).toBe(false);
  });

  it("writes a photos module that sorts ids, drops the download ping field and parses back", async () => {
    const src = renderPhotosModule({ 50: good, 42: good });
    expect(src.indexOf('"42"')).toBeLessThan(src.indexOf('"50"'));
    expect(src).not.toContain("download");
    const mod = await import(`data:text/javascript,${encodeURIComponent(src)}`);
    expect(Object.keys(mod.PHOTOS)).toEqual(["42", "50"]);
    expect(mod.PHOTOS[42]).toEqual({ url: good.url, credit: good.credit, creditUrl: good.creditUrl, alt: good.alt });
  });

  it("writes a credits file naming each dish", () => {
    const md = renderCredits({ 42: good }, MENU_ITEMS);
    expect(md).toContain("**Pounded Yam**");
    expect(md).toContain("https://unsplash.com/@ada");
    expect(renderCredits({}, MENU_ITEMS)).toContain("No Unsplash photos applied yet");
  });
});
