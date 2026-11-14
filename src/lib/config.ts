import * as site from '../../site.config/index.ts';
import type { Locale } from '../../site.config/types.ts';
import { assertValidConfig } from './validate.ts';

/**
 * The validated site config. Importing this module checks site.config/
 * first, so a mistake there stops `next build` (and `next dev`) with a
 * readable list of problems instead of a broken page.
 */
assertValidConfig(site);

export const { coach, theme, booking, packages, transformations, testimonials, faq, blogCategories } = site;

export const goalLabel = (id: string, lang: Locale): string =>
  booking.goals.find((g) => g.id === id)?.label[lang] ?? id;
