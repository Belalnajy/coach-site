import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as site from '../../site.config/index.ts';
import { ConfigError, assertValidConfig, samplePlaceholders, validateConfig, type SiteConfig } from '../../src/lib/validate.ts';
import { resolveSiteUrl } from '../../src/lib/config.ts';
import type { TransformationConfig } from '../../site.config/types.ts';
import { checkFiles } from '../../src/lib/validate-files.ts';
import { getPosts, parsePost } from '../../src/lib/posts.ts';
import { ar } from '../../src/locales/ar.ts';
import { en } from '../../src/locales/en.ts';

const clone = (): SiteConfig => structuredClone({ ...site }) as SiteConfig;

const story = (over: Partial<TransformationConfig> = {}): TransformationConfig => ({
  id: 'test-01',
  goal: 'fat-loss',
  client: { ar: 'عميل', en: 'Client' },
  duration: { ar: '12 أسبوع', en: '12 weeks' },
  result: { ar: '−9 كجم', en: '−9 kg' },
  quote: { ar: 'نص', en: 'Text' },
  before: { src: '/images/transformations/test-01-before.webp', width: 600, height: 750, alt: { ar: 'قبل', en: 'Before' } },
  after: { src: '/images/transformations/test-01-after.webp', width: 600, height: 750, alt: { ar: 'بعد', en: 'After' } },
  sample: false,
  ...over,
});

/** The template's made-up coach, as it ships on the `template` branch. */
const withTemplatePlaceholders = (): SiteConfig => {
  const c = clone();
  c.coach = {
    ...c.coach,
    sample: false,
    whatsapp: '201000000000',
    siteUrl: 'https://coach-adam.example.com',
    email: 'hello@coach-adam.example.com',
    name: { ar: 'الكابتن آدم', en: 'Coach Adam' },
    certifications: [{ name: { ar: 'مدرب معتمد (عيّنة)', en: 'Certified Personal Trainer (sample)' }, issuer: { ar: 'جهة', en: 'Body' }, year: 2017 }],
    location: { gym: { ar: 'آيرون يارد جيم (عيّنة)', en: 'Iron Yard Gym (sample)' } },
    socials: { instagram: 'https://instagram.com/' },
    images: { ...c.coach.images, hero: { ...c.coach.images.hero, src: '/images/coach/hero.webp' } },
  };
  c.transformations = [story({ sample: true, before: { ...story().before, src: '/images/transformations/sample-01-before.webp' } })];
  c.testimonials = [{ id: 't1', name: { ar: 'مراجعة', en: 'Review' }, context: { ar: 'سياق', en: 'Context' }, quote: { ar: 'نص', en: 'Text' }, rating: 5, sample: true }];
  return c;
};

test('the shipped config is valid, and is a real coach (not the template sample)', () => {
  assert.deepEqual(validateConfig(site), []);
  assert.doesNotThrow(() => assertValidConfig(site));
  assert.equal(site.coach.sample, false);
  assert.deepEqual(samplePlaceholders(site), [], 'no template placeholder is left');
});

test('pictures referenced by the config exist, at the size the config says', async () => {
  assert.deepEqual(await checkFiles(site), []);
});

test('optional sections can be empty or missing: a coach can launch with partial content', () => {
  const minimal = clone();
  for (const key of ['story', 'principles', 'stats', 'certifications', 'location', 'socials', 'promises', 'email'] as const) delete minimal.coach[key];
  delete minimal.coach.images.map;
  minimal.transformations = [];
  minimal.testimonials = [];
  minimal.faq = [];
  minimal.features = { blog: false };
  assert.deepEqual(validateConfig(minimal), []);
});

test('what is filled in must still be complete and sensible', () => {
  const bad = clone();
  bad.coach.location = { gym: { ar: '', en: 'Gym' }, mapUrl: 'http://maps' };
  bad.coach.stats = { clients: -1 };
  bad.coach.story = { ar: ['قصة'], en: [] };
  bad.coach.promises = { afterBooking: [{ ar: 'رد سريع', en: '' }] };
  const errors = validateConfig(bad);
  const has = (needle: string) => assert.ok(errors.some((e) => e.includes(needle)), `expected an error mentioning ${needle}\n${errors.join('\n')}`);
  has('coach.ts → location.gym.ar: must be non-empty text');
  has('coach.ts → location.mapUrl: must be an https link');
  has('coach.ts → stats.clients: must be a whole number');
  has('coach.ts → story: needs the same number of paragraphs in ar and en');
  has('coach.ts → promises.afterBooking[0].en: must be non-empty text');
});

test('a broken config fails with messages that name the file and the field', () => {
  const bad = withTemplatePlaceholders();
  bad.coach.whatsapp = '+20 100 000';
  bad.packages[1].price = -5;
  bad.packages[2].id = bad.packages[0].id;
  bad.transformations[0].goal = 'flying';
  bad.testimonials[0].rating = 7;
  bad.theme.dark.muted = '#2a2e34';
  bad.coach.name.en = '';
  const errors = validateConfig(bad);
  const has = (needle: string) => assert.ok(errors.some((e) => e.includes(needle)), `expected an error mentioning ${needle}\n${errors.join('\n')}`);
  has('site.config/coach.ts → whatsapp: must be the international number in digits only');
  has('site.config/packages.ts → packages[1].price: must be a positive number or "on-request" (found -5)');
  has('site.config/packages.ts → packages[2].id: is used twice');
  has('site.config/transformations.ts → transformations[0].goal: must be one of the goals in booking.ts');
  has('site.config/testimonials.ts → testimonials[0].rating');
  has('site.config/theme.ts → dark.muted on dark.bg: is too hard to read');
  has('site.config/coach.ts → name.en: must be non-empty text');
  assert.throws(() => assertValidConfig(bad), (e: unknown) => e instanceof ConfigError && /problems:/.test(e.message));
});

