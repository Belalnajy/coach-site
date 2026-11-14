import * as site from '../../site.config/index.ts';
import type { CoachConfig, Locale } from '../../site.config/types.ts';
import { assertValidConfig } from './validate.ts';

/**
 * The site's public address. On Vercel it comes from the project's
 * production domain (VERCEL_PROJECT_PRODUCTION_URL, set by Vercel at build
 * time); SITE_URL overrides it (a custom domain, or a local build such as
 * http://localhost:4500); otherwise the config's fallback is used.
 */
export const resolveSiteUrl = (fallback: string, env: Record<string, string | undefined> = process.env): string => {
  const raw = env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : fallback);
  return raw.replace(/\/+$/, '');
};

const resolved = { ...site, coach: { ...site.coach, siteUrl: resolveSiteUrl(site.coach.siteUrl) } as CoachConfig };

/**
 * The validated site config. Importing this module checks site.config/
 * first, so a mistake there stops `next build` (and `next dev`) with a
 * readable list of problems instead of a broken page.
 */
assertValidConfig(resolved);

export const { coach, features, theme, booking, packages, transformations, testimonials, faq, blogCategories } = resolved;

export const goalLabel = (id: string, lang: Locale): string =>
  booking.goals.find((g) => g.id === id)?.label[lang] ?? id;

/**
 * What the site shows. Every optional part is driven from here, so a section
 * with no content disappears together with its menu entry, home block,
 * sitemap entry and structured data.
 */
export const show = {
  transformations: transformations.length > 0,
  testimonials: testimonials.length > 0,
  faq: faq.length > 0,
  blog: features.blog,
  stats: Object.values(coach.stats ?? {}).some((v) => typeof v === 'number'),
  story: (coach.story?.ar.length ?? 0) > 0,
  principles: (coach.principles?.length ?? 0) > 0,
  certifications: (coach.certifications?.length ?? 0) > 0,
  location: Boolean(coach.location),
  socials: Object.values(coach.socials ?? {}).some(Boolean),
  steps: (coach.promises?.steps?.length ?? 0) > 0,
  afterBooking: (coach.promises?.afterBooking?.length ?? 0) > 0,
  guarantee: Boolean(coach.promises?.guarantee),
  replyTime: Boolean(coach.promises?.replyTime),
};
