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
import { coach } from '../site.config/coach.ts';

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
  ['ar', '/', 'سارة', [`مرحباً ${coach.shortName.ar}،`, '*الاسم:* سارة', '*الباقة:* متابعة أونلاين شهرية (1,200 ج.م شهرياً)', '*اليوم المفضل:* الأحد', '*الهدف:* خسارة الدهون']],
  ['en', '/en', 'Sarah', [`Hi ${coach.shortName.en},`, '*Name:* Sarah', '*Program:* Monthly online coaching (1,200 EGP per month)', '*Preferred day:* Sunday', '*Goal:* Fat loss']],
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
  assert.ok(url?.startsWith(`https://wa.me/${coach.whatsapp}?text=`), `${lang}: opens wa.me with the coach's number (${url})`);
  const text = new URL(url).searchParams.get('text');
  for (const line of expectLines) assert.ok(text.includes(line), `${lang}: message has "${line}"\n${text}`);
  await page.keyboard.press('Escape');
  await sleep(500);
  assert.equal(await page.$('dialog[open]'), null, `${lang}: Escape closes the sheet`);
  console.log(`✓ ${lang}: booking sheet → WhatsApp message`);
  await page.close();
}

// The sheet must scroll with real input, and Send must stay visible and
// tappable at every phone size (the bug the programmatic clicks above hid).
for (const [width, path] of [[360, '/'], [390, '/en'], [430, '/'], [390, '/programs']]) {
  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width === 360 ? 740 : 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.evaluateOnNewDocument((m) => {
      localStorage.setItem('theme', m);
      window.__opened = [];
      window.open = (url) => (window.__opened.push(url), {});
    }, theme);
    await page.goto(base + path, { waitUntil: 'load' });
    await sleep(500);
    const tab = await page.$('nav.fixed a[href*="book"]');
    const tb = await tab.boundingBox();
    await page.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2);
    await page.waitForSelector('dialog[open] [data-scroll-area]', { timeout: 5000 });
    await sleep(600);
    const inView = (sel) =>
      page.$eval(sel, (el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return r.top >= 0 && r.bottom <= innerHeight && (hit === el || el.contains(hit));
      });
    assert.ok(await inView('dialog[open] [data-send]'), `${width}px ${theme} ${path}: Send visible and on top when the sheet opens`);
    // Real touch drag inside the scroll area.
    const area = await (await page.$('dialog[open] [data-scroll-area]')).boundingBox();
    const x = area.x + area.width / 2;
    await page.touchscreen.touchStart(x, area.y + area.height - 40);
    for (let i = 1; i <= 10; i++) await page.touchscreen.touchMove(x, area.y + area.height - 40 - i * 40);
    await page.touchscreen.touchEnd();
    await sleep(700);
    const afterTouch = await page.$eval('dialog[open] [data-scroll-area]', (el) => el.scrollTop);
    assert.ok(afterTouch > 100, `${width}px ${theme} ${path}: touch scrolls the sheet (scrollTop ${afterTouch})`);
    // Wheel scrolling reaches the end of the form.
    await page.mouse.move(x, area.y + area.height / 2);
    for (let i = 0; i < 8; i++) await page.mouse.wheel({ deltaY: 500 });
    await sleep(500);
    const end = await page.$eval('dialog[open] [data-scroll-area]', (el) => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 4);
    assert.ok(end, `${width}px ${theme} ${path}: wheel scrolls to the end`);
    assert.ok(await inView('dialog[open] textarea'), `${width}px ${theme} ${path}: the last field is reachable`);
    // Type a name and tap Send with a real touch.
    await page.$eval('dialog[open] input[name="name"]', (el) => el.scrollIntoView({ block: 'center' }));
    await page.type('dialog[open] input[name="name"]', 'Sam');
    const send = await (await page.$('dialog[open] [data-send]')).boundingBox();
    await page.touchscreen.tap(send.x + send.width / 2, send.y + send.height / 2);
    await sleep(300);
    const [url] = await page.evaluate(() => window.__opened);
    assert.ok(url?.startsWith('https://wa.me/'), `${width}px ${theme} ${path}: tapping Send opens WhatsApp`);
    // The close button answers a mouse click on phones too.
    const close = await (await page.$('dialog[open] button[aria-label]')).boundingBox();
    await page.mouse.click(close.x + close.width / 2, close.y + close.height / 2);
    await sleep(500);
    assert.equal(await page.$('dialog[open]'), null, `${width}px ${theme} ${path}: the close button closes the sheet on click`);
    await page.close();
  }
}
console.log('✓ booking sheet: touch and wheel scroll, Send always visible and tappable, close by click (360/390/430, both themes, both languages)');

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
  // Stories with several views switch angle and keep the divider where it is.
  const angles = await page.$$('article [role="group"] button[aria-pressed]');
  if (angles.length > 1) {
    await angles[1].click();
    await sleep(300);
    const srcs = await page.$eval('article', (el) => [...el.querySelectorAll('img')].map((i) => i.getAttribute('src')).join(' '));
    assert.match(srcs, /-side-(before|after)/, `${lang}: the second angle shows the side view`);
    assert.equal(await slider.evaluate((el) => el.getAttribute('aria-valuenow')), String(value), `${lang}: the divider stays put`);
    console.log(`✓ ${lang}: angle buttons switch views`);
  }
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

  // Out-of-range typing is flagged, not silently ignored, and snaps on blur.
  const fields = await page.$$('input[type="number"]');
  let weight = null;
  for (const field of fields) if ((await field.evaluate((el) => document.querySelector(`label[for="${el.id}"]`)?.textContent)) === 'Weight') weight = field;
  assert.ok(weight, 'the weight field is labelled');
  await weight.click({ clickCount: 3 });
  await page.keyboard.type('500');
  assert.equal(await weight.evaluate((el) => el.getAttribute('aria-invalid')), 'true', 'out of range marks the field invalid');
  const describedBy = () => weight.evaluate((el) => document.getElementById(el.getAttribute('aria-describedby'))?.textContent ?? '');
  assert.match(await describedBy(), /Enter 35–250 kg/);
  await page.keyboard.press('Tab');
  await sleep(150);
  assert.equal(await weight.evaluate((el) => el.value), '250', 'snaps to the maximum on blur');
  assert.equal(await weight.evaluate((el) => el.hasAttribute('aria-invalid')), false);
  assert.match(await describedBy(), /Set to 250 kg/);
  console.log('✓ calculators: out-of-range input flagged, then clamped with a note');
  await page.close();
}

