import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { apiDevPlugin } from "./dev/apiPlugin.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],

  // Absolute base so deep links like /menu and /invoice/<id> load their assets correctly on Vercel.
  base: "/",

  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
    env: { STORAGE_DRIVER: "memory", NODE_ENV: "test" },
  },
});
