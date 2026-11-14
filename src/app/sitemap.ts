import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';
import { ROUTES, type RouteKey } from '@/lib/routes';
import { pageVisible } from '@/lib/nav';
import { features } from '@/lib/config';
import { absolute } from '@/lib/seo';

/** Every page in both languages, each listing its twin as an alternate. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Only pages that are shown: no results page without stories, no blog while it is off.
  const posts = features.blog ? getPosts() : [];
  const latest = posts[0]?.date;
  const entry = (path: string, lastModified?: string, priority = 0.7) =>
    (['ar', 'en'] as const).map((lang) => ({
      url: absolute(lang, path),
      ...(lastModified ? { lastModified } : {}),
      priority: lang === 'ar' ? priority : priority - 0.1,
      alternates: { languages: { ar: absolute('ar', path), en: absolute('en', path), 'x-default': absolute('ar', path) } },
    }));
  return [
    ...(Object.entries(ROUTES) as [RouteKey, string][])
      .filter(([key]) => pageVisible(key))
      .flatMap(([, path]) => entry(path, path === '/blog' ? latest : undefined, path === '/' ? 1 : 0.8)),
    ...posts.flatMap((p) => entry(`/blog/${p.slug}`, p.date, 0.6)),
  ];
}