{
  // The language switch keeps the query and the hash.
  const page = await phone('/book?package=pt-12');
  await page.click('button[aria-haspopup="dialog"]');
  await sleep(500);
  const href = await page.$eval('dialog[open] a[hreflang="en"]', (el) => el.getAttribute('href'));
  assert.equal(href, '/en/book?package=pt-12');
  await page.goto(base + '/en/calculators#bmi', { waitUntil: 'load' });
  await sleep(400);
  await page.click('button[aria-haspopup="dialog"]');
  await sleep(500);
  assert.equal(await page.$eval('dialog[open] a[hreflang="ar"]', (el) => el.getAttribute('href')), '/calculators#bmi');
  console.log('✓ language switch keeps ?query and #hash');
  await page.close();
}

{
  // Home: one call to action on the first screen. The tab bar's Book is a
  // plain tab while the hero button shows, and rises once it scrolls away.
  const page = await phone('/en');
  const raised = () => page.$eval('nav.fixed a[href*="book"] > span', (el) => el.classList.contains('pulse-ring'));
  assert.equal(await raised(), false, 'calm while the hero CTA is visible');
  await page.evaluate(() => window.scrollTo(0, 1400));
  await sleep(600);
  assert.equal(await raised(), true, 'raised once the hero CTA is gone');
  await page.goto(base + '/en/programs', { waitUntil: 'load' });
  await sleep(500);
  assert.equal(await raised(), true, 'raised on pages without a hero CTA');
  console.log('✓ tab bar Book: calm under the hero button, raised elsewhere');
  await page.close();
}

await browser.close();
console.log('Interactions OK');
