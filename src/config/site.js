/**
 * Central configuration. Anything brand- or deployment-specific lives here so
 * components stay free of magic strings.
 */

export const SITE = {
  name: "Jay's Bistro",
  shortName: "Jay's",
  // Canonical domain. If this ever changes, also update public/sitemap.xml, public/robots.txt and the OG tags in index.html.
  url: "https://jays-bistro.vercel.app",
  whatsappNumber: "2348062624447",
  locationLabel: "Makurdi, NG",
  greeting: "Welcome to Jay's Bistro",
  tagline: "Arabian Tea · Nigerian & Intercontinental",
  logoPath: "logo-mark-192.png", // emblem crop of the logo, for avatars (header, receipt, login)
  faviconPath: "favicon-64.png",
  ogImagePath: "jsys_logo.jpg", // full logo, for link previews
  address: {
    street: "Precious Events Centre",
    locality: "Makurdi",
    region: "Benue",
    country: "NG",
  },
  geo: { latitude: 7.7322, longitude: 8.5223 },
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "22:00" },
    { days: ["Saturday"], opens: "09:00", closes: "23:00" },
    { days: ["Sunday"], opens: "10:00", closes: "22:00" },
  ],
  cuisines: ["Nigerian", "Intercontinental", "Fast Food"],
  priceRange: "₦₦",
};

export const CAROUSEL_INTERVAL_MS = 8000;

/**
 * AI concierge. The key is read from the Vite env (see .env.example).
 * WARNING: any VITE_* value is bundled into the browser build and is public.
 * Restrict the key (HTTP referrer + API restriction) until Phase 2 moves the call
 * behind a server-side proxy (docs/adr/0003-ai-concierge-proxy.md).
 */
export const CHATBOT = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY ?? "",
  model: "gemini-2.5-flash",
};

/** Resolve a file in /public against the configured Vite base path. */
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
