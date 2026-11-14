/**
 * Number formatting that client components can use without the config:
 * the server works out the Intl locale (intlLocale in format.ts, which
 * honours the coach's choice of Arabic digits) and passes it down.
 */
export const formatNum = (locale: string, value: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(value);
