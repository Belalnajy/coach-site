/**
 * Browser checks on a running server (default http://localhost:4500):
 * - no horizontal overflow at phone widths 320–430, in both languages;
 * - exactly one visible <h1> on every page.
 *
 *   npm run build && npx next start -p 4500
 *   node scripts/check-layout.mjs [base-url]
 *
 * Exits non-zero on any failure. CHROME_PATH picks the browser.
 */
import puppeteer from 'puppeteer-core';
import { ROUTE_PATHS } from './routes.mjs';

const base = process.argv[2] || 'http://localhost:4500';
const widths = [320, 360, 390, 414, 430];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/home/belal/.cache/puppeteer/manual/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
// Light mode is checked too (the hero becomes an inset card), and with
// reduced motion, which removes the reveal transforms that otherwise act as
// containing blocks.
const themes = ['dark', 'light'];
const failures = [];

for (const theme of themes) {
await page.evaluateOnNewDocument((m) => { try { localStorage.setItem('theme', m); } catch {} }, theme);
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: theme === 'light' ? 'reduce' : 'no-preference' }]);
for (const path of [...ROUTE_PATHS, '/no-such-page', '/en/no-such-page']) {
  for (const width of widths) {
    await page.setViewport({ width, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(base + path, { waitUntil: 'load' });
    const result = await page.evaluate(() => {
      const doc = document.documentElement;
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width <= 1 || el.closest('.sr-only')) return false;
          // Ignore content inside horizontal scrollers and clipped containers.
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (['auto', 'scroll', 'hidden', 'clip'].includes(s.overflowX)) return false;
          }
          return r.right > doc.clientWidth + 1 || r.left < -1;
        })
        .slice(0, 4)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}`);
      const h1 = [...document.querySelectorAll('h1')].filter((h) => h.offsetParent !== null || getComputedStyle(h).position === 'fixed').length;
      return { scroll: doc.scrollWidth, client: doc.clientWidth, wide, h1 };
    });
    if (result.scroll > result.client || result.wide.length)
      failures.push(`${path} @${width}px ${theme}: overflow (scrollWidth ${result.scroll} > ${result.client}) ${result.wide.join(', ')}`);
    if (width === 390 && result.h1 !== 1) failures.push(`${path}: ${result.h1} visible <h1> (expected 1)`);
  }
}
}
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Layout OK: ${ROUTE_PATHS.length + 2} pages (incl. the 404 in both languages) × ${widths.length} widths × ${themes.length} themes, no horizontal overflow, one <h1> each.`);
