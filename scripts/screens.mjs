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
  await page.setViewport({ width: w, height: phone ? (w === 360 ? 780 : 844) : 900, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  await page.evaluateOnNewDocument((m) => localStorage.setItem('theme', m), mode);
  await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')));
  if (/^angle\d$/.test(action)) {
    // Switch every multi-angle card to its n-th view (cards without one keep theirs).
    const n = Number(action.slice(5)) - 1;
    await page.$$eval('article [role="group"]', (groups, i) => groups.forEach((g) => g.querySelectorAll('button')[i]?.click()), n);
    await new Promise((r) => setTimeout(r, 800));
  }
  if (action === 'drag') {
    // A before/after slider caught mid-drag (pointer still down).
    await page.$eval('[role="slider"]', (el) => el.closest('article').scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 500));
    const box = await page.$eval('.ba-before', (el) => {
      const r = el.parentElement.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const y = box.y + box.h * 0.6;
    await page.mouse.move(box.x + box.w * 0.5, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.w * 0.62, y, { steps: 4 });
    await page.mouse.move(box.x + box.w * 0.7, y, { steps: 4 });
    await new Promise((r) => setTimeout(r, 200));
  }
  if (/^#/.test(action)) {
    await page.$eval(action, (el) => el.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -70));
    await new Promise((r) => setTimeout(r, 600));
  }
  if (action === 'bookend') {
    // Open the sheet with a real tap, pick a few options, then scroll the
    // sheet to its end with the wheel: the Send footer must still be there.
    const tab = await (await page.$('nav.fixed a[href*="book"]')).boundingBox();
    await page.touchscreen.tap(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await new Promise((r) => setTimeout(r, 1500));
    for (const value of ['online-monthly', '0', 'evening', 'fat-loss']) await page.click(`dialog[open] label:has(input[value="${value}"])`);
    await page.type('dialog[open] input[name="name"]', path.startsWith('/en') ? 'Sarah' : 'سارة');
    const area = await (await page.$('dialog[open] [data-scroll-area]')).boundingBox();
    await page.mouse.move(area.x + area.width / 2, area.y + area.height / 2);
    for (let i = 0; i < 8; i++) await page.mouse.wheel({ deltaY: 400 });
    await new Promise((r) => setTimeout(r, 800));
  }
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
    const step = (w === 360 ? 780 : 844) - 120;
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
      await sharp({ create: { width: group.length * (w * 2 + 16), height: (w === 360 ? 780 : 844) * 2, channels: 3, background: '#ff00ff' } })
        .composite(group.map((input, i) => ({ input, left: i * (w * 2 + 16), top: 0 })))
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
