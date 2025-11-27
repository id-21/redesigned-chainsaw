/**
 * Brand color palette
 * Primary: #bf8e35 (Yellow) - For CTAs, links, and primary actions
 * Secondary: #002436 (Blue Black) - For headers, dark backgrounds
 * Accent: #90397d (Purple) - For highlights and secondary actions
 * Neutral: #c2c3c1 (Grey) - For borders, dividers, and muted elements
 */

export const colors = {
  brand: {
    yellow: '#bf8e35',
    blueBlack: '#002436',
    purple: '#90397d',
    grey: '#c2c3c1',
  },
  primary: {
    DEFAULT: '#bf8e35',
    dark: '#a67a2b',
    light: '#d4a456',
  },
  secondary: {
    DEFAULT: '#002436',
    dark: '#001a28',
    light: '#003d5c',
  },
  accent: {
    DEFAULT: '#90397d',
    dark: '#7a3069',
    light: '#a85091',
  },
  neutral: {
    DEFAULT: '#c2c3c1',
    dark: '#a0a19f',
    light: '#d8d9d7',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    dark: '#002436',
  },
  text: {
    primary: '#002436',
    secondary: '#4a5568',
    muted: '#718096',
    inverse: '#ffffff',
  },
} as const;

export type ColorKey = keyof typeof colors;
