import type { ThemeConfig } from './types.ts';

/**
 * COLOURS AND FONTS.
 *
 * Change `accent` to the coach's brand colour. The build checks every text
 * colour against its background and stops with a clear message if one falls
 * below WCAG AA (4.5:1), so a colour that is hard to read cannot ship.
 *
 * Tip: a bright accent (lime, yellow, cyan) needs a dark `onAccent`; a deep
 * accent (blue, red, purple) needs a white `onAccent`. `accentText` in each
 * palette is the accent used as text: on the light palette it usually has
 * to be a darker shade of the same colour.
 */
export const theme: ThemeConfig = {
  defaultMode: 'dark',
  accent: '#D4FF3A',
  onAccent: '#0B0C0E',
  hot: '#FF6A3D',
  onHot: '#0B0C0E',
  dark: {
    bg: '#0A0B0D',
    surface: '#131518',
    surface2: '#1B1E22',
    line: '#2A2E34',
    text: '#F3F5EF',
    muted: '#A4AAA2',
    accentText: '#D4FF3A',
  },
  light: {
    bg: '#F4F4EF',
    surface: '#FFFFFF',
    surface2: '#ECEDE6',
    line: '#D9DBD2',
    text: '#0D0F11',
    muted: '#53585E',
    accentText: '#456600',
  },
  fonts: {
    arabic: 'Cairo',
    latin: 'Inter',
    display: 'Barlow Condensed',
  },
};
