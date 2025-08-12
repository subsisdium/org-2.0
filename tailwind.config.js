/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0A0E1A',
        blue: {
          DEFAULT: '#6D28D9', // Updated to match logo purple
          dark: '#5B21B6', // Darker purple
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(109, 40, 217, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(109, 40, 217, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(109, 40, 217, 0)' },
        },
      },
    },
  },
  plugins: [],
}