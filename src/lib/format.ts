import type { Locale, PackageConfig } from '../../site.config/types.ts';
import { coach } from './config.ts';
import { dict } from './i18n.ts';

/** Intl locale for numbers and dates, honouring the coach's choice of Arabic digits. */
export const intlLocale = (lang: Locale): string =>
  lang === 'ar' ? (coach.arabicDigits === 'arab' ? 'ar-EG' : 'ar-EG-u-nu-latn') : 'en-GB';

export const formatNumber = (lang: Locale, value: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(intlLocale(lang), options).format(value);

/** "1,200 EGP" / "1,200 ج.م", or "Price on request". */
export const formatPrice = (lang: Locale, price: PackageConfig['price']): string =>
  price === 'on-request' ? dict(lang).common.onRequest : `${formatNumber(lang, price)} ${coach.currency.label[lang]}`;

export const formatDate = (lang: Locale, iso: string): string =>
  new Intl.DateTimeFormat(intlLocale(lang), { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

/** Quotation marks per language: «…» in Arabic, “…” in English. */
export const quote = (text: string, lang: Locale): string => (lang === 'ar' ? `«${text}»` : `“${text}”`);
