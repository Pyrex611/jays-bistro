# TASK.md — Sprint 3 working list

> Every request from the 2026-10-27 brief, broken down, with the owner's decisions and current status (updated 2026-11-01).
> Work top to bottom inside an epic; epics A–D and G can start now, E/F need decisions marked **BLOCKING**.
> Legend: ⬜ not started · 🟡 built as demo / partly done (see note) · ✅ done. IDs are stable: quote them in commits and PRs.

**Where things stand:** Sprint 2 is live on `jays-bistros.vercel.app` for comparison. `jays-bistro.vercel.app` is the older build and stays untouched until the domain move (epic G). All work targets the current build.

## Status at 2026-11-01: demo build

**Direction (owner, 2026-10-31):** make Sprint 3 a **demo**. The admin can open and use **every page and feature** with production-quality look, feel and transitions; integrations are **mocked** behind the real interfaces and consolidated later on approval. See [docs/DEMO_MODE.md](docs/DEMO_MODE.md) and [ADR-0007](docs/adr/0007-vercel-blob-and-demo-mode.md).

### Decisions recorded
| Q | Decision |
|---|---|
| Q1/Q2 | Palette **C Eucalyptus** for all green surfaces; **left sub-hero uses A's orange** (apricot). Dark-green text on pastel: yes |
| Q4 | Perfect the **suya skewer** and use it for Protein (`docs/design/skewer-final.png`) |
| Q5 | **(c)**: pills sticky; search collapses into a magnifier at the end of the pill row |
| Q3 | Continuous grid, no repeated headings; pills follow the scroll. **No "All" pill** |
| Q9 | Keep the "Welcome to Jay's Bistro" eyebrow; **yes** to dots overlaid on the carousel; hero is **not** limited to 5 (now up to 12) |
| Q10 | Unchanged: 360×740 and 390×844 |
| Q13 | Hot-linking Unsplash is **temporarily OK** (self-hosting later) |
| Q20 | **Leave email out for now**: UI and simulation only; real sending on integration |
| Q28 | **Show a service fee line** (online payment fee); defaults must be checked against the real Paystack plan |
| Q30 | Research Vercel free-plan Blob limits → below |
| Q36 | Site moves to `jays-bistro.vercel.app` on approval (not an issue) |
| Q6, Q7 | Not answered, defaults used with one deviation noted: **Q6** the stepper is a corner overlay on the photo (variant b) rather than morphing on the text row (default a), because it causes no layout shift; the swap is a few lines in `ProductCard`. **Q7** sub-hero teas are ids **7** (Arabian Double) and **10** (Arabian Tea Pack); id 3 (has your real photo) stays in the hero |
| Q33/Q34 | Setup/demo password **`jays-setup`**; capability-driven demo instead of a separate setup mode |

### Epic status
| Epic | Status | Note |
|---|---|---|
| A: UI/UX (A1–A13) | ✅ built | **Not yet checked on a real phone** (this sandbox has no browser): do the Owner QA table in PLAN.md on both sizes |
| B: Business settings (B1–B6) | ✅ built | Delivery zones (fee, minimum, ETA), free-delivery threshold, prep time, hours + closures, business details, announcement. Sample areas are placeholders: owner to supply real ones (Q14) |
| C: Kitchen alerts | 🟡 demo | Full UI, recipients, events, test alert, alert log and the real email template run in **simulation**. Real sending, endpoint and idempotent trigger come with the integration (needs a provider, Q20) |
| D: Payments test → live | 🟡 | Modes demo/mock/test/live and TEST/DEMO stamps, test orders excluded from KPIs, service-fee line ✅. A webhook-reachability check in the go-live card is not built (the card lists the steps) |
| E: Storage (Blob) | 🟡 designed, deferred | Research done (below); the Blob driver is written at go-live (ADR-0007) |
| F: Setup mode | ✅ via demo mode | Console opens without storage using `jays-setup`; the merchant can set their own password; edits stay in the browser |
| G: Environment & domain | 🟡 | `PUBLIC_BASE_URL` optional ✅. Per-host canonical / `noindex` (Q37) **not built yet**; domain move is a go-live step |
| H: Quality & docs | ✅ | Tests, lint, build green; docs updated |
| Images (I-1…I-5) | 🟡 | Curation + apply tooling and the "no two dishes share a photo" test ✅; hot-linked stock for now; nine dishes use honest icon tiles until photos are chosen (`npm run photos:curate`) |

### Vercel Blob research (Q30), as read from Vercel's docs on 2026-09-23 and 2026-11-01. Verify again at go-live
- **Hobby quota:** 1 GB stored per month; first 10,000 simple operations; first 2,000 advanced operations (uploads, list, copy); first 10 GB transfer. Rate limits: 20 simple ops/s, 15 advanced ops/s.
- **Over the limit:** Blob access is blocked until 30 days pass; there is no overage charge (warning emails first). Cache hits are not counted as simple operations.
- **Stores:** unlimited on every plan, each **public or private**: so the two-store layout is allowed (public photos, private data).
- **Writes:** overwrite is opt-in; conditional writes (`ifMatch`) exist, which suits the versioned menu document. **No TTL**: a daily Vercel Cron cleans expired invoices (Hobby cron: once a day, production only).
- **⚠️ Hobby is restricted to non-commercial personal use.** A restaurant taking payments needs the **Pro** plan before go-live.
- Email without a custom domain: Resend needs a verified domain (not possible on `vercel.app`); Brevo's free tier (≈300/day, one verified sender) or Gmail SMTP work.

