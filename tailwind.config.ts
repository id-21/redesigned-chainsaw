import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          yellow: '#bf8e35',
          'blue-black': '#002436',
          purple: '#90397d',
          grey: '#c2c3c1',
        },
        // Semantic Colors
        primary: {
          DEFAULT: '#bf8e35', // yellow
          dark: '#a67a2b',
          light: '#d4a456',
        },
        secondary: {
          DEFAULT: '#002436', // blue-black
          dark: '#001a28',
          light: '#003d5c',
        },
        accent: {
          DEFAULT: '#90397d', // purple
          dark: '#7a3069',
          light: '#a85091',
        },
        neutral: {
          DEFAULT: '#c2c3c1', // grey
          dark: '#a0a19f',
          light: '#d8d9d7',
        },
      },
      fontFamily: {
        bitter: ['var(--font-bitter)', 'Georgia', 'serif'],
        'space-mono': ['var(--font-space-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-bitter)', 'Georgia', 'serif'], // Default to Bitter
        mono: ['var(--font-space-mono)', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
