import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';
import { ROUTES } from '@/lib/routes';
import { absolute } from '@/lib/seo';

/** Every page in both languages, each listing its twin as an alternate. */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const latest = posts[0]?.date;
  const entry = (path: string, lastModified?: string, priority = 0.7) =>
    (['ar', 'en'] as const).map((lang) => ({
      url: absolute(lang, path),
      ...(lastModified ? { lastModified } : {}),
      priority: lang === 'ar' ? priority : priority - 0.1,
      alternates: { languages: { ar: absolute('ar', path), en: absolute('en', path), 'x-default': absolute('ar', path) } },
    }));
  return [
    ...Object.values(ROUTES).flatMap((path) => entry(path, path === '/blog' ? latest : undefined, path === '/' ? 1 : 0.8)),
    ...posts.flatMap((p) => entry(`/blog/${p.slug}`, p.date, 0.6)),
  ];
}
