import type { Locale } from '../../site.config/types.ts';
import { booking, coach, packages } from './config.ts';
import { formatPrice, intlLocale } from './format.ts';
import { dict } from './i18n.ts';

/**
 * Everything the booking form needs, prepared on the server in one
 * language. The form runs in the browser on every page (as a sheet), so it
 * gets this small object as props instead of importing the whole config,
 * both dictionaries and the validator.
 */
export const bookingData = (lang: Locale) => {
  const t = dict(lang);
  return {
    lang,
    numberLocale: intlLocale(lang),
    whatsapp: coach.whatsapp,
    coachName: coach.shortName[lang],
    packages: packages.map((p) => ({
      id: p.id,
      kind: p.kind,
      name: p.name[lang],
      price: formatPrice(lang, p.price),
      /** As written in the message: "1,200 EGP per month", or "price on request". */
      messagePrice: p.price === 'on-request' ? t.message.onRequest : `${formatPrice(lang, p.price)} ${p.per[lang]}`,
    })),
    days: booking.days.map((d) => ({ id: String(d), label: t.days[d] })),
    slots: booking.slots.map((s) => ({ id: s.id, label: s.label[lang] })),
    goals: booking.goals.map((g) => ({ id: g.id, label: g.label[lang] })),
    t: { book: t.book, message: t.message, online: t.common.online, inPerson: t.common.inPerson, close: t.nav.close },
  };
};

export type BookingData = ReturnType<typeof bookingData>;
