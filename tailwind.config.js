/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        border: '#30363d',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-red': 'flashRed 0.8s ease-in-out infinite',
      },
      keyframes: {
        flashRed: {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 1)', boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)' },
          '50%': { borderColor: 'rgba(185, 28, 28, 0.4)', boxShadow: '0 0 5px rgba(239, 68, 68, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
