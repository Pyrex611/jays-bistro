/**
 * Line-art category icons, drawn for Jay's Bistro on a 24×24 grid:
 * one stroke weight (1.6), round caps and joins, no fills, so they inherit `currentColor` and scale cleanly.
 * Keys must match src/lib/categoryIcons.js.
 */
const PATHS = {
  all: (
    <>
      <path d="M3 17.5h18" />
      <path d="M4.8 17.5a7.2 7.2 0 0 1 14.4 0" />
      <path d="M12 10.3V8.7" />
      <circle cx="12" cy="7.6" r="1.1" />
      <path d="M7.4 14.3a4.9 4.9 0 0 1 2.5-2.7" />
      <path d="M5.5 20.3h13" />
    </>
  ),
  meals: (
    <>
      <circle cx="12" cy="12.5" r="5.4" />
      <circle cx="12" cy="12.5" r="2.5" />
      <path d="M3.3 4.5v3.6a1.5 1.5 0 0 0 3 0V4.5" />
      <path d="M4.8 4.5v3.8M4.8 9.6V20" />
      <path d="M20.7 20V4.5c-1.7.9-2.8 3-2.8 5.4v2.4h2.8" />
    </>
  ),
  protein: (
    <>
      <ellipse cx="15.3" cy="8.7" rx="5.3" ry="4.1" transform="rotate(45 15.3 8.7)" />
      <path d="M11.6 12.4 6.9 17.1" />
      <circle cx="5.7" cy="17.3" r="1.5" />
      <circle cx="6.8" cy="19.2" r="1.5" />
    </>
  ),
  starters: (
    <>
      <path d="M12 4.6 20.2 18.6H3.8Z" />
      <path d="M7.6 14.6q4.4-3.2 8.8 0" />
      <path d="M12 9.4v.01" />
    </>
  ),
  bites: (
    <>
      <path d="M4.6 10.6C4.6 7.1 7.9 4.6 12 4.6s7.4 2.5 7.4 6Z" />
      <path d="M9 7.6h.01M12 6.6h.01M15 7.6h.01" />
      <path d="M3.6 13.4c1.1 1 2.3 1 3.4 0s2.3-1 3.4 0 2.3 1 3.4 0 2.3-1 3.4 0 2.3 1 3.4 0" />
      <path d="M4.6 16.2h14.8v.9a2.4 2.4 0 0 1-2.4 2.4H7a2.4 2.4 0 0 1-2.4-2.4Z" />
    </>
  ),
  beverages: (
    <>
      <path d="M7 8.6h10c0 3.8-1.2 6.1-3 7.1V17h-4v-1.3c-1.8-1-3-3.3-3-7.1Z" />
      <path d="M7.3 11.2h9.4" />
      <path d="M6.4 20.2h11.2" />
      <path d="M10 17v3.2M14 17v3.2" />
      <path d="M10.2 6.2c-.8-.9.8-1.6 0-2.6M13.8 6.2c-.8-.9.8-1.6 0-2.6" />
    </>
  ),
  soups: (
    <>
      <path d="M3.6 11.8h16.8c0 4.4-3.7 7.5-8.4 7.5s-8.4-3.1-8.4-7.5Z" />
      <path d="M9 21h6" />
      <path d="M8.6 8.6c-.8-.9.8-1.7 0-2.7M12 8.6c-.8-.9.8-1.7 0-2.7M15.4 8.6c-.8-.9.8-1.7 0-2.7" />
    </>
  ),
};

export default function CategoryIcon({ name, size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name] ?? PATHS.meals}
    </svg>
  );
}
