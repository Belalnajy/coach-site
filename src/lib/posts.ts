import fs from 'node:fs';
import path from 'node:path';
import type { Locale, Localized } from '../../site.config/types.ts';
import { blogCategories } from '../../site.config/blog.ts';
import { parseMarkdown, plainText, type Block } from './markdown.ts';

/**
 * Blog posts from site.config/posts/*.md. One file per article, both
 * languages inside:
 *
 *   ---
 *   slug: my-article          (lowercase-with-dashes, becomes the address)
 *   date: 2026-10-02
 *   category: nutrition       (an id from site.config/blog.ts)
 *   cover: /images/blog/my-article.webp
 *   title.ar: …   title.en: …
 *   excerpt.ar: … excerpt.en: …
 *   ---
 *   :::ar
 *   Arabic Markdown…
 *   :::
 *   :::en
 *   English Markdown…
 *   :::
 *
 * Read at build time only (server code); the pages are static.
 */

export interface Post {
  slug: string;
  date: string;
  category: string;
  cover: string;
  title: Localized;
  excerpt: Localized;
  body: Record<Locale, Block[]>;
  minutes: Record<Locale, number>;
}

export const POSTS_DIR = path.join(process.cwd(), 'site.config', 'posts');

/** Reading speed in words per minute; Arabic words are longer on average. */
const WPM: Record<Locale, number> = { ar: 180, en: 220 };

export class PostError extends Error {}

export const parsePost = (source: string, file: string): Post => {
  const problem = (message: string) => new PostError(`site.config/posts/${file}: ${message}`);
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match) throw problem('must start with a "---" block of fields and end it with "---"');
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const at = line.indexOf(':');
    if (at === -1) throw problem(`the line "${line.trim()}" needs "name: value"`);
    fields[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  const need = (key: string) => {
    if (!fields[key]) throw problem(`"${key}:" is missing or empty`);
    return fields[key];
  };
  const slug = need('slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw problem(`slug "${slug}" must be lowercase letters, digits and dashes`);
  if (`${slug}.md` !== file) throw problem(`the file name must match the slug: rename it to ${slug}.md`);
  const date = need('date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw problem(`date "${date}" must be written YYYY-MM-DD`);
  const category = need('category');
  if (!blogCategories.some((c) => c.id === category))
    throw problem(`category "${category}" must be one of ${blogCategories.map((c) => c.id).join(', ')} (see site.config/blog.ts)`);
  const cover = need('cover');
  if (!/^\/[^\s]+\.(webp|jpe?g|png|avif)$/i.test(cover)) throw problem(`cover "${cover}" must be a picture path under /public, starting with "/"`);

  const body = {} as Record<Locale, Block[]>;
  const minutes = {} as Record<Locale, number>;
  for (const lang of ['ar', 'en'] as const) {
    const section = new RegExp(`^:::${lang}\\s*\\n([\\s\\S]*?)\\n:::\\s*$`, 'm').exec(match[2]);
    if (!section || !section[1].trim()) throw problem(`needs a ":::${lang}" section with the ${lang === 'ar' ? 'Arabic' : 'English'} text, closed by ":::"`);
    body[lang] = parseMarkdown(section[1]);
    const words = plainText(body[lang]).split(/\s+/).filter(Boolean).length;
    minutes[lang] = Math.max(1, Math.round(words / WPM[lang]));
  }
  return {
    slug,
    date,
    category,
    cover,
    title: { ar: need('title.ar'), en: need('title.en') },
    excerpt: { ar: need('excerpt.ar'), en: need('excerpt.en') },
    body,
    minutes,
  };
};

let cache: Post[] | null = null;

/** Every post, newest first. */
export const getPosts = (): Post[] => {
  if (cache) return cache;
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  cache = files
    .map((file) => parsePost(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'), file))
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
};

export const getPost = (slug: string): Post | undefined => getPosts().find((p) => p.slug === slug);
