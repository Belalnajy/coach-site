import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coach } from '../../src/lib/config.ts';
import { faqJsonLd, offersJsonLd, siteJsonLd } from '../../src/lib/jsonld.ts';
import { rootMetadata, sampleHidden } from '../../src/lib/page-meta.ts';
import { dict } from '../../src/lib/i18n.ts';

const types = (items: { '@type': string }[]) => items.map((i) => i['@type']);

test('while the site shows sample content, search engines are kept out', () => {
  assert.equal(coach.sample, true);
  delete process.env.INDEX_SAMPLE;
  assert.equal(sampleHidden(), true);
  for (const lang of ['ar', 'en'] as const) assert.deepEqual(rootMetadata(lang).robots, { index: false, follow: false });
  // A public demo of the template can opt in explicitly.
  process.env.INDEX_SAMPLE = 'true';
  assert.equal(rootMetadata('en').robots, undefined);
  delete process.env.INDEX_SAMPLE;
});

test('sample content publishes no person, business, phone, address or prices as structured data', () => {
  for (const lang of ['ar', 'en'] as const) {
    const data = siteJsonLd(lang);
    assert.deepEqual(types(data), ['WebSite']);
    const text = JSON.stringify(data);
    assert.ok(!text.includes(coach.whatsapp), 'no phone number');
    assert.ok(!text.includes(coach.location.address[lang]), 'no address');
    assert.equal(offersJsonLd(lang), null, 'no offer catalogue');
  }
});

test('a real coach gets the full structured data', () => {
  const data = siteJsonLd('en', false);
  assert.deepEqual(types(data), ['Person', 'SportsActivityLocation', 'WebSite']);
  const offers = offersJsonLd('en', false);
  assert.equal(offers?.['@type'], 'Service');
});

test('the FAQ structured data lists every question', () => {
  const data = faqJsonLd('ar');
  assert.ok(data && data.mainEntity.length > 0);
});

test('the coach title from the config fills the interface text', () => {
  assert.equal(dict('ar').nav.about, `عن ${coach.title.ar}`);
  assert.ok(!JSON.stringify(dict('ar')).includes('{title}'));
  assert.ok(!JSON.stringify(dict('en')).includes('{title}'));
});
