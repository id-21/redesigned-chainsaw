/**
 * Typography constants
 * Fonts: Bitter (serif, for headings and body), Space Mono (monospace, for code)
 */

export const typography = {
  fontFamily: {
    primary: 'var(--font-bitter)',
    secondary: 'var(--font-space-mono)',
    heading: 'var(--font-bitter)',
    body: 'var(--font-bitter)',
    mono: 'var(--font-space-mono)',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographyKey = keyof typeof typography;
