import { Barlow_Condensed, Cairo } from 'next/font/google';

/**
 * Arabic pages: Cairo for all text and the display face for Latin numbers.
 * Each language tree has its own font module so a page preloads only what
 * its first screen needs:
 * - Cairo: both subsets are preloaded. Arabic text needs the Latin one too
 *   (spaces, full stops and digits live there); loading it late reflows the
 *   hero text and shows up as layout shift.
 * - The display face only draws numbers on Arabic pages, all below the
 *   first screen on phones, so it is not preloaded here.
 * To change the Arabic font, swap `Cairo` for another next/font/google family
 * (e.g. IBM_Plex_Sans_Arabic, Tajawal) and keep `variable: '--font-body'`.
 */
const body = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body', display: 'swap' });
const display = Barlow_Condensed({ subsets: ['latin'], weight: '800', style: 'italic', variable: '--font-display-latin', display: 'swap', preload: false });

export const FONT_CLASSES = `${body.variable} ${display.variable}`;
