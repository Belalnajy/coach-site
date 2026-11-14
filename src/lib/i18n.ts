import type { Locale, Localized } from '../../site.config/types.ts';
import { ar } from '../locales/ar.ts';
import { en } from '../locales/en.ts';

export type { Locale };
export const LOCALES: Locale[] = ['ar', 'en'];
export const DEFAULT_LOCALE: Locale = 'ar';

const DICTS = { ar, en };
export const dict = (lang: Locale) => DICTS[lang];

/** "Hi {coach}" + { coach: "Adam" } → "Hi Adam". Unknown keys are left as they are. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** Picks one language out of a { ar, en } pair. */
export const pick = (value: Localized, lang: Locale): string => value[lang];

export const otherLocale = (lang: Locale): Locale => (lang === 'ar' ? 'en' : 'ar');
