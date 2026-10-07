/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f5fb',
          100: '#dde6f4',
          200: '#b9cae6',
          300: '#8aa6d3',
          400: '#5a7fbb',
          500: '#3a5f9f',
          600: '#2c4a80',
          700: '#233b66',
          800: '#16264a',
          900: '#0c1733',
          950: '#070d21',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        lift: '0 4px 8px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        scan: 'scan 2.4s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