test('a real coach cannot ship the template\'s sample stories, reviews or placeholder details', () => {
  const errors = validateConfig(withTemplatePlaceholders());
  const has = (prefix: string) => assert.ok(errors.some((e) => e.startsWith(prefix)), `expected an error starting with ${prefix}\n${errors.join('\n')}`);
  has('site.config/transformations.ts → transformations[0].sample');
  has('site.config/testimonials.ts → testimonials[0].sample');
  has('site.config/coach.ts → whatsapp: still holds the template');
  has('site.config/coach.ts → siteUrl: still holds the template');
  has('site.config/coach.ts → email: still holds the template');
  has('site.config/coach.ts → name: still holds the template');
  has('site.config/coach.ts → certifications[0].name: still holds the template');
  has('site.config/coach.ts → location.gym: still holds the template');
  has('site.config/coach.ts → socials.instagram: still holds the template');
  has('site.config/coach.ts → images.hero.src: still holds the template');
  has('site.config/transformations.ts → transformations[0].before.src: still holds the template');
});

test('the site address: Vercel production domain, SITE_URL override, config fallback', () => {
  assert.equal(resolveSiteUrl('http://localhost:3000', {}), 'http://localhost:3000');
  assert.equal(resolveSiteUrl('http://localhost:3000', { VERCEL_PROJECT_PRODUCTION_URL: 'coach-site.vercel.app' }), 'https://coach-site.vercel.app');
  assert.equal(resolveSiteUrl('http://localhost:3000', { VERCEL_PROJECT_PRODUCTION_URL: 'coach-site.vercel.app', SITE_URL: 'https://coachmohamed.com/' }), 'https://coachmohamed.com');
});

test('light palette: selections and error text are readable', () => {
  const bad = clone();
  bad.theme.light.selected = bad.theme.accent; // lime on a light page
  bad.theme.light.hotText = bad.theme.hot;
  const errors = validateConfig(bad);
  assert.ok(errors.some((e) => e.includes('light.selected against light.surface: is too hard to read')));
  assert.ok(errors.some((e) => e.includes('light.hotText on light.surface: is too hard to read')));
});

test('only one popular package on the whole site, and a bad colour is reported', () => {
  assert.ok(site.packages.filter((p) => p.popular).length <= 1, 'at most one package is marked popular');
  const bad = clone();
  bad.packages.forEach((p) => (p.popular = false));
  bad.packages[0].popular = true;
  bad.packages[3].popular = true;
  bad.theme.accent = 'lime';
  const errors = validateConfig(bad);
  assert.ok(errors.some((e) => e.includes('only one package on the site can be marked popular, 2 are')));
  assert.ok(errors.some((e) => e.includes('theme.ts → accent: must be a colour written as #rrggbb (found "lime")')));
});

test('every post parses, in both languages, with a reading time', () => {
  const posts = getPosts();
  assert.ok(posts.length >= 3);
  for (const post of posts) {
    assert.ok(post.body.ar.length > 0 && post.body.en.length > 0, post.slug);
    assert.ok(post.minutes.ar >= 1 && post.minutes.en >= 1, post.slug);
    assert.ok(fs.existsSync(path.join('public', post.cover)), `${post.slug} cover exists`);
  }
  const dates = posts.map((p) => p.date);
  assert.deepEqual(dates, [...dates].sort().reverse(), 'newest first');
});

test('a broken post names the file and the problem', () => {
  const source = fs.readFileSync('site.config/posts/protein-how-much.md', 'utf8');
  assert.throws(() => parsePost(source.replace('category: nutrition', 'category: cooking'), 'protein-how-much.md'), /protein-how-much\.md: category "cooking" must be one of/);
  assert.throws(() => parsePost(source.replace(':::en', ':::fr'), 'protein-how-much.md'), /needs a ":::en" section/);
  assert.throws(() => parsePost(source, 'other-name.md'), /file name must match the slug/);
});

const shape = (value: unknown): unknown =>
  Array.isArray(value) ? value.length && typeof value[0] === 'object' ? value.map(shape) : 'list' : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)])) : typeof value;

test('Arabic and English interface texts have the same keys', () => {
  assert.deepEqual(shape(en), shape(ar));
  assert.equal(ar.days.length, 7);
  assert.equal(en.days.length, 7);
});

test('the font names in theme.ts match the fonts actually loaded', () => {
  const loader = (name: string) => name.replace(/ /g, '_'); // next/font/google export names
  const ar = fs.readFileSync('src/lib/fonts-ar.ts', 'utf8');
  const en = fs.readFileSync('src/lib/fonts-en.ts', 'utf8');
  // The Arabic face is self-hosted (src/app/(ar)/cairo.css), and its files must exist.
  const arCss = fs.readFileSync('src/app/(ar)/cairo.css', 'utf8');
  assert.match(arCss, new RegExp(`font-family: '?${site.theme.fonts.arabic}'?;`), `cairo.css declares ${site.theme.fonts.arabic}`);
  for (const [, file] of arCss.matchAll(/url\('(\/fonts\/[^']+)'\)/g)) assert.ok(fs.existsSync(path.join('public', file)), `public${file} exists`);
  assert.match(en, new RegExp(`\\b${loader(site.theme.fonts.latin)}\\(`), `fonts-en.ts loads ${site.theme.fonts.latin}`);
  for (const file of [ar, en]) assert.match(file, new RegExp(`\\b${loader(site.theme.fonts.display)}\\(`), `both trees load ${site.theme.fonts.display}`);
});
