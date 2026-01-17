/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // 'main-color' : "#2A3A6E",
        // 'main-color' : "#f89b22",
        'main-color' : "#17ab5b",

      }
    },
  },
  plugins: [],
}