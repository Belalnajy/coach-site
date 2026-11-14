import type { ReactNode } from 'react';
import RootDocument from '@/components/RootDocument';
import { FONT_CLASSES } from '@/lib/fonts-en';
import { rootMetadata, rootViewport } from '@/lib/page-meta';
import '../globals.css';

// Root layout of the English site, under /en.
export const metadata = rootMetadata('en');
export const viewport = rootViewport;

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument lang="en" fontClasses={FONT_CLASSES}>
      {children}
    </RootDocument>
  );
}
