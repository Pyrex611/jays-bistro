/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        stone: {
          850: '#201E1D',
          950: '#121110',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}