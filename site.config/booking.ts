import type { BookingConfig } from './types.ts';

/**
 * WHAT THE BOOKING FORM OFFERS.
 *
 * The visitor picks a package, a day, a time slot and a goal, types a name,
 * and WhatsApp opens with the message ready to send. Nothing is stored.
 *
 * `goals` are shared: the same list feeds the booking form, the filters on
 * the transformations page and the calculators' "book" button.
 */
export const booking: BookingConfig = {
  // 0 = Sunday … 6 = Saturday, in the order shown (here Saturday first).
  days: [6, 0, 1, 2, 3, 4],
  slots: [
    { id: 'morning', label: { ar: 'صباحاً (7 – 11)', en: 'Morning (7 – 11 am)' } },
    { id: 'afternoon', label: { ar: 'ظهراً (12 – 4)', en: 'Afternoon (12 – 4 pm)' } },
    { id: 'evening', label: { ar: 'مساءً (5 – 10)', en: 'Evening (5 – 10 pm)' } },
  ],
  goals: [
    { id: 'fat-loss', label: { ar: 'خسارة الدهون', en: 'Fat loss' } },
    { id: 'muscle-gain', label: { ar: 'بناء العضلات', en: 'Muscle gain' } },
    { id: 'fitness', label: { ar: 'لياقة وصحة عامة', en: 'General fitness' } },
    { id: 'women', label: { ar: 'تدريب السيدات', en: 'Women’s training' } },
    { id: 'strength', label: { ar: 'القوة والأداء', en: 'Strength & performance' } },
  ],
};
