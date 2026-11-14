import { Barlow_Condensed } from 'next/font/google';

/**
 * Arabic pages: Cairo for all text (self-hosted, see src/app/(ar)/cairo.css
 * for why it is not loaded through next/font) and the display face for Latin
 * numbers, which on Arabic pages sit below the first screen and so are not
 * preloaded.
 */
const display = Barlow_Condensed({ subsets: ['latin'], weight: '800', style: 'italic', variable: '--font-display-latin', display: 'swap', preload: false });

export const FONT_CLASSES = `font-cairo ${display.variable}`;

/** Preloaded by the Arabic layout: both are needed for the first screen. */
export const PRELOAD_FONTS = ['/fonts/cairo-arabic-v1.woff2', '/fonts/cairo-latin-v1.woff2'];
