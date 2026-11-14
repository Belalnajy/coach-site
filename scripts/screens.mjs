/**
 * Screenshots for design review: node scripts/screens.mjs <base-url> <name:path[:mode[:width[:full]]]>...
 * mode: dark|light (default dark); width: 390 (phone, touch) or e.g. 1440.
 * Saves to .screens/<name>.png
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const [base, ...shots] = process.argv.slice(2);
fs.mkdirSync('.screens', { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/home/belal/.cache/puppeteer/manual/chrome', args: ['--no-sandbox'] });
for (const spec of shots) {
  const [name, path, mode = 'dark', width = '390', full = 'full', action = ''] = spec.split(':');
  const w = Number(width);
  const phone = w < 800;
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: w, height: phone ? 844 : 900, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  await page.evaluateOnNewDocument((m) => localStorage.setItem('theme', m), mode);
  await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')));
  if (action === 'book') {
    await page.click('nav[aria-label] a[href*="book"]').catch(() => {});
    await new Promise((r) => setTimeout(r, 900));
  }
  if (action === 'menu') {
    await page.click('button[aria-haspopup="dialog"]');
    await new Promise((r) => setTimeout(r, 600));
  }
  if (full === 'full') {
    // Load lazy images before a full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 400));
  } else await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `.screens/${name}.png`, fullPage: full === 'full' });
  await page.close();
  console.log(`.screens/${name}.png`);
}
await browser.close();
