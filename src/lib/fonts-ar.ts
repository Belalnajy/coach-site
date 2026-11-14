import { Cairo } from 'next/font/google';
import { display } from './fonts-display';

/**
 * Arabic pages: Cairo for all text (it carries Latin letters too) and the
 * shared display face for Latin numbers in headlines. Each language has its
 * own font module so a page preloads only its own files. To change the
 * Arabic font, swap `Cairo` for another next/font/google family (e.g.
 * IBM_Plex_Sans_Arabic, Tajawal) and keep `variable: '--font-body'`.
 */
const body = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body', display: 'swap' });

export const FONT_CLASSES = `${body.variable} ${display.variable}`;
