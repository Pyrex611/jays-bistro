/**
 * Central configuration. Anything brand- or deployment-specific lives here so
 * components stay free of magic strings.
 */

export const SITE = {
  name: "Jay's Bistro",
  shortName: "Jay's",
  // NOTE: still the GitHub Pages URL from the legacy site. Update to the Vercel
  // domain (or custom domain) together with public/sitemap.xml and public/robots.txt.
  url: "https://pyrex611.github.io/jays-bistro",
  whatsappNumber: "2348062624447",
  locationLabel: "Makurdi, NG",
  greeting: "Welcome to Jay's Bistro",
  logoPath: "jsys_logo.jpg",
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
