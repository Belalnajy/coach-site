/**
 * Browser checks of the interactive parts, on a running server:
 *   node scripts/check-interactions.mjs [base-url]
 * - the booking sheet opens from the tab bar, validates the name, and sends
 *   a wa.me link whose decoded text carries every choice, in both languages;
 * - Escape closes the sheet;
 * - the before/after slider moves with the keyboard (mirrored in Arabic) and
 *   with a horizontal drag;
 * - calculator tabs switch with the arrow keys and update the URL hash.
 */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:4500';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/home/belal/.cache/puppeteer/manual/chrome', args: ['--no-sandbox'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const phone = async (path) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => {
    window.__opened = [];
    // A stand-in window, so the page does not fall back to navigating away.
    window.open = (url) => (window.__opened.push(url), {});
  });
  await page.goto(base + path, { waitUntil: 'load' });
  await sleep(500);
  return page;
};

for (const [lang, path, name, expectLines] of [
  ['ar', '/', 'سارة', ['مرحباً كابتن آدم،', '*الاسم:* سارة', '*الباقة:* متابعة أونلاين شهرية (1,200 ج.م شهرياً)', '*اليوم المفضل:* الأحد', '*الهدف:* خسارة الدهون']],
  ['en', '/en', 'Sarah', ['Hi Adam,', '*Name:* Sarah', '*Program:* Monthly online coaching (1,200 EGP per month)', '*Preferred day:* Sunday', '*Goal:* Fat loss']],
]) {
  const page = await phone(path);
  await page.click('nav.fixed a[href*="book"]');
  await page.waitForSelector('dialog[open] form', { timeout: 5000 });
  await sleep(400);
  // Submitting without a name is refused with a message and focus on the field.
  await page.click('dialog[open] button[type="submit"]');
  await sleep(100);
  assert.ok(await page.$('dialog[open] [role="alert"]'), `${lang}: missing-name error shown`);
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('name')), 'name', `${lang}: focus moved to name`);
  await page.click('dialog[open] label:has(input[value="online-monthly"])');
  await page.click('dialog[open] label:has(input[value="0"])');
  await page.click('dialog[open] label:has(input[value="fat-loss"])');
  await page.type('dialog[open] input[name="name"]', name);
  await page.click('dialog[open] button[type="submit"]');
  await sleep(200);
  const [url] = await page.evaluate(() => window.__opened);
  assert.ok(url?.startsWith('https://wa.me/201000000000?text='), `${lang}: opens wa.me (${url})`);
  const text = new URL(url).searchParams.get('text');
  for (const line of expectLines) assert.ok(text.includes(line), `${lang}: message has "${line}"\n${text}`);
  await page.keyboard.press('Escape');
  await sleep(500);
  assert.equal(await page.$('dialog[open]'), null, `${lang}: Escape closes the sheet`);
  console.log(`✓ ${lang}: booking sheet → WhatsApp message`);
  await page.close();
}

for (const [lang, path, forward] of [['en', '/en/transformations', 'ArrowRight'], ['ar', '/transformations', 'ArrowLeft']]) {
  const page = await phone(path);
  const slider = await page.$('[role="slider"]');
  await slider.focus();
  await page.keyboard.press(forward);
  await page.keyboard.press(forward);
  assert.equal(await slider.evaluate((el) => el.getAttribute('aria-valuenow')), '60', `${lang}: arrow key toward the end increases`);
  await page.keyboard.press('Home');
  assert.equal(await slider.evaluate((el) => el.getAttribute('aria-valuenow')), '0', `${lang}: Home goes to 0`);
  // Drag horizontally across the picture.
  await page.$eval('.ba-before', (el) => el.parentElement.scrollIntoView({ block: 'center' }));
  await sleep(300);
  const r = await (await page.$('.ba-before')).evaluate((el) => {
    const b = el.parentElement.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  });
  const y = r.y + r.h / 2;
  await page.mouse.move(r.x + r.w * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(r.x + r.w * 0.6, y, { steps: 4 });
  await page.mouse.move(r.x + r.w * 0.8, y, { steps: 4 });
  await page.mouse.up();
  const value = Number(await slider.evaluate((el) => el.getAttribute('aria-valuenow')));
  const expected = lang === 'ar' ? 20 : 80;
  assert.ok(Math.abs(value - expected) <= 3, `${lang}: drag to 80% of the width → ${expected} (got ${value})`);
  console.log(`✓ ${lang}: before/after slider (keyboard + drag)`);
  await page.close();
}

{
  const page = await phone('/en/calculators#bmi');
  assert.equal(await page.$eval('[role="tab"][aria-selected="true"]', (el) => el.id), 'tab-bmi', 'hash opens the BMI tab');
  await page.focus('#tab-bmi');
  await page.keyboard.press('ArrowRight');
  await sleep(100);
  assert.equal(await page.$eval('[role="tab"][aria-selected="true"]', (el) => el.id), 'tab-bodyfat');
  assert.equal(await page.evaluate(() => location.hash), '#bodyfat');
  await page.focus('#tab-bodyfat');
  await page.keyboard.press('Home');
  await sleep(100);
  const result = await page.$eval('#result-title + p + p', (el) => el.textContent);
  assert.match(result, /^[\d,]+ kcal \/ a day$/, 'calorie result announced once, with its unit');
  console.log(`✓ calculators: tabs by keyboard, hash, live result (${result.trim()})`);
  await page.close();
}

await browser.close();
console.log('Interactions OK');
