/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-surface-variant": "#ddc1ae",
        "secondary": "#fdb881",
        "surface-container-low": "#1c1b1b",
        "primary": "#ffb77d",
        "primary-container": "#ff8c00",
        "background": "#131313",
        "on-surface": "#e5e2e1",
        "surface-container-highest": "#353535",
        // Kamu bisa tambah warna lain dari Stitch AI ke sini nanti
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}