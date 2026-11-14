import { Inter } from 'next/font/google';
import { display } from './fonts-display';

/** English pages: Inter for text, the shared display face for headlines. */
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const FONT_CLASSES = `${body.variable} ${display.variable}`;
