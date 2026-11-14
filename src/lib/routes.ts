import type { Locale } from './i18n.ts';

/**
 * Arabic is the default language and lives at the root ("/about"); English
 * mirrors it under "/en" ("/en/about"). Every page exists in both.
 */
export const ROUTES = {
  home: '/',
  transformations: '/transformations',
  programs: '/programs',
  calculators: '/calculators',
  blog: '/blog',
  about: '/about',
  book: '/book',
} as const;

export type RouteKey = keyof typeof ROUTES;

/** The address of a page in a language: href('en', '/about') → "/en/about". */
export const href = (lang: Locale, path: string): string => {
  const clean = path === '/' ? '' : path;
  return lang === 'en' ? `/en${clean}` : clean || '/';
};

export const route = (lang: Locale, key: RouteKey): string => href(lang, ROUTES[key]);

/** Strips the language prefix: "/en/blog/x" → "/blog/x". */
export const basePath = (pathname: string): string => {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname || '/';
};

/** The same page in the other language. */
export const twinPath = (pathname: string, to: Locale): string => href(to, basePath(pathname));
