/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trakz: {
          navy: '#0a1c36',
          navyDark: '#051020',
          yellow: '#ffb100',
          gold: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Primary Brand Gold/Yellow from Logo
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          dark: '#051020',
          cardDark: '#0a1c36',
          borderDark: '#142a48',
          accent: '#059669'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'mobile': '0 -4px 20px -2px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12)'
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-light': 'bounce 1s infinite'
      }
    },
  },
  plugins: [],
}
