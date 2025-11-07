import type { Config } from 'tailwindcss';
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pop: { '0%': { transform: 'scale(.95)', opacity: 0.7 }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: { pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
} satisfies Config;
