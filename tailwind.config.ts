import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9fb',
        teal: {
          50: '#e6fffb',
          100: '#b7f4eb',
          500: '#00bfa5',
          700: '#006b5c',
          900: '#00473c',
        },
        cobalt: '#0056c5',
        alert: '#b81d27',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        bloom: '0px 4px 20px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config;
