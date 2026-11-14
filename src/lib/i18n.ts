import type { Locale, Localized } from '../../site.config/types.ts';
import { ar } from '../locales/ar.ts';
import { en } from '../locales/en.ts';
import { coach } from '../../site.config/coach.ts';

export type { Locale };
export const LOCALES: Locale[] = ['ar', 'en'];
export const DEFAULT_LOCALE: Locale = 'ar';

/** Fills `{title}` (how the interface names the coach, from site.config/coach.ts) everywhere. */
const withTitle = <T,>(value: T, title: string): T => {
  if (typeof value === 'string') return value.replaceAll('{title}', title) as T;
  if (Array.isArray(value)) return value.map((v) => withTitle(v, title)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withTitle(v, title)])) as T;
  return value;
};

const DICTS = { ar: withTitle(ar, coach.title.ar), en: withTitle(en, coach.title.en) };
/** The interface text for one language. Server code only: client components get what they need as props. */
export const dict = (lang: Locale) => DICTS[lang];

// Kept in its own module so client code can use it without the dictionaries.
export { fill } from './fill.ts';

/** Picks one language out of a { ar, en } pair. */
export const pick = (value: Localized, lang: Locale): string => value[lang];

export const otherLocale = (lang: Locale): Locale => (lang === 'ar' ? 'en' : 'ar');
