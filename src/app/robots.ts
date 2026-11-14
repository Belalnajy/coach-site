import type { MetadataRoute } from 'next';
import { coach } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${coach.siteUrl}/sitemap.xml`,
    host: coach.siteUrl,
  };
}
