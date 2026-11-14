import type { Metadata } from 'next';
import type { Locale } from '../../site.config/types.ts';
import { coach } from './config.ts';
import { href } from './routes.ts';

/** Absolute address of a page: absolute('en', '/about') → "https://…/en/about". */
export const absolute = (lang: Locale, path: string): string => {
  const local = href(lang, path);
  return local === '/' ? coach.siteUrl : `${coach.siteUrl}${local}`;
};

const OG_LOCALE: Record<Locale, string> = { ar: 'ar_EG', en: 'en_GB' };

/**
 * Metadata for one page in one language: title, description, canonical
 * address, hreflang links to its twin (Arabic is x-default), Open Graph and
 * Twitter cards. The share image comes from the route's opengraph-image file.
 */
export const pageMetadata = ({
  lang,
  path,
  title,
  description,
  absoluteTitle = false,
  type = 'website',
  publishedTime,
}: {
  lang: Locale;
  /** Path without the language prefix, e.g. "/programs". */
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Metadata => ({
  title: absoluteTitle ? { absolute: title } : title,
  description,
  alternates: {
    canonical: absolute(lang, path),
    languages: { ar: absolute('ar', path), en: absolute('en', path), 'x-default': absolute('ar', path) },
  },
  openGraph: {
    type,
    title,
    description,
    url: absolute(lang, path),
    siteName: coach.name[lang],
    locale: OG_LOCALE[lang],
    alternateLocale: OG_LOCALE[lang === 'ar' ? 'en' : 'ar'],
    ...(publishedTime ? { publishedTime } : {}),
  },
  twitter: { card: 'summary_large_image', title, description },
});
