# Sprint 2 runbook — apply, test locally, deploy (Windows CMD)

Replace `C:\path\to\jays-bistro` with your clone. Each step ends with **Expected**.

## 0. Confirm the current state first
```
cd /d C:\path\to\jays-bistro
node -v
git status
git branch --show-current
dir /b src\assets\images
```
**Expected:** Node ≥ 20.19 · `git status` clean (else `git add -A && git commit -m "wip"`) · the 8 images listed: `classic-arabian.jpg`, `Isi-Ewu.jpg`, `IMG_1989.PNG`, `IMG_2113.PNG`, `IMG_2134.PNG`, `IMG_2135.PNG`, `IMG_2136.PNG`, `IMG_2138.PNG`.
Also confirm Sprint 1 is what's merged: `dir src\pages` should show `StorefrontPage.jsx`.

## 1. Branch
```
git checkout -b feat/sprint-2-brand-checkout-portal
```

## 2. Apply the zip
```
copy "%USERPROFILE%\Downloads\jays-bistro-sprint-2.zip" .
tar -xf jays-bistro-sprint-2.zip
del jays-bistro-sprint-2.zip
```
**Expected:** `git status` shows many new/modified files (`api\`, `dev\`, `scripts\`, `src\…`, `docs\…`, `package.json`, `vercel.json`, …). It never touches your photos.

## 3. Move the dish photos to stable URLs (one-time)
```
npm run images:migrate
```
**Expected:** 8 lines `copied  IMG_… -> public/menu/…` and `Done: 8 copied, 0 missing.` (`public\menu\` now holds them; the merchant portal needs stable paths.) If any say MISSING, restore that file from git history and rerun.
Copy your logo too if it isn't already there: `public\jsys_logo.jpg` (the uploaded logo).

## 4. Remove files that are no longer used
```
git rm src\components\storefront\ProductGrid.jsx
```

## 5. Install and verify
```
npm install
npm run lint
npm test
npm run build
```
**Expected:** `npm install` adds `@aws-sdk/client-s3`, drops `gh-pages` (GitHub Pages deploy removed; Vercel is canonical) · lint clean · **13 files, 100 tests passed** · build ends `built in …s`.
Commit the regenerated `package-lock.json` with everything else.

## 6. Local environment (no AWS or Paystack needed)
```
copy .env.example .env.local
notepad .env.local
```
Set at least:
```
MERCHANT_BOOTSTRAP_PASSWORD=pick-a-starter-password
SESSION_SECRET=<32+ random characters>
```
Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
Leave `PAYSTACK_SECRET_KEY` and `S3_*` empty: payments run in **mock mode** and files go to `.local-data\` (git-ignored).

## 7. Run and try everything
```
npm run dev
```
Open `http://localhost:5173`.
1. **Storefront:** search "jollof", tap pills, add dishes, open the tray bar, tap **Checkout**, fill details, **Pay** → you land on the receipt (stamped **TEST**).
2. **WhatsApp:** tap the round green button → WhatsApp opens with the order + invoice link → open that link: it's the invoice → pay → receipt.
3. **Merchant:** open `http://localhost:5173/merchant`, sign in with your starter password → you're sent to Settings to **choose your own password** → then Menu: flip a dish to Sold out, add a dish with a photo, Home: reorder hero → **Publish** → refresh the storefront.
4. **Orders tab** shows the paid test orders.
Phone test: `ipconfig` for your IPv4, open `http://<ip>:5173` on the same Wi-Fi (`npm run dev` already exposes it).

## 8. Commit and push
```
git add -A
git commit -m "feat: logo-based theme, full catalogue + search, paystack checkout, invoices/receipts, merchant console"
git push -u origin feat/sprint-2-brand-checkout-portal
```

## 9. Cloud setup (once) → see `docs/AWS_SETUP.md`
S3 bucket + policy + lifecycle + IAM user → Vercel env vars → Paystack test key + webhook.
Until `S3_*` are set, production has **no storage**: the storefront still works from the bundled menu, but `/merchant` and invoices need S3.

## 10. Deploy and check the preview
Vercel builds a **Preview** from the branch. On the preview URL:
1. `/` loads; `/menu`, `/merchant`, `/invoice/anything` load (no 404).
2. `/merchant` → sign in → choose your password → publish a price change → reload `/` → visible within ~30 s.
3. Order with a Paystack **test card** → receipt (stamped PAID, mode live). Check the S3 console: `receipts/<yyyy>/<mm>/…json` exists.
4. Paste an invoice link in WhatsApp to yourself and pay from it.
5. Open the bucket's `config/merchant.json` URL in a browser → **AccessDenied**.
Merge when happy:
```
git checkout main
git merge feat/sprint-2-brand-checkout-portal
git push
```

## 11. Go live with real money
1. Paystack: complete business verification.
2. Vercel env: replace `PAYSTACK_SECRET_KEY` with `sk_live_…`; Paystack live webhook URL = `https://jays-bistro.vercel.app/api/paystack/webhook`. Redeploy.
3. Place a small real order yourself (₦100 dish), confirm the receipt and the Paystack dashboard match.
4. In the console, set delivery fee/minimum order as you want.

## 12. Roll back
Vercel → Deployments → previous good deployment → **Promote to Production** (instant). Menu data in S3 is untouched by deploys.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Dish photos show a green icon | Run `npm run images:migrate`; check `public\menu\` has the 8 files |
| `/merchant` says "portal isn't set up" | `MERCHANT_BOOTSTRAP_PASSWORD` missing (local: `.env.local`; prod: Vercel env) then restart/redeploy |
| Login says "Too many attempts" | Wait 15 min, or in dev delete `.local-data\config\attempts` |
| Forgot the portal password | S3 → delete `config/merchant.json`; the starter password works again and forces a new one |
| Checkout says "payment isn't switched on" | Production has no `PAYSTACK_SECRET_KEY` |
| Paid but still "confirming" | Wait ~30 s (bank transfers lag); the webhook will settle it. Check the webhook URL in Paystack |
| 500 on `/api/menu` or checkout in prod | S3 env vars wrong; Vercel → Logs |
| `/menu` 404 on Vercel | `vercel.json` missing from the repo root |
