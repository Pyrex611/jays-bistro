/**
 * Pure helpers for the photo-curation workflow (no network, no file I/O) so they can be unit-tested.
 *   curate-photos.mjs  → asks Unsplash for candidates, writes docs/photo-review.html
 *   apply-photos.mjs   → turns your picks into src/data/photos.js (+ docs/PHOTO_CREDITS.md)
 */

/** Hand-written search terms for dishes where "<name> food" would return the wrong thing. */
export const QUERY_OVERRIDES = {
  42: "pounded yam swallow nigerian",
  43: "semolina swallow african soup",
  44: "amala abula yoruba food",
  45: "fufu african swallow soup",
  46: "eba garri swallow nigerian",
  50: "goat meat pepper soup nigerian",
  60: "nkwobi cow foot nigerian",
  63: "edikang ikong vegetable soup nigerian",
  64: "ofe nsala white soup nigerian",
};

const CATEGORY_HINT = { Meals: "nigerian food", Protein: "grilled meat", Starters: "snack", Bites: "street food", Beverages: "tea drink", Soups: "soup" };

export const queryFor = (item) => QUERY_OVERRIDES[item.id] ?? `${item.name.replace(/\([^)]*\)/g, "").trim()} ${CATEGORY_HINT[item.category] ?? "food"}`;

const parseIds = (value) => String(value ?? "").split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);

/** Which dishes to search for. Default: those showing the "no photo" tile. */
export function pickScope(items, { all = false, ids = "" } = {}) {
  const wanted = parseIds(ids);
  if (wanted.length) return items.filter((i) => wanted.includes(i.id));
  if (all) return items;
  return items.filter((i) => i.image === "menu/placeholder.svg");
}

const UTM = "utm_source=jays_bistro&utm_medium=referral";
const withUtm = (url) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

