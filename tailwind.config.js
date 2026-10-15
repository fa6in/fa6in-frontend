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
        'main-color' : "#1B7F5C",
        'main-deep' : "#0F5C47",
        'secondary-color' : "#E0A526",
        ink: "#12302B",
        muted: "#4C6A63",
        surface: "#F3F7F5",
        line: "#DCE8E3",
      },
      fontFamily: {
        sans: ['Cairo', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 12px 40px rgba(18, 38, 27, 0.08)",
        card: "0 8px 24px rgba(23, 171, 91, 0.08)",
      }
    },
  },
  plugins: [],
}