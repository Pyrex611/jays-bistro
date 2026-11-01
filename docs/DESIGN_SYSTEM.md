# Design system

Source: the Bonti HTML draft, re-skinned for Jay's. Tokens live in `tailwind.config.js`.

## Layout
- App column: `max-w-md` centred, `bg-ink-50`, `shadow-frame`, on an `bg-ink-100` page. Mobile = full width.
- Vertical rhythm: header (56 px) → status banners (only when needed) → hero (pt-2.5) → sub-hero (mt-2) → menu section (pt-2) with the sticky category bar (56 px). Page gutters `px-4`.
- Hero and sub-hero height: `13svh`, clamped 112–150 px. Carousel dots float over the hero's bottom edge (no extra row). The "Welcome to Jay's Bistro" eyebrow stays.
- Above-the-fold target (360×740 and 390×844): header, hero, sub-hero, the pill bar and the first row of dishes. Verify on a real phone: this sandbox has no browser.
- The open/closed + pickup/delivery strip is gone: that information lives behind the **(i)** button (`InfoSheet`).

## Colour (sampled from the logo)
| Token | Hex | Use |
|---|---|---|
| `leaf-700` | #286334 | **Logo green.** Primary buttons, active pill, wordmark, hero cards (with `leaf-900`) |
| `leaf-800` / `leaf-900` | #1E4B28 / #143219 | Product tile behind dishes, receipt page background |
| `sun-500` | #E4830E | **Logo orange.** Add button, price chip, badges, success disc, PAID stamp |
| `sun-400` → `sun-500` | #EE9B2D → #E4830E | Left sub-hero card (text `leaf-950`) |
| `cream-100` / `cream-50` | #FBF8EE / #FDFCF6 | **Logo background.** App background / cards |
| `cream-200` / `-300` | #F4EEDC / #E9E2CC | Page surround, borders |
| `ink-900` … `ink-500` | #121C16 … #5C6B61 | Text (green-tinted neutrals). `ink-500` is the lightest allowed for body text (≥ 4.5:1 on cream) |
| `#25D366` | WhatsApp green | Only the round WhatsApp buttons |

Orange never carries white text (contrast); it carries `leaf-950`.

## Methodology: brand-aware soft pastel (adopted 2026-10-27; final values chosen 2026-10-31)

> **Surfaces are pastel tints of the brand hues. Actions stay saturated. Text stays deep.**

| Tier | Used for | Rule |
|---|---|---|
| Surface | cards, tiles, hero/sub-hero, no-photo tiles, banners, chips, panels, receipt/invoice/login backdrops, console cards | tints of brand green (hue ≈134°) / orange (hue ≈34°) + cream; diagonal two-stop gradient + soft white radial glow ("cloud") |
| Action | buttons, active pill, tray bar, stepper, add button, prices, toggles, focus rings | saturated `leaf-700` / `sun-500`, unchanged |
| Text | all copy | `leaf-900` / `leaf-950` / `ink-*` on pastel; never cream text on pastel, never white on orange; body ≥ 4.5:1 |

**Chosen palette:** option **C "Eucalyptus"** for every green surface (`sage-*`), and option **A "Sage Mist"'s orange** for the left sub-hero (`apricot-*`). Previews: `docs/design/palette-options.png`.

| Token | Hex |
|---|---|
| `sage-100 … 700` | 100 #E6EFE8 · 200 #CFE0D4 · 300 #B7D0BE · 400 #9DBEA5 · 500 #93B49A · 600 #81A78A · 700 #6B9275 |
| `apricot-100 … 500` | 100 #FBEBD7 · 200 #F8E2C6 · 300 #F5DAB8 · 400 #EDC897 · 500 #E3B578 |

| Class (`src/index.css`) | Where | Gradient |
|---|---|---|
| `.surface-sage` | hero cards, right sub-hero, overview hero, icon chips | `sage-400 → sage-600` + glow |
| `.surface-sage-tile` | product tiles, no-photo tiles, thumbnails, modal image area | `sage-400 → sage-500` + glow |
| `.surface-apricot` | left sub-hero, order avatars, fee calculator | `apricot-300 → apricot-400` + glow |

