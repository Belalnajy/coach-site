/** Every page of the site in both languages, for the smoke and layout checks. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const slugs = fs
  .readdirSync(path.join(ROOT, 'site.config', 'posts'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

const BASE = ['/', '/transformations', '/programs', '/calculators', '/blog', '/about', '/book', ...slugs.map((s) => `/blog/${s}`)];

export const ROUTE_PATHS = BASE.flatMap((p) => [p, p === '/' ? '/en' : `/en${p}`]);
