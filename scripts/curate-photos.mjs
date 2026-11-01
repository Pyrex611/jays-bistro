// Finds candidate photos on Unsplash for dishes that have no accurate photo and writes a contact sheet to review.
// Usage (Windows CMD):
//   set UNSPLASH_ACCESS_KEY=your-key && npm run photos:curate                (dishes showing the "no photo" tile)
//   set UNSPLASH_ACCESS_KEY=your-key && npm run photos:curate -- --ids=42,43  (specific dishes)
//   set UNSPLASH_ACCESS_KEY=your-key && npm run photos:curate -- --all --limit=40
// Or put UNSPLASH_ACCESS_KEY=... in .env.local. Free "demo" Unsplash apps allow 50 requests/hour, so the default limit is 40.
import fs from "node:fs";
import path from "node:path";
import { MENU_ITEMS } from "../src/data/menu.js";
import { normalizeResult, pickScope, queryFor, renderReviewHtml } from "./lib/photoTools.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));

function envKey() {
  if (process.env.UNSPLASH_ACCESS_KEY) return process.env.UNSPLASH_ACCESS_KEY.trim();
  const file = path.resolve(".env.local");
  if (!fs.existsSync(file)) return "";
  const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith("UNSPLASH_ACCESS_KEY="));
  return line ? line.slice("UNSPLASH_ACCESS_KEY=".length).trim() : "";
}

const key = envKey();
if (!key) {
  console.error("UNSPLASH_ACCESS_KEY is not set.\n1) Create a free app at https://unsplash.com/oauth/applications\n2) Copy its Access Key\n3) Windows CMD:  set UNSPLASH_ACCESS_KEY=<key> && npm run photos:curate");
  process.exit(1);
}

const per = Math.min(12, Math.max(3, Number(args.per) || 8));
const limit = Math.max(1, Number(args.limit) || 40);
const scope = pickScope(MENU_ITEMS, { all: Boolean(args.all), ids: args.ids });
if (scope.length === 0) { console.log("Nothing to do: every dish already has a photo. Use --all or --ids=… to search anyway."); process.exit(0); }
if (scope.length > limit) console.warn(`Searching the first ${limit} of ${scope.length} dishes (Unsplash demo apps allow 50 requests/hour). Re-run with --ids=… for the rest.`);

const entries = [];
for (const item of scope.slice(0, limit)) {
  const query = queryFor(item);
  const url = `https://api.unsplash.com/search/photos?${new URLSearchParams({ query, per_page: String(per), orientation: "landscape", content_filter: "high" })}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
    if (res.status === 403 || res.status === 429) { console.error(`Rate limit reached after ${entries.length} dishes. Wait an hour or use --ids=… for the rest.`); break; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const candidates = (data.results ?? []).map(normalizeResult).filter(Boolean);
    entries.push({ item, query, candidates });
    console.log(`#${String(item.id).padEnd(3)} ${item.name.padEnd(32)} ${candidates.length} candidates  (“${query}”)`);
  } catch (e) {
    console.error(`#${item.id} ${item.name}: ${e.message}`);
    entries.push({ item, query, candidates: [] });
  }
}

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/photo-candidates.json", JSON.stringify(entries, null, 2));
fs.writeFileSync("docs/photo-review.html", renderReviewHtml(entries));
console.log(`\nDone. Open docs/photo-review.html in your browser, pick one photo per dish, press "Copy selection",\nsave it as docs/photo-selection.json, then run:  npm run photos:apply`);
