/** Every page of the site in both languages, for the smoke and layout checks. */
import fs from 'node:fs';
import path from 'node:path';
import { features } from '../site.config/features.ts';
import { transformations } from '../site.config/transformations.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const slugs = features.blog
  ? fs
      .readdirSync(path.join(ROOT, 'site.config', 'posts'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  : [];

const twin = (p) => [p, p === '/' ? '/en' : `/en${p}`];

// Pages that are switched off or have nothing to show yet must not exist.
export const HIDDEN_PATHS = [...(features.blog ? [] : ['/blog', '/blog/protein-how-much']), ...(transformations.length ? [] : ['/transformations'])].flatMap(twin);

const BASE = ['/', ...(transformations.length ? ['/transformations'] : []), '/programs', '/calculators', ...(features.blog ? ['/blog'] : []), '/about', '/book', ...slugs.map((s) => `/blog/${s}`)];

export const ROUTE_PATHS = BASE.flatMap(twin);
