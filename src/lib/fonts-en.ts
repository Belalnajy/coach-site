import { Barlow_Condensed, Inter } from 'next/font/google';

/**
 * English pages: Inter for text, Barlow Condensed (800 italic only) for
 * headlines and numbers; both are on the first screen, so both are preloaded.
 * To change a font, swap the import and keep the `variable` names.
 */
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Barlow_Condensed({ subsets: ['latin'], weight: '800', style: 'italic', variable: '--font-display-latin', display: 'swap' });

export const FONT_CLASSES = `${body.variable} ${display.variable}`;
