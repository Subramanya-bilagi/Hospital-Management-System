/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // Muted professional blue
        secondary: '#f3f4f6', // Soft interface grays
        accent: '#10b981', // Medical safe green
        surface: '#ffffff',
        textSoft: '#4b5563',
        textDark: '#111827'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
