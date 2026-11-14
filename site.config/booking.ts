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
  // These are the visitor's preferences, not opening hours: the coach replies
  // with what is actually free.
  days: [6, 0, 1, 2, 3, 4, 5],
  slots: [
    { id: 'morning', label: { ar: 'صباحاً', en: 'Morning' } },
    { id: 'afternoon', label: { ar: 'ظهراً', en: 'Afternoon' } },
    { id: 'evening', label: { ar: 'مساءً', en: 'Evening' } },
  ],
  goals: [
    { id: 'fat-loss', label: { ar: 'خسارة الدهون', en: 'Fat loss' } },
    { id: 'muscle-gain', label: { ar: 'بناء العضلات', en: 'Muscle gain' } },
    { id: 'fitness', label: { ar: 'لياقة وصحة عامة', en: 'General fitness' } },
    { id: 'women', label: { ar: 'تدريب السيدات', en: 'Women’s training' } },
    { id: 'strength', label: { ar: 'القوة والأداء', en: 'Strength & performance' } },
  ],
};
