import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0D9488',
          emerald: '#10B981',
          indigo: '#4F46E5',
          sky: '#0284C7',
          surface: '#F8FAFC',
          mintMist: '#F0FDFA',
          skyMist: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '18': '4.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        xs: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        card: '0 10px 30px -5px rgba(13, 148, 136, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
