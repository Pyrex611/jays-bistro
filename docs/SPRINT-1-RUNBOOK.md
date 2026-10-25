# Sprint 1 runbook — apply, verify, deploy, roll back (Windows CMD)

Everything below is run in **Command Prompt (cmd.exe)**. Replace `C:\path\to\jays-bistro` with your local clone.
Work through the steps in order; each step ends with a **Expected** line so you know you are on track.

## 0. Confirm the current state of your local setup (do this first)

```
cd /d C:\path\to\jays-bistro
node -v
npm -v
git --version
git status
git branch --show-current
git remote -v
```
**Expected**
- `node -v` ≥ v20.19 (Vite/rolldown requirement). If lower, install Node 22 LTS from nodejs.org and reopen CMD.
- `git status` says *working tree clean*. If not, commit or stash first: `git add -A && git commit -m "wip: before sprint 1"`.
- `git remote -v` shows `github.com/Pyrex611/jays-bistro`.

Confirm the images the new menu imports exist (all must be listed):
```
dir /b src\assets\images
dir /b public\jsys_logo.jpg
```
**Expected** — these files are present: `classic-arabian.jpg`, `Isi-Ewu.jpg`, `IMG_1989.PNG`, `IMG_2113.PNG`, `IMG_2134.PNG`, `IMG_2135.PNG`, `IMG_2136.PNG`, `IMG_2138.PNG`, and `public\jsys_logo.jpg`. If any is missing the build fails with "Could not resolve"; restore it from git history (`git log --all -- src/assets/images/<name>`).

Check whether the app currently runs (baseline) — optional but recommended:
```
npm install
npm run build
```
**Expected** `built in …s`. Note any pre-existing errors so you can tell them apart from new ones.

## 1. Create a safety branch
```
git checkout -b feat/bonti-layout
```
**Expected** `Switched to a new branch 'feat/bonti-layout'`. (Rollback is then just switching back to `main`.)

## 2. Apply the Sprint 1 files
Copy `jays-bistro-sprint-1.zip` into the repo root (e.g. from Downloads):
```
copy "%USERPROFILE%\Downloads\jays-bistro-sprint-1.zip" .
tar -xf jays-bistro-sprint-1.zip
del jays-bistro-sprint-1.zip
git status
```
**Expected** — the zip only contains new/modified files; it never touches your images. `git status` lists modified: `.gitignore`, `index.html`, `package.json`, `tailwind.config.js`, `vite.config.js`, `src/App.jsx`, `src/index.css`, `src/data/menu.js`; and many new files (`INTENT.md`, `PLAN.md`, `CLAUDE.md`, `docs/…`, `src/components/…`, etc.).
If `tar` is not available (very old Windows): `powershell -Command "Expand-Archive -Path jays-bistro-sprint-1.zip -DestinationPath . -Force"`.

## 3. Install and verify
```
npm install
npm run lint
npm test
npm run build
```
**Expected**
- `npm install` removes `react-hook-form` (unused) and adds `vitest`; `package-lock.json` changes — commit it.
- `lint` prints no problems · `test` shows **5 files, 33 tests passed** · `build` ends with `built in …s`.

## 4. Configure the AI concierge (optional — skip for demo mode)
```
copy .env.example .env.local
notepad .env.local
```
Set `VITE_GEMINI_API_KEY=<your key>` and save. `.env.local` is git-ignored.
**Restrict the key** (Google AI Studio → API keys → your key → Application restrictions → *Websites*, add `http://localhost:5173/*` and your Vercel domain; API restrictions → *Generative Language API*).
Leave it empty to run in demo mode ("I'm in demo mode!…").

## 5. Run locally and check on your phone
```
npm run dev
```
Open `http://localhost:5173`. For the phone: find your PC's IP with `ipconfig` (IPv4 Address), connect the phone to the **same Wi-Fi**, open `http://<that-ip>:5173`. If it does not load, allow Node.js through Windows Firewall (Private networks).
Work through the **Device QA checklist** in `PLAN.md` §2. Stop the server with `Ctrl+C`.

## 6. Legacy cleanup (separate commit — optional but recommended)
These files are no longer imported by anything:
```
git rm jays.jsx src\App.css src\assets\react.svg src\IMG_2113.PNG
git rm src\components\AIChatbot.jsx src\components\CartPanel.jsx src\components\Footer.jsx
git rm src\components\Hero.jsx src\components\ImageWithFallback.jsx src\components\MenuCard.jsx src\components\Navbar.jsx
git rm src\utils\helpers.js
npm run lint && npm test && npm run build
```
**Expected** all green. (Unused duplicate images such as `public\IMG_*.PNG` and `src\assets\images\IMG_2112/2137/2170.PNG` are left alone; decide later.)

## 7. Commit and push
```
git add -A
git commit -m "feat: bonti mobile-first layout with jay's branding; tests; ai sdlc docs"
git push -u origin feat/bonti-layout
```

## 8. Deploy (Vercel)
1. Vercel dashboard → project **jays-bistro** → **Deployments**: the push creates a **Preview** deployment. Open it on your phone and re-run the QA checklist.
2. **Settings → Environment Variables**: add `VITE_GEMINI_API_KEY` (Production + Preview) if you want the live concierge. Redeploy after adding.
3. When happy: on GitHub open a Pull Request `feat/bonti-layout → main` and **Merge**, or locally:
```
git checkout main
git merge feat/bonti-layout
git push
```
4. Vercel builds **Production** automatically (build command `npm run build`, output `dist` — auto-detected for Vite).
5. Verify production: open the live URL, then open `<live-url>/menu` directly (must load, not 404 — this relies on `vercel.json`).

GitHub Pages (legacy) instead of Vercel: `npm run deploy` (runs `build:ghpages`, publishes `dist`). Deep links on Pages need a 404 fallback; Vercel is recommended.

## 9. Roll back
- Before merge: `git checkout main` — nothing changed.
- After merge: `git revert -m 1 <merge-commit-sha>` then `git push`; or in Vercel → Deployments → previous good deployment → **Promote to Production** (instant).

## 10. Troubleshooting
| Symptom | Fix |
|---|---|
| `Could not resolve "../assets/images/…"` | An image file is missing or named differently (case-sensitive on Vercel/Linux). Compare with step 0. |
| Blank page on GitHub Pages | Use `npm run deploy` (it builds with the `/jays-bistro/` base), not `npm run build`. |
| `/menu` 404 on Vercel | `vercel.json` missing from the repo root; re-extract the zip and redeploy. |
| Chat always says "demo mode" | `.env.local` missing/empty, or the dev server was not restarted after editing it. |
| Cutout dishes show a white box | That image is not transparent; set `imageStyle: "photo"` in `src/data/menu.js` for that item. |
| Want a hidden dish on the menu | In `src/data/menu.js` change that item's `isActive: false` to `true` (and optionally add its id to `src/data/layout.js` for hero). |
| Hero shows fewer slides than expected | A hero id in `src/data/layout.js` is missing or inactive — the test `menu.test.js` catches this. |
