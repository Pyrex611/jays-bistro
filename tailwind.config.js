/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Neutrals: warm charcoal → cream. ink-800 is Jay's brand charcoal (#1A1A1A), ink-50 the app background.
        ink: {
          50: "#F9F8F4",
          100: "#EDEAE3",
          200: "#D9D5CA",
          300: "#B7B2A5",
          400: "#857F72",
          500: "#5E5A50",
          600: "#403D36",
          700: "#2A2A28",
          800: "#1A1A1A",
          900: "#0F0F0E",
        },
        // Accent: Jay's soft lime (#E1ECA9 = sprout-200) used for hero cards, pills and highlights.
        sprout: {
          50: "#F7FAE6",
          100: "#EEF5CC",
          200: "#E1ECA9",
          300: "#D0E07F",
          400: "#BCD05A",
          500: "#A3B83F",
          600: "#829330",
          700: "#637025",
          800: "#4B551E",
          900: "#343B15",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 24px -10px rgba(26,26,26,0.38), 0 4px 10px -4px rgba(26,26,26,0.22)",
        "card-hover": "0 18px 32px -12px rgba(26,26,26,0.5), 0 6px 14px -4px rgba(26,26,26,0.28)",
        frame: "0 0 0 1px rgba(26,26,26,0.04), 0 20px 50px -20px rgba(26,26,26,0.25), 0 8px 20px -10px rgba(26,26,26,0.15)",
        fab: "0 12px 28px -8px rgba(26,26,26,0.55), 0 4px 10px -4px rgba(26,26,26,0.3)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        pop: "pop 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
