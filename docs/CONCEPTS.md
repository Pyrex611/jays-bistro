# Concept deep-dive: dashboard, hero management, sales analytics

Brainstorm and design thinking behind Phases 2–3. Decisions that stick graduate into INTENT / ADRs.

---

## A. Menu management dashboard

### Who and how
The owner will mostly use a **phone**, between customers. So the dashboard is mobile-first too: big tap targets, one-handed flows, no tables that need horizontal scroll. Desktop gets a two-pane layout (list + editor).

### Jobs to be done (ranked by frequency)
1. "We're out of Isi-ewu **right now**" → one-tap **Sold out today** (no editing, auto-clears at 04:00 Lagos time).
2. "Change the price of Jollof" → inline price edit from the list.
3. "Add a new dish" → photo → name → price → category → done (≤ 60 s).
4. "Feature something on the home screen" → hero manager (section B).
5. "Retire a dish for good" → **Archive** (reversible).

### Item lifecycle
`active/available` → `active/sold-out` → `hidden (inactive)` → `archived`. Three different intents, three different controls:
- **Sold out** (`is_available=false`): visible but greyed with a badge, cannot be added. Staff allowed.
- **Hidden** (`is_active=false`): not on the menu, kept for later (seasonal dishes).
- **Archived** (`archived_at`): removed from lists; history intact. Hard-delete only if never ordered.

### Safeguards (what protects the owner from mistakes)
- Price edits show old → new and require a confirm when the change is > 50 % or the price is 0/missing.
- Undo toast for 8 s after hide/archive/price change; full audit log (who/what/when, before/after).
- Image upload validates type/size, previews on the real card, and warns when a "cutout" has no transparency.
- Names ≤ 80 chars, descriptions ≤ 280 (cards clamp to 2 lines — validation matches the layout).

### Roles
| Capability | Staff | Owner |
|---|:-:|:-:|
| Toggle sold-out | ✅ | ✅ |
| View orders, set status | ✅ | ✅ |
| Edit items, prices, categories | ❌ | ✅ |
| Hero / promo management | ❌ | ✅ |
| Analytics, audit log, users | ❌ | ✅ |

### Edge cases worth designing now
Two people editing the same item (last-write-wins + `updated_at` check, "changed by X, reload?") · item in hero gets archived (slot auto-skips, dashboard warns) · category emptied (pill disappears — already handled by `buildMenuModel`) · image upload fails on 3G (retry, keep form state) · price changed while a customer has it in the tray (tray resolves at read time; the WhatsApp message always shows the price they saw confirmed on screen).

### Nice-to-have later
Bulk price change by % per category · duplicate item · daily specials (auto-appear/expire) · import from CSV/Sheets · AI helper: write a mouth-watering description from the name + photo.

---

## B. Hero and sub-hero management

### Model
Slots are an ordered list of **slot entries**, each either:
- **Item slide** — points at a menu item; image, name, description and price follow the item automatically (no duplication to maintain).
- **Promo slide** — owner-authored: title, subtitle, image, optional CTA (open an item, jump to a category, or a link). This is where "Order a set with 40 % discount" lives (INTENT Q3).

Rules: hero 1–6 slides (more kills attention and payload); sub-hero exactly 2; entries may have `starts_at/ends_at` (Friday-night special, Ramadan menu, December promo) and an active switch.

### Editor UX
- Left: reorderable list (drag on desktop, up/down arrows on mobile — no drag-only controls).
- Right/top: **live preview** rendering the real `HeroCarousel`/`SubHero` components, so what the owner sees is what customers get, including cutout vs photo.
- Guard rails: warns when an item in a slot is hidden/sold-out; blocks saving an empty hero; shows "currently live / scheduled / expired" chips.

### Measuring it
Each slide click fires `promo_click` / `product_view` with `source=hero|subhero|grid`. Analytics then answers "do hero slides actually sell?" and ranks slides by click-through → add-to-cart → confirmed order. That closes the loop: the owner learns which dish earns the premium spot.

### Risks
Carousel autoplay can annoy (we pause after interaction, respect reduced motion) · big promo images slow the home page (compress on upload, `loading="eager"` only for slide 1) · stale schedule when the owner forgets (dashboard shows "expires in 2 days").

---

## C. Sales analytics

### The core problem: there is no sale to measure
Checkout ends in a WhatsApp chat. Without capturing orders, analytics can only describe *intent* (taps), not *sales*. Three options:

| Option | What it measures | Effort | Verdict |
|---|---|---|---|
| A. Events only | Funnel up to "Checkout on WhatsApp" tap | Low | Misleading as "sales" |
| **B. Capture + confirm** | Real orders: customer taps checkout → order stored → WhatsApp opens with an order code → owner confirms in dashboard | Medium | **Recommended** |
| C. Online payment (Paystack) | Verified paid orders, automatic | High | Later, on top of B |

**B in practice:** `create_order` RPC stores the order with **server-computed prices** (clients cannot tamper), returns code `JB-4821`; the WhatsApp message gains a line `Order #JB-4821`. The owner (or staff) taps **Confirm** in the inbox when the customer commits; **Delivered** / **Cancelled** later. Revenue counts only confirmed + delivered; unconfirmed "sent" orders appear as **intent**, never mixed in. If the network fails at checkout, WhatsApp still opens (ordering never depends on our backend).

### Metrics that drive decisions
| Question the owner asks | Metric |
|---|---|
| How much did we make this week vs last? | Revenue, orders, AOV with previous-period delta |
| What should I push / drop? | Top items by units and revenue; dead items (0 sales in 30 days) |
| When are we busiest? | Hour × weekday heatmap → staffing, prep, promo timing |
| Is the site working? | Funnel conversion and the biggest drop-off step |
| Does the chatbot earn its keep? | Concierge-assisted share of orders and their AOV |
| Which category carries us? | Category mix |
| Do promos work? | Slide click-through → confirmed-order rate |

### Dashboard shape (mobile-first)
Top: date range chips (Today · 7d · 30d · custom) → 4 KPI cards (Revenue, Orders, AOV, Conversion) with deltas → revenue sparkline → top items list → peak-hours heatmap → funnel → insight cards ("Shawarma is 31 % of units but only 18 % of revenue", "Nothing sold on Tuesdays before 12:00"). CSV export for the accountant.

### Data quality and honesty
- Show **"unconfirmed: N orders"** prominently so undercounting is visible, not hidden.
- Anonymous session id (random, `sessionStorage`), no fingerprinting, no third-party scripts, no PII in events. Phone/name only if the customer types it, with a clear sentence about use (NDPA 2023).
- Bots/previews inflate funnel tops → ignore events from known bot user agents and sessions with 0 interactions.
- Small numbers: hide percentages under n < 10 or label them "low sample".

### Later
Customer repeat rate (opt-in phone hash) · stock forecasting from peak times · automatic Paystack verification · weekly WhatsApp summary to the owner ("Last week: ₦412,000 from 96 orders; top: Jollof").
