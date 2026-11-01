/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Caramel Palette (Firewood, roasting, savory warmth)
        caramel: {
          50:  '#FBF4EC',
          100: '#F5E6D0',
          200: '#EBCDA6',
          300: '#DEB077',
          400: '#CE9250',
          500: '#BE7C3F',
          600: '#A56630',
          700: '#845028',
          800: '#6B4122',
          900: '#4E2F19',
        },
        // Botanical Bistro Green Palette (Logo herb & tea identity)
        bistro: {
          50:  '#F2F7F0',
          100: '#E1EEDD',
          200: '#C3DCBA',
          300: '#9FC593',
          400: '#73A766',
          500: '#4E8740', // Core Bistro Green
          600: '#3D6D32',
          700: '#2F5326', // Deep Forest Herb
          800: '#233C1D',
          900: '#172714',
        },
        // Pearl Charcoal & Neutral Palette
        pearl: {
          50:  '#F4EDE6',
          100: '#E5D3C2',
          200: '#C7A687',
          300: '#A67C58',
          400: '#7E573A',
          500: '#5E3D28',
          600: '#4A2F1E',
          700: '#3A2417',
          800: '#2C1A10',
          900: '#1E110A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}