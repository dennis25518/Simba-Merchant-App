/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F8FAFC',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          900: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}
