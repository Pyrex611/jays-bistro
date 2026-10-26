# Design system

Source: the Bonti HTML draft, re-skinned for Jay's. Tokens live in `tailwind.config.js`.

## Layout
- App column: `max-w-md` centred, `bg-ink-50`, `shadow-frame`, on an `bg-ink-100` page. Mobile = full width.
- Vertical rhythm: header → hero (pt-3) → sub-hero (mt-3) → menu section (pt-4). Page gutters `px-4`.
- Hero and sub-hero height: `13.5svh`, clamped 112–165 px.

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

## Type
Body **Outfit** 400–700 · Display **Plus Jakarta Sans** 700–800. Scale: 10 px eyebrow (uppercase, 0.3em) · 11–13 px card text · 14 px body · 16 px inputs · 24 px titles.

## Icons
Line-art, 24×24 grid, 1.6 stroke, round caps/joins, `currentColor` (`components/icons/CategoryIcon.jsx`): **all** (cloche), **meals** (plate + cutlery), **protein** (drumstick), **starters** (samosa), **bites** (burger), **beverages** (Arabian tea glass), **soups** (steaming bowl) + a WhatsApp glyph in the same style. Add new icons there and in `lib/categoryIcons.js`.

## Components
| Component | Notes |
|---|---|
| `Header` | Sticky, translucent, safe-area aware. Logo (36 px round) + name + location; tray button with pop badge |
| `HeroCarousel` | Scroll-snap, slide 59 % wide, image 38 % left; autoplay 8 s, pauses after interaction/hidden tab/reduced motion |
| `SubHero` | Left horizontal, right vertical card; falls back to one full-width card |
| `CategoryPills` | Sticky under the header; icon + label; active = green with orange icon |
| `ProductCard` | 4:3 green tile; dish floats (cutout) or fills (photo); qty badge; 36 px orange add button; "Sold out today" state |
| `ProductModal` | Centred sheet, 224 px image area, stepper or "Add to Tray" |
| `CartBar` | Sticky "View tray · ₦X" pill |
| `CartDrawer` | Tray → details step. Footer: round WhatsApp button + Checkout |
| `Receipt` | Cream paper, torn edge, PAID/TEST stamp, prints to PDF |
| `ChatWidget` | FAB bottom-right of the frame; bottom-sheet chat, 16 px input |

## Image guidance (for the Phase 2 dashboard)
- **Cutout:** PNG/WebP with alpha, dish centred with ~8 % margin, no baked shadow (the card adds one), ≥ 800 px.
- **Photo:** landscape-friendly 4:3 crop, ≥ 800 px wide, subject centred (cards crop with `object-cover`).
- Max upload 5 MB; stored ≤ 1000 px WebP.

## Motion
`fade-in` 200 ms (overlays), `pop` 300 ms (badge), drawer slide 300 ms. All disabled under `prefers-reduced-motion`.
