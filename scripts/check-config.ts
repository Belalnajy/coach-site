/**
 * Runs before every build (npm "prebuild"): checks site.config/ and the
 * pictures it names, and stops the build with a readable list of problems.
 */
import * as site from '../site.config/index.ts';
import { validateConfig } from '../src/lib/validate.ts';
import { checkFiles } from '../src/lib/validate-files.ts';
import { getPosts } from '../src/lib/posts.ts';
import fs from 'node:fs';
import path from 'node:path';

const errors = [...validateConfig(site), ...(await checkFiles(site))];
try {
  for (const post of getPosts())
    if (!fs.existsSync(path.join('public', post.cover))) errors.push(`site.config/posts/${post.slug}.md → cover: no file at public${post.cover}`);
} catch (error) {
  errors.push((error as Error).message);
}

if (errors.length) {
  console.error(`\nThe site config has ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n\n${errors.map((e) => `  • ${e}`).join('\n')}\n`);
  process.exit(1);
}
console.log(`site.config OK${site.coach.sample ? ' (still showing SAMPLE content: see README)' : ''}`);
