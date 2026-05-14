/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        at: { red: '#CC0000', darkred: '#9B0000' },
      },
    },
  },
  plugins: [],
}
