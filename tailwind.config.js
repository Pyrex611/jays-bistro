/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palette sampled from the Jay's Bistro logo (jsys_logo.jpg):
        //   green  #286334 → leaf-700   ·   orange #E4830E → sun-500   ·   cream #FBF8EE → cream-100
        leaf: {
          50: "#F0F7F1", 100: "#DCEDDF", 200: "#B9DBC0", 300: "#8CC298", 400: "#5BA26B",
          500: "#3A8450", 600: "#2F7143", 700: "#286334", 800: "#1E4B28", 900: "#143219", 950: "#0C2012",
        },
        sun: {
          50: "#FFF7EA", 100: "#FDEBCB", 200: "#FAD598", 300: "#F6B95E", 400: "#EE9B2D",
          500: "#E4830E", 600: "#C46A09", 700: "#A05309", 800: "#7F4010", 900: "#5E3010",
        },
        cream: {
          50: "#FDFCF6", 100: "#FBF8EE", 200: "#F4EEDC", 300: "#E9E2CC", 400: "#D4CBAE",
        },
        // Text neutrals with a faint green undertone so they sit well beside the brand green.
        ink: {
          50: "#F6F7F4", 100: "#ECEFEA", 200: "#D6DCD4", 300: "#B1BAB1", 400: "#85928A",
          500: "#5C6B61", 600: "#46554B", 700: "#2F3D34", 800: "#1F2D24", 900: "#121C16",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 24px -10px rgba(20,50,25,0.38), 0 4px 10px -4px rgba(20,50,25,0.22)",
        "card-hover": "0 18px 32px -12px rgba(20,50,25,0.5), 0 6px 14px -4px rgba(20,50,25,0.28)",
        frame: "0 0 0 1px rgba(20,50,25,0.05), 0 20px 50px -20px rgba(20,50,25,0.28), 0 8px 20px -10px rgba(20,50,25,0.15)",
        fab: "0 12px 28px -8px rgba(20,50,25,0.55), 0 4px 10px -4px rgba(20,50,25,0.3)",
        bar: "0 -8px 24px -8px rgba(20,50,25,0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } },
        draw: { to: { strokeDashoffset: "0" } },
        confetti: { "0%": { transform: "translateY(0) rotate(0)", opacity: "1" }, "100%": { transform: "translateY(120px) rotate(280deg)", opacity: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "slide-up": "slide-up 0.35s ease-out both",
        pop: "pop 0.3s ease-out both",
        draw: "draw 0.6s 0.2s ease-out forwards",
        confetti: "confetti 1.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
