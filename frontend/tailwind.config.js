/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        "primary": "#000000",
        "secondary": "#4648d4",
        "background": "#fbf9fa",
        "surface": "#ffffff",
        "on-surface": "#1b1c1d",
        "on-surface-variant": "#45464d",
        "outline-variant": "#c6c6cd",
        "primary-container": "#131b2e",
        "on-primary": "#ffffff",
        "secondary-fixed": "#e1e0ff",
        "on-secondary-fixed": "#07006c",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
}