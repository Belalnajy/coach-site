/**
 * Smoke test: builds the site, starts it on a spare port, and checks that
 * every page answers 200 in both languages (plus sitemap, robots, manifest,
 * icons, share images), that unknown addresses answer 404 in the right
 * language, and that each page names its twin with hreflang.
 *
 *   npm run smoke            (build + check)
 *   npm run smoke -- --no-build   (check an existing build)
 */
import { spawn, execSync } from 'node:child_process';
import { ROUTE_PATHS } from './routes.mjs';

const PORT = Number(process.env.SMOKE_PORT || 4501);
const base = `http://127.0.0.1:${PORT}`;

if (!process.argv.includes('--no-build')) {
  console.log('Building…');
  execSync('npm run build', { stdio: 'inherit' });
}

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: 'ignore' });
const stop = () => server.kill('SIGTERM');
process.on('exit', stop);

const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(base);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('server did not start');
};

const failures = [];
const expect = async (path, status, check) => {
  const res = await fetch(base + path, { redirect: 'manual' });
  const body = res.headers.get('content-type')?.includes('text') ? await res.text() : '';
  if (res.status !== status) failures.push(`${path}: ${res.status} (expected ${status})`);
  else if (check) {
    const problem = check(body, res);
    if (problem) failures.push(`${path}: ${problem}`);
  }
  return res.status;
};

try {
  await wait();
  for (const path of ROUTE_PATHS) {
    const en = path === '/en' || path.startsWith('/en/');
    await expect(path, 200, (html) => {
      if (!html.includes(`<html lang="${en ? 'en' : 'ar'}" dir="${en ? 'ltr' : 'rtl'}"`)) return 'wrong lang/dir on <html>';
      if (!/hreflang="ar"/i.test(html) || !/hreflang="en"/i.test(html)) return 'missing hreflang alternates';
      if (!html.includes('og:image')) return 'missing share image';
      if ((html.match(/<h1[\s>]/g) || []).length !== 1) return 'expected exactly one <h1>';
      return null;
    });
  }
  for (const path of ['/sitemap.xml', '/robots.txt', '/manifest.webmanifest', '/icon', '/apple-icon', '/opengraph-image', '/en/opengraph-image', '/en/blog/protein-how-much/opengraph-image'])
    await expect(path.includes('opengraph') && !path.startsWith('/en') ? (await fetch(base + '/').then((r) => r.text())).match(/property="og:image" content="https?:\/\/[^/]+([^"?]+)/)?.[1] ?? path : path, 200);
  // Unknown addresses share one static 404 document (src/app/global-not-found.tsx)
  // that holds both languages; it is Arabic by default and switches to
  // English before the first paint under /en.
  const bilingual404 = (html) =>
    !html.includes('dir="rtl"') ? 'the 404 should default to Arabic, right-to-left'
    : !html.includes('هذه الصفحة') || !html.includes('This page went to the gym') ? 'the 404 should hold both languages'
    : !html.includes('/^\\/en(\\/|$)/') ? 'the 404 should switch to English under /en' : null;
  await expect('/this-page-does-not-exist', 404, bilingual404);
  await expect('/en/this-page-does-not-exist', 404, bilingual404);
  await expect('/blog/no-such-post', 404);
  await expect('/en/blog/no-such-post', 404);
} finally {
  stop();
}

if (failures.length) {
  console.error(`\nSmoke test failed:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`\nSmoke test passed: ${ROUTE_PATHS.length} pages (both languages) return 200 with the right lang/dir, hreflang, share image and one <h1>; metadata routes OK; unknown addresses return 404 in each language.`);
