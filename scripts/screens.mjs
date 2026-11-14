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
    await page.click('nav.fixed a[href*="book"]');
    await new Promise((r) => setTimeout(r, 1500));
    // Fill a little so the preview shows a real message.
    const name = await page.$('dialog[open] input[name="name"]');
    if (name) {
      await page.click('dialog[open] label:has(input[value="online-monthly"])');
      await name.type(path.startsWith('/en') ? 'Sarah' : 'سارة');
      await page.click('dialog[open] summary');
      await page.evaluate(() => document.querySelector('dialog[open] summary').scrollIntoView({ block: 'center' }));
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  if (/^y\d+$/.test(action)) {
    await page.evaluate((y) => window.scrollTo(0, y), Number(action.slice(1)));
    await new Promise((r) => setTimeout(r, 600));
  }
  if (action === 'menu') {
    await page.click('button[aria-haspopup="dialog"]');
    await new Promise((r) => setTimeout(r, 600));
  }
  if (full === 'full' && phone) {
    // Phones: screen-by-screen captures stitched side by side (a full-page
    // capture resizes the viewport, which distorts svh-based layouts).
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = 844 - 120;
    const shots = [];
    for (let y = 0; y < total - 200 && shots.length < 16; y += step) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise((r) => setTimeout(r, 250));
      shots.push(await page.screenshot({ captureBeyondViewport: false }));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const sharp = (await import('sharp')).default;
    for (let s = 0; s * 4 < shots.length; s++) {
      const group = shots.slice(s * 4, s * 4 + 4);
      await sharp({ create: { width: group.length * (780 + 16), height: 1688, channels: 3, background: '#ff00ff' } })
        .composite(group.map((input, i) => ({ input, left: i * 796, top: 0 })))
        .png()
        .toFile(`.screens/${name}-${s}.png`);
      console.log(`.screens/${name}-${s}.png`);
    }
    await page.close();
    continue;
  }
  if (full === 'full') {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 400));
  } else await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `.screens/${name}.png`, fullPage: full === 'full' });
  console.log(`.screens/${name}.png`);
  await page.close();
  console.log(`.screens/${name}.png`);
}
await browser.close();
