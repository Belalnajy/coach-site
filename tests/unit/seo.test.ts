import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coach, show } from '../../src/lib/config.ts';
import { faqJsonLd, offersJsonLd, siteJsonLd } from '../../src/lib/jsonld.ts';
import { rootMetadata, sampleHidden } from '../../src/lib/page-meta.ts';
import { dict } from '../../src/lib/i18n.ts';
import { NAV, TAB_KEYS, pageVisible } from '../../src/lib/nav.ts';

const types = (items: { '@type': string }[]) => items.map((i) => i['@type']);

test('a real coach\'s site is indexable', () => {
  assert.equal(coach.sample, false);
  assert.equal(sampleHidden(), false);
  for (const lang of ['ar', 'en'] as const) assert.equal(rootMetadata(lang).robots, undefined);
});

test('structured data holds only what the config has', () => {
  const data = siteJsonLd('en');
  // No gym in the config, so no SportsActivityLocation; the person carries the phone.
  assert.deepEqual(types(data), coach.location ? ['Person', 'SportsActivityLocation', 'WebSite'] : ['Person', 'WebSite']);
  const person = data[0] as Record<string, unknown>;
  assert.equal(person.telephone, `+${coach.whatsapp}`);
  for (const key of ['email', 'sameAs', 'hasCredential', 'worksFor']) assert.equal(key in person, key === 'email' ? Boolean(coach.email) : key === 'sameAs' ? show.socials : key === 'hasCredential' ? show.certifications : show.location, key);
  const offers = offersJsonLd('en');
  assert.equal(offers?.provider['@id'].endsWith(coach.location ? '#gym' : '#coach'), true);
});

test('sample content publishes no person, business, phone, address or prices as structured data', () => {
  for (const lang of ['ar', 'en'] as const) {
    assert.deepEqual(types(siteJsonLd(lang, true)), ['WebSite']);
    assert.equal(offersJsonLd(lang, true), null);
  }
});

test('the FAQ structured data matches the FAQ: none when it is empty', () => {
  const data = faqJsonLd('ar');
  if (show.faq) assert.ok(data && data.mainEntity.length > 0);
  else assert.equal(data, null);
});

test('hidden pages leave the menu and the tab bar', () => {
  for (const key of ['transformations', 'blog'] as const) {
    assert.equal(NAV.some((n) => n.key === key), pageVisible(key), key);
    if (!pageVisible(key)) assert.ok(!(TAB_KEYS as readonly string[]).includes(key));
  }
  assert.equal(TAB_KEYS.length, 4);
});

test('the coach title from the config fills the interface text', () => {
  assert.equal(dict('ar').nav.about, `عن ${coach.title.ar}`);
  assert.ok(!JSON.stringify(dict('ar')).includes('{title}'));
  assert.ok(!JSON.stringify(dict('en')).includes('{title}'));
});
