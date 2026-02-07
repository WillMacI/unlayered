/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'gold': '#D4AF37', // Metallic Gold
          'dark': '#1c1c1e', // Apple Dark
          'surface': '#2c2c2e', // Apple Surface
        }
      }
    },
  },
  plugins: [],
}