/** One Unsplash search hit → the small record we keep. Returns null for anything unusable. */
export function normalizeResult(r) {
  if (!r?.id || !r.urls?.raw || !r.user?.name) return null;
  return {
    id: r.id,
    thumb: r.urls.small ?? r.urls.thumb ?? r.urls.raw,
    // 800 px wide, cropped for the 4:3 tiles; same URL shape the menu already uses for stock photos
    url: `${r.urls.raw.split("?")[0]}?auto=format&fit=crop&q=80&w=800`,
    alt: String(r.alt_description ?? r.description ?? "").slice(0, 140),
    credit: `Photo by ${r.user.name} on Unsplash`,
    creditUrl: withUtm(r.user.links?.html ?? "https://unsplash.com"),
    pageUrl: withUtm(r.links?.html ?? "https://unsplash.com"),
    download: r.links?.download_location ?? "",
  };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Self-contained contact sheet: pick one photo per dish, then copy the JSON and save it as docs/photo-selection.json. */
export function renderReviewHtml(entries, generatedAt = new Date()) {
  const rows = entries
    .map(({ item, query, candidates }) => `
  <section class="dish" data-id="${item.id}">
    <h2>#${item.id} · ${esc(item.name)} <small>${esc(item.category)} · searched “${esc(query)}”</small></h2>
    <div class="grid">
      ${candidates.map((c, i) => `
      <label class="card">
        <input type="radio" name="d${item.id}" value="${esc(c.id)}" data-c='${esc(JSON.stringify(c))}'>
        <img src="${esc(c.thumb)}" alt="${esc(c.alt)}" loading="lazy">
        <span>${esc(c.credit.replace(" on Unsplash", ""))}</span>
        <a href="${esc(c.pageUrl)}" target="_blank" rel="noopener noreferrer">view</a>
      </label>`).join("")}
      <label class="card none"><input type="radio" name="d${item.id}" value="" checked><span>Skip<br>(keep current)</span></label>
    </div>
    ${candidates.length === 0 ? "<p class=\"empty\">No results. Try --ids=" + item.id + " after editing the query in scripts/lib/photoTools.mjs.</p>" : ""}
  </section>`)
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jay's Bistro · photo review</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;background:#FBF8EE;color:#121C16}
header{position:sticky;top:0;background:#E6EFE8;padding:12px 16px;border-bottom:1px solid #CFE0D4;z-index:2}
header p{margin:2px 0 0;font-size:13px}
main{padding:16px;max-width:980px;margin:auto}
.dish{background:#fff;border:1px solid #E9E2CC;border-radius:16px;padding:14px;margin-bottom:16px}
h2{margin:0 0 10px;font-size:16px}h2 small{color:#5C6B61;font-weight:400;font-size:12px;margin-left:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.card{display:flex;flex-direction:column;gap:4px;font-size:11px;border:2px solid #E9E2CC;border-radius:12px;padding:6px;cursor:pointer;position:relative}
.card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px}
.card input{position:absolute;top:10px;left:10px;width:18px;height:18px}
.card:has(input:checked){border-color:#286334;background:#F0F7F1}
.none{justify-content:center;align-items:center;text-align:center;min-height:90px;color:#5C6B61}
.empty{color:#A05309;font-size:12px}
footer{position:sticky;bottom:0;background:#FBF8EE;border-top:1px solid #E9E2CC;padding:12px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
button{background:#286334;color:#fff;border:0;border-radius:999px;padding:10px 18px;font-weight:700;cursor:pointer}
textarea{flex:1;min-width:240px;height:44px;font:12px monospace}
</style></head><body>
<header><strong>Pick one photo per dish</strong><p>Generated ${esc(generatedAt.toISOString())}. Choose the best match for each dish (or Skip), press <b>Copy selection</b>, save it as <code>docs/photo-selection.json</code>, then run <code>npm run photos:apply</code>. Photos come from Unsplash; credits are added for you.</p></header>
<main>${rows}</main>
<footer><button id="copy" type="button">Copy selection</button><span id="count"></span><textarea id="out" readonly aria-label="Selection JSON"></textarea></footer>
<script>
const out=document.getElementById('out'),count=document.getElementById('count');
function collect(){const sel={};document.querySelectorAll('.dish').forEach(d=>{const r=d.querySelector('input:checked');if(r&&r.value){sel[d.dataset.id]=JSON.parse(r.dataset.c)}});return sel}
function refresh(){const s=collect();out.value=JSON.stringify(s,null,2);count.textContent=Object.keys(s).length+' selected'}
document.addEventListener('change',refresh);refresh();
document.getElementById('copy').addEventListener('click',async()=>{refresh();try{await navigator.clipboard.writeText(out.value);count.textContent+=' · copied'}catch{out.select();document.execCommand('copy')}});
</script></body></html>`;
}

/** Validate a selection file against the menu. Returns { ok, photos, errors }. */
export function validateSelection(selection, items) {
  const errors = [];
  const photos = {};
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) return { ok: false, photos, errors: ["Selection must be a JSON object keyed by dish id."] };
  const known = new Map(items.map((i) => [i.id, i]));
  for (const [key, c] of Object.entries(selection)) {
    const id = Number(key);
    if (!known.has(id)) { errors.push(`#${key}: no such dish`); continue; }
    if (typeof c?.url !== "string" || !/^https:\/\/images\.unsplash\.com\//.test(c.url)) { errors.push(`#${key}: photo must be an images.unsplash.com URL`); continue; }
    if (!c.credit || !/^https:\/\/unsplash\.com\//.test(c.creditUrl ?? "")) { errors.push(`#${key}: missing photographer credit`); continue; }
    photos[id] = { url: c.url, credit: String(c.credit).slice(0, 120), creditUrl: c.creditUrl, alt: String(c.alt ?? known.get(id).name).slice(0, 140), download: c.download ?? "" };
  }
  return { ok: errors.length === 0, photos, errors };
}

/** Source of src/data/photos.js. Keeps ids sorted so diffs are small; drops the one-off `download` field. */
export function renderPhotosModule(map) {
  const clean = Object.fromEntries(Object.keys(map).map(Number).sort((a, b) => a - b).map((id) => [id, { url: map[id].url, credit: map[id].credit, creditUrl: map[id].creditUrl, alt: map[id].alt }]));
  return `/**
 * Photo overrides per dish id, written by \`npm run photos:apply\` after you review the contact sheet
 * (docs/photo-review.html). Shape: { [id]: { url, credit, creditUrl, alt } }.
 * Unsplash hot-links are temporarily accepted; the plan is to self-host into public/menu/ later.
 */
export const PHOTOS = ${JSON.stringify(clean, null, 2)};
`;
}

export function renderCredits(map, items) {
  const name = new Map(items.map((i) => [i.id, i.name]));
  const lines = Object.keys(map).map(Number).sort((a, b) => a - b).map((id) => `- **${name.get(id) ?? `#${id}`}**: [${map[id].credit}](${map[id].creditUrl})`);
  return `# Photo credits\n\nDish photos from [Unsplash](https://unsplash.com/?${UTM}). Generated by \`npm run photos:apply\`; do not edit by hand.\n\n${lines.join("\n") || "_No Unsplash photos applied yet._"}\n`;
}
