import type { Metadata } from 'next';
import type { Locale } from './i18n.ts';
import { getPost } from './posts.ts';
import { pageMetadata } from './seo.ts';

export const articleMetadata = (lang: Locale, slug: string): Metadata => {
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({ lang, path: `/blog/${slug}`, title: post.title[lang], description: post.excerpt[lang], type: 'article', publishedTime: post.date });
};