Cloud recipe: `linear-gradient(135deg, c1, c2)` + `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.35–.45), transparent 60%)` + 1 px inner highlight.
Text on sage: `leaf-950` / `leaf-900`. Text on apricot: `sun-900`. Price chip: `sun-500` with `leaf-950`.
**Enforcement:** `src/__tests__/palette.test.js` computes WCAG contrast for every documented pair and checks that surfaces stay light and actions saturated; PR check "no saturated card surfaces".

## Type
Body **Outfit** 400–700 · Display **Plus Jakarta Sans** 700–800. Scale: 10 px eyebrow (uppercase, 0.3em) · 11–13 px card text · 14 px body · 16 px inputs · 24 px titles.

## Icons
Line-art, 24×24 grid, 1.6 stroke, round caps/joins, `currentColor` (`components/icons/CategoryIcon.jsx`): **all** (cloche), **meals** (plate + cutlery), **protein** (suya skewer: three separated chunks on a stick with a handle knob; rendered options in `docs/design/skewer-final.png`), **starters** (samosa), **bites** (burger), **beverages** (Arabian tea glass), **soups** (steaming bowl) + a WhatsApp glyph in the same style. Add new icons there and in `lib/categoryIcons.js`.

## Components
| Component | Notes |
|---|---|
| `Header` | Sticky, translucent, safe-area aware. Logo (36 px round) + name + location; tray button with pop badge |
| `HeroCarousel` | Scroll-snap, slide 64 % wide, image 38 % left, sage cloud card, dark-green text, orange price chip; up to **12** slides; autoplay 8 s, pauses after interaction/hidden tab/reduced motion; dots float over the bottom edge |
| `SubHero` | Left horizontal **apricot**, right vertical **sage**; defaults are the two Arabian teas (ids 7 and 10); falls back to one full-width card |
| `CategoryBar` | Sticky under the header, 56 px. Six pills with line-art icons (no "All"); the active pill follows the scroll (`useScrollSpy`) and slides into view; tapping a pill smooth-scrolls to its group. A magnifier sits at the end of the row; tapping it swaps the pills for the search field (same strip) |
| `MenuSections` | One continuous grid. No repeated category headings: each group's first card is the scroll anchor (`data-group-start`) with an `sr-only` heading for screen readers. Search replaces the grid with ranked results |
| `ProductCard` | 4:3 sage tile; dish floats (cutout) or fills (photo); no-photo dishes show the category icon on the tile. **Add control lives on the tile's bottom-right corner** (no layout shift): round **+** → **− 2 +**; **−** at 1 removes; "Sold out today" state |
| `InfoSheet` | Behind the **(i)** header button: open/closed, hours (today highlighted), address, pickup note, delivery areas with fee + ETA, free-delivery/minimum, WhatsApp + call |
| `StatusBanners` | Only when needed: orders paused, closed with auto-pause on, or the merchant's announcement |
| `ProductModal` | Centred sheet, 224 px image area, stepper or "Add to Tray" |
| `CartBar` | Sticky "View tray · ₦X" pill |
| `CartDrawer` | Tray → details step. Footer: round WhatsApp button + Checkout |
| `Receipt` | Cream paper, torn edge, stamp **PAID** (live) / **TEST** (mock, test key) / **DEMO** (demo payment); zone, delivery and online-payment-fee lines; prints to PDF. Sits on a sage backdrop |
| `MockPaymentPage` | Demo-only stand-in for Paystack (`/pay/demo/:id`): card / transfer / USSD, processing steps, simulate failure |
| Console | Five tabs: Overview, Menu, Home, Orders, Settings. Settings is eight cards (`Section`) with a sticky section strip; `Badge` tones: good, warn, demo, soon, bad |
| `ChatWidget` | FAB bottom-right of the frame; bottom-sheet chat, 16 px input |

## Image guidance (for the Phase 2 dashboard)
- **Cutout:** PNG/WebP with alpha, dish centred with ~8 % margin, no baked shadow (the card adds one), ≥ 800 px.
- **Photo:** landscape-friendly 4:3 crop, ≥ 800 px wide, subject centred (cards crop with `object-cover`).
- Max upload 5 MB; stored ≤ 1000 px WebP.

## Motion
`fade-in` 200 ms (overlays), `pop` 300 ms (badge), drawer slide 300 ms. All disabled under `prefers-reduced-motion`.
