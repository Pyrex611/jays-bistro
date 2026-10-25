# Design system

Source: the Bonti HTML draft, re-skinned for Jay's. Tokens live in `tailwind.config.js`.

## Layout
- App column: `max-w-md` centred, `bg-ink-50`, `shadow-frame`, on an `bg-ink-100` page. Mobile = full width.
- Vertical rhythm: header → hero (pt-3) → sub-hero (mt-3) → menu section (pt-4). Page gutters `px-4`.
- Hero and sub-hero height: `13.5svh`, clamped 112–165 px.

## Colour
| Token | Hex | Use |
|---|---|---|
| `ink-800` | #1A1A1A | Brand charcoal: primary buttons, active pill, chat bubbles (user) |
| `ink-700` | #2A2A28 | Product-card tile behind dishes |
| `ink-50` / `ink-100` | #F9F8F4 / #EDEAE3 | App / page background |
| `ink-400` / `ink-500` | #857F72 / #5E5A50 | Secondary text (400 only for ≥ 11 px non-essential text) |
| `sprout-200` → `sprout-400` | #E1ECA9 → #BCD05A | Hero/sub-hero gradient, add button (300), qty badge |
| `sprout-100` / `-200` | #EEF5CC / #E1ECA9 | Inactive pills |

Text on `sprout` surfaces is `ink-900` / `ink-700` (contrast > 7:1).

## Type
Body **Outfit** 400–700 · Display **Plus Jakarta Sans** 700–800 (headings, names on hero cards).
Scale: 10 px eyebrow (uppercase, tracking 0.3em) · 11–12 px card text · 14 px body · 16 px inputs · 24 px sheet title.

## Components
| Component | Notes |
|---|---|
| `Header` | Sticky, translucent, safe-area aware. Logo (36 px round) + name + location; tray button with pop badge |
| `HeroCarousel` | Scroll-snap, slide 59 % wide, image 38 % left; autoplay 8 s, pauses after interaction/hidden tab/reduced motion |
| `SubHero` | Left horizontal, right vertical card; falls back to one full-width card |
| `CategoryPills` | `aria-pressed`; active = charcoal, inactive = sprout-100 |
| `ProductCard` | 4:3 dark tile; dish floats (cutout) or fills (photo); qty badge; 36 px add button |
| `ProductModal` | Centred sheet, 224 px image area, stepper or "Add to Tray" |
| `CartDrawer` | Right drawer 88 %, thumbnails, steppers, total, WhatsApp checkout |
| `ChatWidget` | FAB bottom-right of the frame; bottom-sheet chat, 16 px input |

## Image guidance (for the Phase 2 dashboard)
- **Cutout:** PNG/WebP with alpha, dish centred with ~8 % margin, no baked shadow (the card adds one), ≥ 800 px.
- **Photo:** landscape-friendly 4:3 crop, ≥ 800 px wide, subject centred (cards crop with `object-cover`).
- Max upload 5 MB; stored ≤ 1000 px WebP.

## Motion
`fade-in` 200 ms (overlays), `pop` 300 ms (badge), drawer slide 300 ms. All disabled under `prefers-reduced-motion`.
