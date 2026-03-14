import type { Config } from 'tailwindcss';

const config: Omit<Config, 'content'> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        upp: {
          primary: '#6366f1',
          'primary-dark': '#4f46e5',
          secondary: '#10b981',
          accent: '#f59e0b',
          danger: '#ef4444',
          surface: '#f8fafc',
          'surface-dark': '#1e293b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
