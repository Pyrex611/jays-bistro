# Sprint 3 runbook: apply, verify, run the demo, deploy (Windows CMD)

Replace `C:\path\to\jays-bistro` with your clone. Each step ends with **Expected**. This sprint adds **no new dependencies**.

## 0. Confirm the current state first
```
cd /d C:\path\to\jays-bistro
node -v
git status
git branch --show-current
git remote -v
dir /b src\components\storefront
dir /b scripts
```
**Expected**
- Node ≥ 20.19.
- `git status` clean (otherwise `git add -A && git commit -m "wip"`).
- Remote `github.com/Pyrex611/jays-bistro`.
- `src\components\storefront` lists `CategoryPills.jsx` and `SearchBar.jsx` (Sprint 2 layout) **or** `CategoryBar.jsx` (if you already applied the WIP zip). `scripts` lists `copy-menu-images.mjs`.
- If you pushed the WIP branch earlier, continue on it: `git checkout wip/sprint-3-demo`. Otherwise: `git checkout -b feat/sprint-3-demo`.

## 1. Apply the zip
```
copy "%USERPROFILE%\Downloads\jays-bistro-sprint-3.zip" .
tar -xf jays-bistro-sprint-3.zip
del jays-bistro-sprint-3.zip
```
Remove the files this sprint replaces (the zip carries the list in `sprint-3-deleted.txt`):
```
for /f "usebackq delims=" %f in ("sprint-3-deleted.txt") do @git rm -f --ignore-unmatch "%f"
del sprint-3-deleted.txt
```
**Expected:** `git status` shows modified and new files; five `rm '…'` lines (`api/_lib/orderLines.js`, `InfoStrip.jsx`, `CategoryPills.jsx`, `ProductGrid.jsx`, `SearchBar.jsx`).

## 2. Install and verify
```
npm install
npm run lint
npm test
npm run build
```
**Expected:** lint clean · 227 tests pass (21 files) · `built in …s` · main chunk ≈ 125 KB gzip (budget 150).

## 3. Run the demo locally (browser-only data, nothing needs connecting)
```
set DEMO_MODE=1
npm run dev
```
Open `http://localhost:5173`. Without `DEMO_MODE=1`, `npm run dev` behaves as *live* with files in `.local-data\` (as in Sprint 2).
1. **Storefront:** scroll: the sticky pill follows; tap a pill: smooth jump; tap the magnifier: search replaces the pills; tap **+**: it becomes **− 1 +**; tap **i** in the header.
2. **Checkout:** open the tray → **Checkout** → pick *Delivery*, choose an area (fee + ETA appear) → fill details → **Pay** → demo payment page → **Pay** → receipt stamped **DEMO**.
3. **Console:** open `http://localhost:5173/merchant` in a second tab → password **`jays-setup`** → *Overview* shows your new order under **Needs attention**; tap **Start preparing → Mark ready → Complete**.
4. **Settings:** change a delivery area fee, hours, the fee calculator; open **Alerts → Send test alert** to preview the kitchen email; press **Publish**; refresh the storefront tab.
5. **Reset:** Settings → Go live → *Reset demo data*.
Phone test on the same Wi-Fi: `ipconfig` for your IPv4, open `http://<ip>:5173` (orders made on the phone stay on the phone: demo data is per browser).

## 4. Photos (optional now, takes ~10 minutes)
1. Create a free Unsplash app (https://unsplash.com/oauth/applications) and copy its **Access Key**.
2. ```
   set UNSPLASH_ACCESS_KEY=your-key
   npm run photos:curate
   ```
   **Expected:** one line per dish with a candidate count, then `docs\photo-review.html`.
3. Open `docs\photo-review.html`, choose one photo per dish (or Skip), press **Copy selection**, save the text as `docs\photo-selection.json`.
4. ```
   npm run photos:apply
   npm test
   ```
   **Expected:** `Applied N photo(s)`; `src\data\photos.js` and `docs\PHOTO_CREDITS.md` updated; tests green. Commit both files.
Free Unsplash apps allow 50 requests/hour; the default scope is the nine icon-tile dishes. `--ids=42,43` or `--all --limit=40` change it.

## 5. Commit and push
```
git add -A
git commit -m "feat(sprint-3): demo mode, pastel theme, scroll-aware menu, zones/fees/hours, console overview+settings, photo tooling"
git push -u origin feat/sprint-3-demo
```

## 6. Deploy the demo (Vercel Preview or Production)
1. Vercel builds a Preview from the branch. **Do not set** `S3_*` or `PAYSTACK_SECRET_KEY`: with no storage variables **in production** the site runs in demo mode by itself; on a Preview add `DEMO_MODE=1` (Settings → Environment Variables → Preview).
2. Open the Preview on a phone: repeat the walk-through in step 3. `/merchant` shows the demo banner and the setup password hint.
3. Check: `/robots.txt` disallows `/pay/`, `/invoice/`, `/merchant`.
4. When approved: merge to `main`; Vercel promotes it.

## 7. Go live later (see ADR-0007 and docs/DEMO_MODE.md)
Upgrade to Vercel **Pro** first (Hobby is non-commercial) → create the Blob stores → add `PAYSTACK_SECRET_KEY` (test, then live) → webhook → alerts provider → move `jays-bistro.vercel.app` to this project and set `PUBLIC_BASE_URL`. The console's **Settings → Go live** shows the same checklist.

## 8. Roll back
Vercel → Deployments → previous good deployment → **Promote to Production**. Demo data lives in each visitor's browser, so there is nothing to restore.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Console says "demo" in production but you expected live | `S3_*` variables missing or `DEMO_MODE=1` is set; check Vercel → Environment Variables |
| Console is live locally but you wanted demo | `set DEMO_MODE=1` in the same CMD window before `npm run dev` |
| Order made on phone isn't in the console on laptop | Expected in demo mode (browser-local). Use one browser for the full loop |
| `npm run photos:curate` says key not set | `set UNSPLASH_ACCESS_KEY=…` in the same window (or add it to `.env.local`) |
| "Rate limit reached" while curating | Unsplash free apps: 50 requests/hour; wait or use `--ids=` |
| Dish still shows an icon tile | No accurate photo yet: run the photo steps, or upload one in the console |
| Pills don't follow the scroll | A group has no visible dishes (all hidden/inactive); check the menu |
