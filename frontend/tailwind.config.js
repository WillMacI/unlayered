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
          'dark': '#0f0f0f',
          'surface': '#1a1a1a',
        }
      }
    },
  },
  plugins: [],
}
