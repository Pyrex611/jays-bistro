import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Absolute base so deep links like /menu load their assets correctly on Vercel.
  // For GitHub Pages (served from /jays-bistro/) use: npm run build:ghpages
  base: "/",

  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