### Still open (owner)
Real delivery areas/fees (Q14), minimums (Q15), real prep/ETA numbers (Q16), kitchen email addresses (Q19), provider (Q20), receipt retention (Q32, default 12 months), whether to redirect any old URLs at cut-over (Q38), and the Paystack service-fee numbers.

---

## 0. Cross-cutting design rule — "Brand-aware soft pastel" (applies to every task)

> **Surfaces are pastel tints of the brand hues. Actions stay saturated. Text stays deep.**

| Tier | What it covers | Colour rule |
|---|---|---|
| **Surface** | Cards, tiles, hero/sub-hero cards, empty/no-photo tiles, banners, chips, panels, receipt page backdrop, console cards | Low-chroma tints of brand green (hue ≈134°) and brand orange (hue ≈34°), plus cream. "Cloudier": a diagonal two-stop gradient + a soft white radial glow (top-left) so no surface is a flat saturated block |
| **Action** | Buttons, active pill, tray bar, quantity stepper, add button, prices, links, focus rings, toggles | Saturated brand colours `leaf-700 #286334`, `sun-500 #E4830E` — **unchanged** (e.g. the tray/cart stays as is) |
| **Text** | All copy | `leaf-900`/`ink-*` on pastel surfaces (never cream text on a pastel; never white on orange). Body text ≥ 4.5:1 |

Guardrails to enforce (task **A13**): new `sage-*` and `apricot-*` tokens in `tailwind.config.js`; a unit test that computes WCAG contrast for every documented text/surface pair; CLAUDE.md and DESIGN_SYSTEM.md carry the rule; PR review checks "no saturated block used as a card surface".

