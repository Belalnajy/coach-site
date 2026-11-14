import type { Locale } from '../../site.config/types.ts';
import { booking, coach, faq, packages } from './config.ts';
import { absolute } from './seo.ts';
import type { Post } from './posts.ts';

/**
 * Structured data (schema.org JSON-LD) so search engines understand who the
 * coach is, where they train, what they sell and what each page is.
 * Reviews are deliberately not marked up: self-published reviews are not
 * eligible for review snippets, and the template's samples are not real.
 */

const ids = {
  person: `${coach.siteUrl}/#coach`,
  business: `${coach.siteUrl}/#gym`,
  website: `${coach.siteUrl}/#website`,
};

const sameAs = Object.values(coach.socials ?? {}).filter(Boolean);

/**
 * While the site shows sample content (coach.sample), only the WebSite entry
 * is published: no person, phone number, gym, address or prices that do not
 * exist. `sample` is a parameter so tests can check both cases.
 */
export const siteJsonLd = (lang: Locale, sample = coach.sample) => {
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ids.website,
    name: coach.name[lang],
    url: absolute(lang, '/'),
    inLanguage: lang,
    ...(sample ? {} : { publisher: { '@id': ids.person } }),
  };
  if (sample) return [website];
  // Only fields the config actually has: nothing is filled in with guesses.
  const loc = coach.location;
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': ids.person,
    name: coach.name[lang],
    alternateName: coach.name[lang === 'ar' ? 'en' : 'ar'],
    jobTitle: coach.role[lang],
    description: coach.intro[lang],
    url: absolute(lang, '/'),
    image: `${coach.siteUrl}${coach.images.portrait.src}`,
    telephone: `+${coach.whatsapp}`,
    ...(coach.email ? { email: coach.email } : {}),
    knowsLanguage: ['ar', 'en'],
    ...(loc ? { worksFor: { '@id': ids.business } } : {}),
    ...(coach.certifications?.length
      ? {
          hasCredential: coach.certifications.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c.name[lang],
            recognizedBy: { '@type': 'Organization', name: c.issuer[lang] },
          })),
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  if (!loc) return [person, website];
  const address = {
    ...(loc.address ? { streetAddress: loc.address[lang] } : {}),
    ...(loc.city ? { addressLocality: loc.city[lang] } : {}),
    ...(loc.country ? { addressCountry: loc.country } : {}),
  };
  const priced = packages.filter((p) => p.price !== 'on-request').map((p) => p.price as number);
  const business = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': ids.business,
    name: loc.gym[lang],
    url: absolute(lang, '/'),
    image: `${coach.siteUrl}${coach.images.hero.src}`,
    telephone: `+${coach.whatsapp}`,
    ...(Object.keys(address).length ? { address: { '@type': 'PostalAddress', ...address } } : {}),
    ...(loc.geo ? { geo: { '@type': 'GeoCoordinates', latitude: loc.geo.lat, longitude: loc.geo.lng } } : {}),
    ...(loc.mapUrl ? { hasMap: loc.mapUrl } : {}),
    ...(loc.openingHours?.length ? { openingHours: loc.openingHours } : {}),
    ...(priced.length ? { priceRange: `${Math.min(...priced)}–${Math.max(...priced)} ${coach.currency.code}` } : {}),
    founder: { '@id': ids.person },
  };
  return [person, business, website];
};

/** Nothing when the FAQ is empty (an empty FAQPage is invalid structured data). */
export const faqJsonLd = (lang: Locale) =>
  faq.length === 0
    ? null
    : {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.question[lang],
          acceptedAnswer: { '@type': 'Answer', text: f.answer[lang] },
        })),
      };

/** The packages as offers; nothing while the prices are the template's samples. */
export const offersJsonLd = (lang: Locale, sample = coach.sample) => sample ? null : ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: coach.role[lang],
  provider: { '@id': coach.location ? ids.business : ids.person },
  ...(coach.location?.country ? { areaServed: coach.location.country } : {}),
  url: absolute(lang, '/programs'),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: coach.name[lang],
    itemListElement: packages.map((p) => ({
      '@type': 'Offer',
      name: p.name[lang],
      description: p.summary[lang],
      url: `${absolute(lang, '/book')}?package=${p.id}`,
      availability: 'https://schema.org/InStock',
      category: p.kind,
      ...(p.price === 'on-request'
        ? {}
        : { price: p.price, priceCurrency: coach.currency.code, priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: coach.currency.code, unitText: p.per[lang] } }),
    })),
  },
  serviceType: booking.goals.map((g) => g.label[lang]),
});

export const articleJsonLd = (lang: Locale, post: Post) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title[lang],
  description: post.excerpt[lang],
  image: `${coach.siteUrl}${post.cover}`,
  datePublished: post.date,
  dateModified: post.date,
  inLanguage: lang,
  mainEntityOfPage: absolute(lang, `/blog/${post.slug}`),
  author: coach.sample ? { '@type': 'Person', name: coach.name[lang] } : { '@id': ids.person, '@type': 'Person', name: coach.name[lang], url: absolute(lang, '/about') },
  ...(coach.sample ? {} : { publisher: { '@id': ids.person } }),
  timeRequired: `PT${post.minutes[lang]}M`,
});

export const breadcrumbJsonLd = (lang: Locale, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absolute(lang, item.path) })),
});
