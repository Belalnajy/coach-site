import { Barlow_Condensed, Inter } from 'next/font/google';

/**
 * Fonts for the shared 404 document (src/app/global-not-found.tsx), which
 * shows both languages. None is preloaded: Next applies this document's font
 * preloads to every page, and importing the per-language modules here made
 * Arabic pages preload the English fonts (and the other way round).
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap', preload: false });
const display = Barlow_Condensed({ subsets: ['latin'], weight: '800', style: 'italic', variable: '--font-display-latin', display: 'swap', preload: false });

export const FONT_CLASSES_404 = { ar: `font-cairo ${display.variable}`, en: `${inter.variable} ${display.variable}` };