Previews for your pick: `docs/design/palette-options.png` (options A/B/C beside today's look).

---

## 1. Question register (answer inline; each has the default I'll use if you don't)

**BLOCKING** = I can't build the task correctly without it. Others have safe defaults.

### UI / UX
| # | Question | Default if unanswered |
|---|---|---|
| Q1 | **Pastel option:** A *Sage Mist*, B *Celadon Haze*, or C *Eucalyptus* (see palette-options.png). A has the best separation from the cream page; B is airiest but tiles nearly melt into the background; C is the most "same green, just cloudier". Orange pairs with the same letter | **A** |
| Q2 | Pastel surfaces need **dark-green text** (cream text would fail contrast). OK for hero cards, right sub-hero and price chips? | Yes |
| Q3 | **"All" view** — my reading: one continuous grid, **no category headings**; the sticky pills follow your scroll (the active pill changes and slides into view) and tapping a pill smooth-scrolls to that group. Is that what you mean? And should the **"All" pill stay**, or be replaced by simply starting on the first category? | As described; drop the "All" pill, since the list is always "all" |
| Q4 | **Protein icon:** pick one from `protein-icon-options.png`: 1 Drumstick (improved), 2 T-bone steak, 3 Suya skewer, 4 Fish, 5 Meat on the bone. The category has chicken, turkey, goat, beef, fish and Isi-ewu, so a drumstick alone is too narrow | **3 Suya skewer** (reads as "grilled protein", distinctly Nigerian, unlike any other icon) |
| Q5 | **Search placement** now that pills move above it: (a) pills sticky, search bar scrolls away, (b) both sticky, (c) pills sticky and search collapses into a magnifier at the end of the pill row (saves ~56 px) | (a) |
| Q6 | **Quantity stepper:** (a) the round **+** morphs in place into **− 2 +** on the card's bottom row, or (b) a floating pill over the bottom-right of the photo. At **1**, does **−** remove the item (back to **+**) — yes? | (a), **−** at 1 removes |
| Q7 | **Sub-hero tea items:** which two? Candidates: **3** Classic Arabian Blend (has your real photo), **7** Arabian Double, **6** Arabian Tea (½ L), **5** Ginger-Lemon-Cinnamon Tea. Note id 3 is in the hero today: do you want it *moved* to the sub-hero (hero then has 5 slides: Jollof, Basmati, Isi-ewu, Shawarma, Wings)? | Sub-hero = **3 + 7**; hero = 1, 36, 2, 21, 51 |
| Q8 | Removing "Open · until 10 PM / Pickup / Delivery": where should that information live? I suggest a small **info sheet** behind an (i) icon in the header (hours, address, delivery areas, WhatsApp) and, in the tray, the pickup/delivery choice already shows fees. The **"orders paused"** banner must stay (only when paused) | (i) sheet + paused banner kept |
| Q9 | To save more height: remove the eyebrow "WELCOME TO JAY'S BISTRO" and overlay the carousel dots on the hero's bottom edge? | Yes to both |
| Q10 | Which phone sizes define "relevant content visible on load"? | **360×740** (small Android) and **390×844** (iPhone); target: pills + first row of dishes visible without scrolling on both |

### Images
| # | Question | Default |
|---|---|---|
| Q11 | **Sourcing approach:** (a) I curate a pick-list from free-licence sites (Unsplash/Pexels) per dish + a script you run that downloads, resizes to WebP and saves into `public/menu/` (no hot-linking, faster, no dead links); (b) you supply real photos for the dishes you care about, I match the rest; (c) both | (c) |
| Q12 | If no accurate photo exists (e.g. Garri, Amala, Moi-Moi variants), prefer the **pastel icon tile** over a wrong photo? A wrong photo reads as a mistake; an honest icon tile does not | Yes |
| Q13 | Is hot-linking Unsplash acceptable *temporarily*, or must everything be self-hosted from now on? | Self-hosted |

### Console settings: delivery & business
| # | Question | Default |
|---|---|---|
| Q14 | **Delivery area model** — (a) one flat fee + a free-text "areas we deliver to"; (b) **zones**: a list of areas, each with its own fee (and optional minimum / ETA); the customer picks a zone at checkout; (c) distance from an address (needs a maps API; not recommended). **Please list your delivery areas and fees** (e.g. High Level, North Bank, Wurukum, Wadata…) | (b) |
| Q15 | Extras: **free delivery above ₦X**? A different **minimum per zone**? Outside the zones: show "WhatsApp us" instead of blocking? | Free-delivery threshold optional (off); per-zone minimum optional; outside zones → WhatsApp us |
| Q16 | Show **estimated times** ("ready in 20–30 min", per-zone delivery ETA) at checkout and on the receipt? Editable in the console | Yes, editable, blank = hidden |
| Q17 | **Opening hours** editable per day (+ special closures). Should orders be **blocked automatically** outside hours (with an "accepting pre-orders" option), or is it informational only as today? | Editable; informational + a console switch "Auto-pause outside hours" (off) |
| Q18 | Which business details should be editable: WhatsApp/phone number, address & pickup instructions, delivery note, announcement banner? | All four |

### Kitchen alerts
| # | Question | Default |
|---|---|---|
| Q19 | **Recipients:** how many email addresses (kitchen, owner, you)? Any CC/BCC? | Up to 5, editable list |
| Q20 | **Email provider** (decision needed because there is no custom domain): **Brevo** (free ≈300 mails/day, verify one sender address by email link, no domain DNS) · **Gmail SMTP** (Google app password; simplest, lower deliverability at volume) · **Resend** (needs a verified domain, which `*.vercel.app` can't provide; unverified it only mails the account owner) · **Amazon SES** (sandbox until approved). Which do you have/prefer, and what sender address? | **Brevo** |
| Q21 | **Which events** trigger an alert? Paid order (required) · also: invoice created from WhatsApp (not paid) · payment verification mismatch · failed alert delivery · daily summary at closing time | Paid order only; failed delivery shows in the console |
| Q22 | **Content:** order code, customer name + phone (tap-to-call), items, totals, pickup/delivery + address/zone, note, paid time, "Open in console" link. Language: English. Subject like `New paid order JB-K3F9Q · ₦9,000 · Delivery` | As listed |
| Q23 | Console extras: **Send test alert** button · **alert log** (sent/failed, last 50) · **Resend alert** per order | All three |
| Q24 | **Next channels** (modular design lets us add them): WhatsApp (Meta Cloud API needs a verified Meta business + approved message templates), SMS (Termii / Africa's Talking; Nigerian DND rules apply), web push to the kitchen tablet. Which first, and when? | Design only now; WhatsApp first later |
| Q25 | Also email the **customer** a receipt copy (they already give us an email)? | Not in this sprint; listed as T-C9 |

### Payments
| # | Question | Default |
|---|---|---|
| Q26 | While on your personal Paystack **test** keys, orders should be clearly marked TEST (stamp on receipt, flagged in console, **excluded from sales KPIs** with a toggle to include) — agree? | Yes |
| Q27 | Business account pending: go-live will be "swap `PAYSTACK_SECRET_KEY` and the webhook URL, nothing else". Do you want a **go-live checklist screen** in the console that shows key mode (test/live), webhook reachability and a "place a ₦100 order" prompt? | Yes (small card in Settings) |
| Q28 | Who pays **Paystack's fee**: absorbed (default), or add a visible "service fee" line? (Verify current Paystack pricing before deciding.) | Absorbed |

### Storage (see epic E for the analysis)
| # | Question | Default |
|---|---|---|
| Q29 | **BLOCKING:** Approve **Vercel Blob** as the single store for everything (menu, settings, invoices, receipts, alert log, password hash) **and** dish photos, replacing S3 as the default? | Yes |
| Q30 | **BLOCKING:** Blob stores are **either public or private**, set at creation. Option 1: **two stores** (public for dish photos, private for data). Option 2: **one private store**; photos are served through a cached `/api/img/…` function. Please open Vercel → Storage and tell me whether you can create two Blob stores on your plan | Option 1 if two are allowed, else 2 |
| Q31 | Keep the S3 driver in the code as an optional alternative, or remove it? | Keep (≈100 lines, tested) |
| Q32 | **Retention:** receipts keep totals forever; purge customer phone/address after how long (NDPA data-minimisation)? | 12 months |

### Setup mode & default password
| # | Question | Default |
|---|---|---|
| Q33 | **BLOCKING:** Approach for "open the console before storage exists": **(1)** *Setup mode*: with no storage connected, the console opens using a built-in default password, read-only demo with a "Connect storage" checklist; once storage is connected, the first real login requires the env bootstrap password and forces a new one. **(2)** env var only (you still set `MERCHANT_BOOTSTRAP_PASSWORD`, but no storage). **(3)** built-in default always valid (**not recommended**: anyone reading the repo could claim the console first) | (1) |
| Q34 | Default password string for setup mode (shown in the runbook, harmless because setup mode can't change anything) | `jays-setup` |
| Q35 | In setup mode, may the merchant **play with edits kept in the browser as a draft** (cannot publish)? | Yes |

### Environment & domain
| # | Question | Default |
|---|---|---|
| Q36 | **Heads-up:** invoice links and the Paystack return address come from `PUBLIC_BASE_URL`. If you set it to `jays-bistro…` on the `jays-bistros` project, invoices will point at the *old* site. I'll make it optional (derived from the request host when unset). OK? | Yes |
| Q37 | `jays-bistros` currently advertises `jays-bistro` in canonical/OG/sitemap. Add `VITE_SITE_URL` per deployment and **`noindex` on any host that isn't the canonical one** so the comparison site can't compete in search? | Yes |
| Q38 | Domain move: Vercel lets a `*.vercel.app` name belong to one project. At cut-over: remove `jays-bistro.vercel.app` from the old project, add it to this one, set `PUBLIC_BASE_URL`, update Paystack webhook. Any old URLs to redirect? | No redirects needed |

---

## 2. Epic A — UI/UX tweaks (no blockers except noted)

### A1 ✅ Pastel surface system  *(Q1, Q2)*
**Request:** green too dominant on cards; dampen/"pastel" it, same green but cloudier; leave cart etc.
**Analysis:** the dominance comes from three saturated blocks repeated ~64×: product tiles (`leaf-800`), hero cards (`leaf-700→900`), right sub-hero (`leaf-600→800`). Hue must stay, saturation and depth drop.
**Plan:** add tokens `sage-100…500` and `apricot-100…500`. Recipe for every card: `linear-gradient(135deg, c1, c2)` + overlay `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.45), transparent 60%)` + 1 px inner highlight. Dishes keep their soft drop-shadow. Option A values: green `#C0D8C5→#A2C3AA`, tile `#B4CFBB`, orange `#F5DAB8→#EDC897`.
**Switches to dark-green text** on hero/sub-hero/price chips. Price chip stays solid `sun-500` (action tier).
**Not touched:** tray bar, drawer, buttons, active pill, stepper, receipt page, console chrome.
**Acceptance:** side-by-side screenshot vs today; all text pairs ≥ 4.5:1 (unit-tested); cutout PNGs still pop (check shadow strength on pastel).

### A2 ✅ Left sub-hero (caramel → soft apricot)  *(Q1)*
`sun-400→500` → `apricot` gradient with `#5E3010` text (8.2:1 in option A). Same glow recipe.

### A3 ✅ No-photo tiles  *(Q1, Q12)*
`FoodImage` fallback uses `sage` tile + `leaf-600` line icon at 70% opacity (today: dark green with pale icon). Also used by the console previews.

### A4 ✅ "All" view: continuous, headings-free, scroll-aware  *(Q3)*
**Request:** stop repeating "Meals/Protein…" headings; options should transition smoothly as the user scrolls.
**Analysis:** removing headings loses orientation unless something else says where you are. The pills become that indicator (scrollspy).
**Plan:**
1. One grid, items ordered by category order (so groups stay contiguous).
2. Each category's first item carries `data-category`; an `IntersectionObserver` (root margin = sticky header + pill bar height) sets the active pill.
3. The active pill **scrolls itself into the centre** of the pill row (smooth, horizontal only).
4. Tapping a pill smooth-scrolls to that group's first item with the sticky offset (`scroll-margin-top`); respects `prefers-reduced-motion`.
5. Accessibility: keep a visually-hidden `<h2>` per group so screen readers still get structure.
6. Search still overrides the view; clearing returns to the same scroll position.
**Edge cases:** very short groups (Starters 3, Soups 3) flicker the active pill → use a hysteresis (keep the previous pill until the next group's first item crosses 35% of the viewport); last group at page end must still activate.
**Acceptance:** scrolling slowly activates each pill once, in order, without flicker on 360×740; tap-to-jump lands with the first card fully visible below the pills.

### A5 ✅ Protein icon  *(Q4)*
Current drumstick reads as a lollipop. Candidates drawn and tested at 20/24 px in `docs/design/protein-icon-options.png`. Implement the chosen one in `CategoryIcon.jsx` (same 24×24 grid, 1.6 stroke) and keep a test that every key renders.

### A6 ✅ Menu pills above the search bar  *(Q5)*
Order becomes: sticky pills → search → dishes. Pills keep their sticky offset; confirm the search field doesn't hide under them when focused on iOS (use `scroll-margin-top`).

### A7 ✅ Tighter vertical rhythm + above-the-fold budget  *(Q9, Q10)*
**Estimated** stack today at 390×844 (not measured; no browser available to me): header 56 + info strip ≈44 + eyebrow ≈28 + hero ≈143 + dots ≈26 + sub-hero ≈139 + search ≈60 + pills ≈52 → dishes start ≈ **y 548**, leaving ≈ one row on 390×844 and almost none on 360×740.
**Proposed:** remove strip (−44), remove eyebrow (−28), overlay dots (−26), hero/sub-hero 15svh → **13svh** (min 112 / max 150), gaps 12 → 8, pills before search → dishes start ≈ **y 400**, so ≈ 2 rows on 390×844 and ≈ 1.5 on 360×740.
**Acceptance (measured with Chrome DevTools device emulation):** at both sizes the pill bar and the first dish row are visible at load; record the numbers in the PR.

### A8 ✅ Remove "Open · until … / Pickup / Delivery" strip  *(Q8)*
Delete `InfoStrip` from the page. Keep the **paused** banner (only when `acceptingOrders` is false). New small **(i) info sheet** in the header: hours, address, delivery areas/fees (from B), WhatsApp. If Q17 chooses auto-pause, the banner also shows "Closed · opens …".

### A9 ✅ Add → quantity stepper in place  *(Q6)*
**Request:** reinstate add-to-cart transitioning into − 2 +.
**Plan:** `ProductCard` button state machine: `0 → "+"`, `≥1 → "− n +"` (morphs with a 150 ms width transition), `−` at 1 removes, `+` stops at 20 (disabled, tooltip "max 20"). Remove the quantity badge on the photo (redundant). Sold-out stays disabled. Announce changes with `aria-live`. Same stepper reused in the modal.
**Layout check:** the card is ≈170 px wide; name/price on the left would squeeze, so the stepper sits on the row **under** the name/price when active (Q6 option a/b decides).
**Acceptance:** from the grid you can go 0→3→0 without opening anything; tray count and bar total update instantly; works with the AI concierge adding items.

### A10 ✅ Sub-hero = two Arabian tea items; current picks move to the hero  *(Q7)*
Edit `data/layout.js` (and the published menu's layout if already saved in storage: this will need a console change or a one-time migration note). Hero max is 6, so there is room.

### A11 ✅ Hero/sub-hero text & chips on pastel  *(Q2)*
Covered by A1/A2; listed separately so the contrast test names each pair.

### A12 ✅ Console previews follow the new look
`LayoutManager` preview and `MenuManager` thumbnails inherit A1–A3 automatically; verify.

### A13 ✅ Guardrails & docs  *(section 0)*
Tokens, contrast unit test, DESIGN_SYSTEM.md "Pastel methodology" (already drafted in this planning update), CLAUDE.md rule (added).

---

## 3. Epic B — Merchant-editable business settings  *(Q14–Q18)*

### B1 ✅ Delivery zones  *(sample areas shipped; real areas pending Q14)*
Settings model grows (public, lives in the menu document):
```json
"delivery": {
  "enabled": true,
  "zones": [{ "id": "highlevel", "name": "High Level", "fee": 500, "minOrder": 0, "etaMins": [25, 40], "enabled": true }],
  "freeAbove": 0,
  "note": "We deliver within Makurdi. Outside these areas? WhatsApp us."
}
```
- **Checkout** and the **invoice page** show a zone picker (instead of "Delivery fee on arrival"), the fee updates live; server re-prices from the zone id (never from the browser).
- **Receipt** shows zone, fee and ETA.
- **Console → Settings → Delivery:** add/edit/disable/reorder zones; flat fee remains as the fallback when no zones are defined.
- Validation: names 2–40 chars, unique; fee whole naira 0–100 000; ≤ 30 zones.
**Acceptance:** change a zone fee in the console → publish → checkout shows it within ~30 s; tampering with a zone id or fee in the request is rejected; tests cover zone pricing, disabled zone, free-above threshold, minimum per zone.

### B2 ✅ Minimum order & free-delivery threshold *(Q15)*
Global minimum exists; add per-zone override and optional free-above. "Add ₦X more" message already exists, extend it.

### B3 ✅ Estimated times *(Q16)*
`prepMins` (pickup ready time) and per-zone `etaMins`. Shown in tray details, invoice, receipt; blank = hidden.

### B4 ✅ Opening hours in the console *(Q17)*
Move `SITE.hours` into settings: per-day open/close, "closed" days, one-off closures with a note. Drives schema.org JSON-LD, the info sheet and (optionally) auto-pause. Lagos-time tests already exist; extend them.

### B5 ✅ Business details *(Q18)*
Editable: WhatsApp/phone number (used by every `wa.me` link and the receipt), address, pickup instructions, announcement banner (optional, dismissible).
**Risk:** a wrong WhatsApp number breaks ordering: validate format and show a **"Test this number"** link.

### B6 ✅ Console UX for settings
Group into cards: *Ordering* · *Delivery zones* · *Opening hours* · *Business details* · *Alerts* · *Security*. Same draft/publish bar for public settings; **alert settings save immediately** (they are private, see C3).

---

## 4. Epic C — Kitchen alerts (modular)  *(Q19–Q25)*

### C1 🟡 Notification module
```
api/_lib/notify/
  index.js           notify(event, payload)  → fan-out to every enabled channel; never throws into the payment path
  events.js          event names + payload shape (order.paid first)
  templates/order-paid.js   → { subject, text, html }
  channels/email.js  channel: { id:'email', send(message, config) }
  channels/index.js  registry  → add whatsapp.js / sms.js later without touching callers
```
A channel implements `{ id, label, validateConfig(cfg), send(event, rendered, cfg) }`. Adding WhatsApp/SMS later = one file + one registry line + a settings card.

### C2 🟡 Email channel
Provider adapter behind the channel (Brevo REST/SMTP by default; Gmail SMTP and others as adapters), chosen by env `EMAIL_PROVIDER`. Secrets only in env vars (`BREVO_API_KEY`, `EMAIL_FROM`), never in the console or the repo. 5 s timeout, 2 retries with back-off.

### C3 🟡 Private notification settings
**Important:** recipient addresses must **not** live in the public menu document (it's served to everyone). They go in a private object `config/notifications.json` with their own protected endpoint `/api/merchant/notifications` (GET/PUT, same lock, same CSRF rule).
```json
{ "channels": { "email": { "enabled": true, "recipients": ["kitchen@…", "owner@…"] } }, "events": { "order.paid": ["email"] } }
```

### C4 🟡 Trigger point and idempotency
Fire from `settle()` after the receipt is written. The webhook and the browser callback can both settle the same invoice, so a **put-if-absent marker** (`alerts/<invoiceId>.json`) guarantees one alert per order (Blob's non-overwrite default / S3 `If-None-Match` give this natively). Send with Vercel's `waitUntil` so the customer's receipt page isn't slowed by email latency.

### C5 🟡 Failure handling
Record each attempt (channel, status, error, time) in `alerts/<id>.json`. Console shows failures and a **Resend** button; nothing is lost if the provider is down. (Hobby cron is once a day, so retries are manual + one inline retry.)

### C6 ✅ Console UI
Settings → **Alerts**: channel cards (Email enabled), recipient list with validation, **Send test alert**, **Recent alerts** (last 50, with status), "key mode" note (test vs live Paystack) so test orders don't wake the kitchen unless the owner wants (toggle "Alert on test orders", default off).

### C7 ✅ Template
Subject + plain text + simple responsive HTML (brand pastel header, items table, big total, tap-to-call phone, console link). Test with real mail clients (Gmail/Outlook/Apple Mail) before launch.

### C8 ✅ Tests
Registry dispatch, template rendering, idempotency under a webhook/callback race, provider failure doesn't break settlement, recipients validation, secrets never returned by the API.

### C9 ⬜ (later) Customer receipt email  *(Q25)*
Same module, second template.

---

## 5. Epic D — Payments in test → live  *(Q26–Q28)*

### D1 ✅ Detect Paystack key mode
Today a `sk_test_…` key is treated as "live", so test payments are stamped **PAID** and counted as sales. Fix: `mode = key.startsWith("sk_test_") ? "test" : "live"`; receipts stamp **TEST**; Orders tab flags them; KPIs exclude them by default (toggle).
### D2 🟡 Env separation
Vercel: **Preview** = test key, **Production** = test key until the business account is live. Document the swap.
### D3 🟡 Webhook per account
Each Paystack account (yours, then the business) needs its own webhook URL entry pointing at the deployment domain. Checklist in the runbook.
### D4 🟡 Go-live card in Settings *(Q27)*
Shows: key mode, webhook last-received time (store timestamp on each webhook), mock/test/live badge.
### D5 ✅ Fee policy *(Q28)*
Decide absorbed vs service-fee line; if a line is added it must appear in totals, receipt and the kobo amount.

---

## 6. Epic E — Storage on Vercel Blob  *(Q29–Q32, BLOCKING)*

### What I found (Vercel docs, read 2026-10-27)
- Blob stores are **public or private**, chosen at creation; public blobs are served by URL, private ones only through your functions.
- Creating one in the Vercel dashboard injects `BLOB_READ_WRITE_TOKEN`: no IAM, no bucket policy → much simpler than S3 and truly "one platform".
- **Overwrites are opt-in** (`allowOverwrite`) and **conditional writes** (`ifMatch`) exist → the menu's version check can be a true atomic compare-and-swap, better than S3 gave us. Non-overwrite default doubles as put-if-absent for alert idempotency.
- **CDN caching:** blobs cache up to a month by default; changes propagate in ≈60 s; browsers may keep old copies until their cache expires. Menu reads must therefore keep going through `/api/menu` (edge-cached 30 s) with a short `cacheControlMaxAge`.
- **No automatic expiry** found in the docs I read → expired invoices need a **daily Vercel Cron** cleanup. Hobby crons run **once a day** (timing within an hour), production only. That is fine: the invoice page already refuses expired invoices by timestamp; cron only removes files.
- **Hobby limits:** free within a usage allowance; if exceeded, access can be blocked until the next cycle. At restaurant volume we're far below it, but turn on Vercel usage alerts.
- Marketplace alternative: **Upstash Redis** has native TTLs and atomic ops (ideal for invoices and login throttling) but is a second vendor. I don't think we need it.

### Tasks
| ID | Task |
|---|---|
| E1 ⬜ | `blob` storage driver implementing the existing interface + `putIfAbsent` and `ifMatch` options; select via `BLOB_READ_WRITE_TOKEN` |
| E2 ⬜ | Layout per Q30: **two stores** (`BLOB_PUBLIC_*`, `BLOB_PRIVATE_*`) or **one private store + `/api/img/*`** cached image route |
| E3 ⬜ | Menu document uses `ifMatch` for atomic versioned saves (keep 409 UX) |
| E4 ⬜ | `api/cron/cleanup` (daily): delete expired `invoices/pending/*`, old `config/attempts/*`, optionally purge PII per Q32; protected by `CRON_SECRET`; `vercel.json` cron entry |
| E5 ⬜ | Receipts listing by month via `list({prefix})`; verify pagination and cap |
| E6 ⬜ | Local dev unchanged (filesystem driver); tests run the same suite against memory + a Blob fake |
| E7 ⬜ | ADR-0007 "Vercel Blob replaces S3 as default"; runbook "Create Blob store(s) in 3 clicks"; keep `docs/AWS_SETUP.md` as the optional path (Q31) |
| E8 ⬜ | Usage alerts + a console "Storage health" line (connected? last write ok?) |
**Migration:** nothing to migrate (S3 was never connected in production). First publish writes `data/menu.json`.

---

## 7. Epic F — Setup mode & default password  *(Q33–Q35, BLOCKING)*

**Why not a plain built-in default:** if a default password is always valid, whoever reads the repo can sign in *first* the moment storage is connected and set their own password (a "first-claim" takeover). Setup mode avoids it: the built-in default works **only while no storage is connected**, and then it can't change anything.

| ID | Task |
|---|---|
| F1 ⬜ | `storageStatus()` helper: `connected` / `not_configured` |
| F2 ⬜ | **Setup mode** login: if not configured, accept the built-in default (Q34), issue a session flagged `setup:true`; every write endpoint refuses setup sessions with a friendly "Connect storage to publish" |
| F3 ⬜ | Console in setup mode: banner + **checklist** ("Create Blob store → Redeploy → Set `MERCHANT_BOOTSTRAP_PASSWORD`/`SESSION_SECRET` → Sign in again"), drafts kept in the browser (Q35), Orders tab shows an empty state |
| F4 ⬜ | After storage is connected: built-in default **stops working**; first login uses the env bootstrap password and forces a new password (already built) |
| F5 ⬜ | Signing secret in setup mode: sessions are signed with `SESSION_SECRET` if set, else a per-deployment fallback that is **only valid in setup mode** (no data at risk) |
| F6 ⬜ | Tests: setup login works only when unconfigured; cannot publish/upload/read orders; default disabled once storage exists; throttle still applies |

---

## 8. Epic G — Environment & domain hygiene  *(Q36–Q38)*

| ID | Task |
|---|---|
| G1 ⬜ | `PUBLIC_BASE_URL` optional: if unset, use the request host (fixes invoice links on `jays-bistros`) |
| G2 ⬜ | `VITE_SITE_URL` drives canonical/OG/JSON-LD; sitemap and robots generated at build; **`noindex` automatically when `location.host` ≠ canonical host** |
| G3 ⬜ | Domain-move runbook (remove from old project, add to new, env, Paystack webhook, smoke test, rollback) |
| G4 ⬜ | Env matrix doc: Preview vs Production for Paystack, Blob, email, bootstrap password |

---

## 9. Epic H — Quality & docs (every sprint item)

- H1 ⬜ Tests for each task above (contrast pairs, scrollspy logic extracted as a pure function, stepper state machine, zone pricing, notification dispatch, setup mode, cron cleanup).
- H2 ⬜ Update INTENT (requirements R3.x), PLAN (Sprint 3 slices), ARCHITECTURE, DATA_MODEL, CHECKOUT doc, runbook (new Windows-CMD steps incl. Blob creation), AWS_SETUP marked optional.
- H3 ⬜ Owner QA checklist for the new look at 360×740 and 390×844 (screenshots attached).
- H4 ⬜ Re-measure bundle (storefront ≤ 150 KB gzip; today 112 KB).

---

## 10. Images — audit and plan  *(A-series, Q11–Q13)*

**Current state (measured from the catalogue):** 64 dishes → **8 have your real photos**, **56 use stock photos**, but those 56 use only **38 distinct images**; **10 images are reused by 28 dishes**.

| Reused image | Dishes sharing it | Verdict |
|---|---|---|
| Swallow/"bowl" photo | Moi-Moi, Pounded Yam, Semo, Amala, Fufu, Garri (**6**) | ❌ wrong: six different foods |
| Soup photo | Egusi Soup, Smoky Goat Pepper Soup, Nkwobi (**3**) | ❌ wrong: three different dishes |
| Salad photo | Vegetable Salad **and** Vegetable Soup | ❌ soup shows a salad |
| Meat photo | Goat Meat, Beef, Portion of Beef/Goat (**3**) | ⚠️ acceptable only if it is mixed grilled meat |
| Shawarma photo | Chicken, Chicken (DS), Beef, Combo (**4**) | ⚠️ acceptable, but one per size/protein is better |
| Chicken photo | Turkey **and** Vegetable Chicken | ❌ turkey ≠ chicken |
| Noodles | Noodles, Garnished Noodles | ⚠️ ok |
| Pizza | 6″ and 12″ | ✅ same dish |
| Tea | Arabian Tea (½ L), Arabian Double | ⚠️ ok, but these go on the sub-hero: need their own shots |
| Porridge yam / White soup | share one | ❌ wrong |

**Plan**
1. **I-1:** curated pick-list: for every dish a specific photo query and a chosen source image (free-to-use licence), with the licence/source recorded in `docs/image-credits.md`.
2. **I-2:** `scripts/fetch-stock-photos.mjs` (runs on your machine: this sandbox can't reach photo sites) downloads each file, crops to 4:3, writes optimised WebP (≈40–70 KB) to `public/menu/`, updates `data/menu.js`.
3. **I-3:** dishes with no accurate photo (likely Garri, Fufu, Amala, Moi-Moi) get the honest pastel icon tile (Q12) until you upload a real photo in the console.
4. **I-4:** hero and sub-hero dishes get priority; ask for **your own photos of the 6 hero dishes and the 2 teas** (cutouts for the hero look best).
5. **I-5:** a test fails the build if two *different* dishes share an image (allow-list for true duplicates like 6″/12″ pizza).
**Acceptance:** zero wrong-dish photos; no external image hosts left; images ≤ 80 KB each; credits file complete.

---

## 11. Suggested order of work

| Slice | Contents | Needs from you |
|---|---|---|
| **3A — Look & first screen** | A1–A3, A5–A13, images I-1…I-5 | Q1–Q10, Q11–Q13 |
| **3B — Business settings & alerts** | B1–B6, C1–C8, D1–D5, G1–G2 | Q14–Q28, Q36–Q37 |
| **3C — Storage & setup mode** | E1–E8, F1–F6, G3–G4, H2 | **Q29, Q30, Q33** (blocking) |

3A and 3B don't depend on 3C: they work on the current storage layer and move over unchanged. If you'd rather unblock the console demo first, 3C's setup mode (F) can go first.

## 12. Traceability: every line of the brief → task

| Your words | Task(s) |
|---|---|
| Delivery fee, minimum order, delivery area etc. modifiable in the console | B1–B6 |
| Kitchen alert by email, set in the admin console | C1–C8 |
| Modular so WhatsApp/SMS can be added later | C1 (+ Q24) |
| Personal Paystack for testing; business account pending | D1–D5 |
| No need to compare, work on the current version | (scope note, top of file) |
| Green too dominant on cards; pastel/cloudier, same green; leave cart etc. | §0, A1 |
| Dampen the left caramel sub-hero card | A2 |
| Dampen the green of items without images | A3 |
| "All" menu shouldn't keep mentioning Meals/Protein; smooth transitions while scrolling | A4 |
| Work on the Protein icon | A5 |
| Menu selection above the search bar | A6 |
| Reduce vertical spacing a bit | A7 |
| Reinstate add → quantity selection (− 2 +) | A9 |
| Search for relevant mock food images; review existing ones to ensure they align | §10 |
| Sub-hero = 2 Arabian tea items; move current selections to the main hero | A10 |
| Remove "Open · until 10 PM / Pickup / Delivery" | A8 |
| Optimise content/spacing so relevant content is visible on page load | A7, A8, Q9, Q10 |
| Discuss storage idea: Vercel Blob, everything on one platform | E1–E8, Q29–Q32 |
| Access the merchant dashboard before storage is set up, with a default password; merchant can set their own | F1–F6, Q33–Q35 |
| Analyse each request, break down, ask questions | §1 question register |
| Add them to TASK.md | this file |
| Brand-theme-aware soft pastel palette throughout | §0, A1–A3, A12–A13 |
