import { Barlow_Condensed } from 'next/font/google';

/**
 * The display face for headlines and big numbers, shared by both language
 * trees (one declaration, so one file even when a visitor reads both).
 * One weight and style only: 800 italic. To change the display font, swap
 * this import and keep the variable name (see README, "Fonts").
 */
export const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: '800',
  style: 'italic',
  variable: '--font-display-latin',
  display: 'swap',
});
