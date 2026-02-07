/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'waveform': {
          'vocals': '#4ade80',
          'guitar': '#f97316',
          'drums': '#3b82f6',
          'bass': '#a855f7',
          'other': '#64748b',
          'combined': '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}
