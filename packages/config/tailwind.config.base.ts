import type { Config } from 'tailwindcss';

const config: Omit<Config, 'content'> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        nunito: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
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
