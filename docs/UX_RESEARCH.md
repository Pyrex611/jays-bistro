# UX research, audit and decisions (Sprint 2)

## 1. How the three versions compare

I could only read each site's HTML head (both are client-rendered, so a fetch returns metadata, not the UI). Visual comparison needs screenshots; this table is what is verifiable.

| | **jays-bistro.vercel.app** (older, self-developed) | **jays-bistros.vercel.app** (Sprint 1) | **Sprint 2** (this zip) |
|---|---|---|---|
| Title | "Handcrafted Dining & Delicacies Delivered" | "Premium Dining in Makurdi" | "Arabian Tea & Premium Dining in Makurdi" |
| Theme colour | `#BE7C3F` caramel | `#1A1A1A` charcoal | `#286334` logo green |
| Palette | Caramel/earth (not from the logo) | Charcoal + lime (not from the logo) | **Sampled from the logo**: green `#286334`, orange `#E4830E`, cream `#FBF8EE` |
| Pinch-zoom | **Blocked** (`maximum-scale=1`, `user-scalable=no`) | Allowed | Allowed |
| Social/OG tags | None seen in the head | Present, but point to the old GitHub Pages host | Present, canonical `jays-bistro.vercel.app` |
| Rendering | Client-side only | Client-side only | Client-side only (see risk below) |
| Menu | Not verifiable | 12 items | **64 items**, grouped by category + search |
| Checkout | Not verifiable | WhatsApp only | **Paystack + WhatsApp**, invoices, receipts |
| Merchant tools | none | none | `/merchant` console (menu, home layout, orders, settings) |

**Findings**
1. Sprint 1 inherited a canonical-URL bug: its OG/Twitter URLs pointed at GitHub Pages, so link previews for the live site would credit the wrong host. Fixed.
2. Both live builds ship an empty HTML body to crawlers and link-preview bots (my fetch saw only the head). Google renders JavaScript, but WhatsApp/iMessage previews and some crawlers do not read it. The `<head>` OG tags cover previews; real content for search still needs prerendering or Next.js (ADR-0001 gate, now Sprint 3).
3. The older version blocked zoom, which fails accessibility guidance and frustrates people with low vision.

## 2. What the research says (and what I did about it)

Sources: food-app UX guides (boundev.ai, deonde.co), Baymard Institute checkout research, the Salesforce B2C checkout playbook, and Nigerian delivery-platform coverage (Afridigest, TechCrunch and Semafor on Chowdeck). Where I name a source below it is for a specific, paraphrased point; generic blog advice is marked as such.

| Pattern | Evidence / source | In this build |
|---|---|---|
| **Sticky category navigation** that stays visible while the menu scrolls | Food-app UX guides (boundev) | Sticky pill bar under the header, with line-art icons |
| **Prominent search** for any menu bigger than a screen | Same | Search above the pills; accent/case-insensitive, name matches ranked first, friendly empty state |
| **Whole menu scannable** (sections, not only filters) | My observation of how large delivery apps lay out menus (not from a cited source) | "All" renders titled category sections with counts |
| **Sticky cart summary** (count + running total) | Food-app UX guides | Bottom "View tray · ₦X" bar; chat button lifts above it |
| **Show all costs early**; surprise fees are a top abandonment reason | Baymard | Delivery fee shown in the info strip, in the checkout step, and in the total; minimum order shown with "add ₦X more" |
| **Guest checkout, minimal fields, single column, labels above fields** | Baymard | No accounts. Name, phone, email, (address if delivery). Autofill attributes, details remembered on this device |
| **Explain why you need a field** | Baymard | "Your receipt is sent here. We never share it." |
| **Never wipe the form on an error; inline, specific errors** | Baymard | Errors under each field; form state preserved |
| **Clear confirmation with an order number and what happens next** | Baymard / Salesforce | Success animation → receipt with code, items, totals, payment method, reference, and a "what happens next" card |
| **Flexible payment methods** matter for local conversion | Nigerian platform coverage | Paystack's hosted page offers card, bank transfer and USSD; no card form of our own |
| **Open/closed clarity** | Generic restaurant UX | "Open · until 10 PM" / "Closed · opens tomorrow at 8 AM" (Lagos time) |

## 3. Audit of the Sprint 1 platform → changes made

| Issue found | Severity | Fix |
|---|---|---|
| Tray lost on refresh or when leaving for Paystack | High | Tray persisted on-device (ids + quantities only) |
| WhatsApp-only checkout: no payment, no order record | High | Paystack + invoices + receipts; orders appear in the console |
| No search; 12-item limit hid most of the menu | High | Full catalogue + search + sections |
| No way to say "sold out today" | High | Per-dish in-stock switch; shown on cards, blocked in tray, server-enforced |
| No way to pause orders (closed, overwhelmed) | Medium | "Taking orders" switch in the console header, instant, no redeploy |
| Image failure showed a placeholder from a third-party site | Medium | On-brand line-icon fallback, no external dependency |
| Add button 28→36 px, text 10–11 px | Medium | 36 px tap targets, 13 px names |
| Brand colours didn't match the logo | Medium | Theme sampled from the logo |
| Hero cards all identical | Low | Left sub-hero orange (sun), right green (leaf): echoes the logo |
| Anchor `#menu` hidden under sticky header | Low | `scroll-mt` + sticky offset using safe-area insets |

## 4. Deliberately *not* done (and why)
- **Accounts / login for customers:** friction for a one-restaurant menu; guest checkout is the evidence-backed default.
- **Live order tracking:** needs rider/kitchen status updates; revisit when there is an order-status workflow.
- **Ratings/reviews:** moderation burden; use Google reviews link later.
- **Upsell pop-ups ("add a drink?")**: strong lever for AOV, but should be designed with the real best-seller data from the Orders tab first.

## 5. Next UX candidates (data-driven)
Reorder button on receipts · "Popular" row from real order data · item options (spice level, extras) once the menu needs them · estimated prep/delivery time shown at checkout · push/email order notifications to the kitchen.
