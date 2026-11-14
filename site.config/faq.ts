import type { FaqConfig } from './types.ts';

/**
 * QUESTIONS AND ANSWERS on the home page (and in search results, as FAQ
 * structured data). Only answers the coach stands behind: nothing about
 * payment, refunds or schedules until he confirms them. Empty list = no FAQ.
 */
export const faq: FaqConfig[] = [
  {
    question: { ar: 'هل أحتاج اشتراك جيم للمتابعة الأونلاين؟', en: 'Do I need a gym membership for online coaching?' },
    answer: {
      ar: 'لا. نبني البرنامج على ما هو متاح لك: جيم كامل، أو دمبلز في البيت، أو وزن الجسم فقط.',
      en: 'No. The plan is built around what you have: a full gym, dumbbells at home, or just your bodyweight.',
    },
  },
  {
    question: { ar: 'هل سأتبع نظاماً غذائياً قاسياً؟', en: 'Will I be on a strict diet?' },
    answer: {
      ar: 'لا. نضبط كميات الأكل الذي تحبه، مع بدائل للمطاعم والمناسبات. الالتزام أهم من الكمال.',
      en: 'No. We adjust portions of food you like, with swaps for restaurants and events. Consistency beats perfection.',
    },
  },
];
