// Turns your picks (docs/photo-selection.json) into src/data/photos.js and docs/PHOTO_CREDITS.md.
// Usage:  npm run photos:apply            (reads docs/photo-selection.json)
//         npm run photos:apply -- path\to\other.json
// Existing overrides are kept; picks replace overrides for the same dish.
import fs from "node:fs";
import path from "node:path";
import { MENU_ITEMS } from "../src/data/menu.js";
import { PHOTOS } from "../src/data/photos.js";
import { renderCredits, renderPhotosModule, validateSelection } from "./lib/photoTools.mjs";

const file = path.resolve(process.argv[2] ?? "docs/photo-selection.json");
if (!fs.existsSync(file)) { console.error(`Not found: ${file}\nOpen docs/photo-review.html, press "Copy selection" and save the text there first.`); process.exit(1); }

let selection;
try { selection = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error(`That file isn't valid JSON: ${e.message}`); process.exit(1); }

const { ok, photos, errors } = validateSelection(selection, MENU_ITEMS);
if (!ok) { console.error("Fix these first:\n" + errors.map((e) => `  - ${e}`).join("\n")); process.exit(1); }
if (Object.keys(photos).length === 0) { console.log("The selection is empty: nothing to apply."); process.exit(0); }

// Unsplash API guideline: tell Unsplash when a photo is actually used (best effort; never blocks).
const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
if (key) {
  for (const [id, p] of Object.entries(photos)) {
    if (!p.download) continue;
    try { await fetch(p.download, { headers: { Authorization: `Client-ID ${key}` } }); } catch { console.warn(`#${id}: couldn't register the download (ignored)`); }
  }
} else console.log("(UNSPLASH_ACCESS_KEY not set: skipping Unsplash's download-tracking ping; the photos still work.)");

const merged = { ...PHOTOS, ...photos };
fs.writeFileSync("src/data/photos.js", renderPhotosModule(merged));
fs.writeFileSync("docs/PHOTO_CREDITS.md", renderCredits(merged, MENU_ITEMS));
console.log(`Applied ${Object.keys(photos).length} photo(s); ${Object.keys(merged).length} override(s) in total.\nNext: npm test && npm run build, then commit src/data/photos.js and docs/PHOTO_CREDITS.md.`);
