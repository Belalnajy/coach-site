import type { ReactNode } from 'react';
import RootDocument from '@/components/RootDocument';
import { FONT_CLASSES, PRELOAD_FONTS } from '@/lib/fonts-ar';
import { rootMetadata, rootViewport } from '@/lib/page-meta';
import '../globals.css';
import './cairo.css';

// Root layout of the Arabic site (the default language, at "/"). The English
// tree has its own root layout (src/app/en/layout.tsx) so each serves its own
// <html lang dir> from the server. `(ar)` is a route group: no URL segment.
export const metadata = rootMetadata('ar');
export const viewport = rootViewport;

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument lang="ar" fontClasses={FONT_CLASSES} preloadFonts={PRELOAD_FONTS}>
      {children}
    </RootDocument>
  );
}
