import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as site from '../../site.config/index.ts';
import { ConfigError, assertValidConfig, validateConfig, type SiteConfig } from '../../src/lib/validate.ts';
import { checkFiles } from '../../src/lib/validate-files.ts';
import { getPosts, parsePost } from '../../src/lib/posts.ts';
import { ar } from '../../src/locales/ar.ts';
import { en } from '../../src/locales/en.ts';

const clone = (): SiteConfig => structuredClone({ ...site }) as SiteConfig;

test('the shipped sample config is valid', () => {
  assert.deepEqual(validateConfig(site), []);
  assert.doesNotThrow(() => assertValidConfig(site));
});

test('the sample config says it is sample, everywhere it matters', () => {
  assert.equal(site.coach.sample, true);
  assert.ok(site.transformations.every((t) => t.sample), 'every shipped story is flagged as sample');
  assert.ok(site.testimonials.every((t) => t.sample), 'every shipped review is flagged as sample');
  assert.ok(site.testimonials.every((t) => /sample/i.test(t.name.en) && /تجريبي/.test(t.name.ar)));
  assert.ok(site.transformations.every((t) => /sample/i.test(t.client.en) && /تجريبي/.test(t.client.ar)));
});

test('pictures referenced by the config exist, at the size the config says', async () => {
  assert.deepEqual(await checkFiles(site), []);
});

test('a broken config fails with messages that name the file and the field', () => {
  const bad = clone();
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

test('a real coach cannot ship the sample stories and reviews', () => {
  const live = clone();
  live.coach.sample = false;
  const errors = validateConfig(live);
  assert.ok(errors.some((e) => e.startsWith('site.config/transformations.ts → transformations[0].sample')));
  assert.ok(errors.some((e) => e.startsWith('site.config/testimonials.ts → testimonials[0].sample')));
});

test('only one popular package per kind, and a bad colour is reported', () => {
  const bad = clone();
  bad.packages.forEach((p) => (p.popular = true));
  bad.theme.accent = 'lime';
  const errors = validateConfig(bad);
  assert.ok(errors.some((e) => e.includes('only one "online" package can be marked popular')));
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
  assert.match(ar, new RegExp(`\\b${loader(site.theme.fonts.arabic)}\\(`), `fonts-ar.ts loads ${site.theme.fonts.arabic}`);
  assert.match(en, new RegExp(`\\b${loader(site.theme.fonts.latin)}\\(`), `fonts-en.ts loads ${site.theme.fonts.latin}`);
  for (const file of [ar, en]) assert.match(file, new RegExp(`\\b${loader(site.theme.fonts.display)}\\(`), `both trees load ${site.theme.fonts.display}`);
});
