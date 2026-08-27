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
        'main-color' : "#17ab5b",
        'secondary-color' : "#f89b22",
        ink: "#12261b",
        muted: "#5b6b62",
        surface: "#f6faf7",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Cairo', 'system-ui', 'sans-serif'],
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