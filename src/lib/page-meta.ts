import type { Metadata, Viewport } from 'next';
import type { Locale } from './i18n.ts';
import { dict, fill } from './i18n.ts';
import { coach, theme } from './config.ts';
import { ROUTES, type RouteKey } from './routes.ts';
import { pageMetadata } from './seo.ts';

const vars = (lang: Locale) => ({ coach: coach.name[lang], role: coach.role[lang], intro: coach.intro[lang] });

/** Shared by both root layouts. */
export const rootMetadata = (lang: Locale): Metadata => ({
  metadataBase: new URL(coach.siteUrl),
  title: { default: coach.name[lang], template: `%s | ${coach.name[lang]}` },
  applicationName: coach.name[lang],
  authors: [{ name: coach.name[lang] }],
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: coach.shortName[lang], statusBarStyle: 'black-translucent' },
  // The template's made-up coach must never show up in search results.
  ...(coach.sample ? { robots: { index: false, follow: false } } : {}),
});

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: theme.dark.bg },
    { media: '(prefers-color-scheme: light)', color: theme.light.bg },
  ],
};

/** Title, description and links for one of the fixed pages. */
export const routeMetadata = (lang: Locale, key: Exclude<RouteKey, never>): Metadata => {
  const m = dict(lang).meta[key === 'home' ? 'home' : key];
  return pageMetadata({
    lang,
    path: ROUTES[key],
    title: fill(m.title, vars(lang)),
    description: fill(m.description, vars(lang)),
    absoluteTitle: key === 'home',
  });
};

