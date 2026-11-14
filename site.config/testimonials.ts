import type { TestimonialConfig } from './types.ts';

/**
 * REVIEWS.
 *
 * ⚠ SAMPLE REVIEWS. These people do not exist and the words are made up to
 * show the layout. Replace them with real reviews (with permission) and set
 * `sample: false` on each one. Publishing invented reviews as real is
 * misleading and, in many countries, illegal.
 */
export const testimonials: TestimonialConfig[] = [
  {
    id: 't1',
    name: { ar: 'مراجعة تجريبية – م.', en: 'Sample review – M.' },
    context: { ar: 'متابعة أونلاين · 6 أشهر', en: 'Online coaching · 6 months' },
    quote: {
      ar: 'أكثر ما فرق معي أن الخطة كانت تتغير كل أسبوع حسب أرقامي، وليست جدولاً ثابتاً من الإنترنت.',
      en: 'What made the difference was a plan that changed every week with my numbers, not a fixed sheet from the internet.',
    },
    rating: 5,
    sample: true,
  },
  {
    id: 't2',
    name: { ar: 'مراجعة تجريبية – ن.', en: 'Sample review – N.' },
    context: { ar: 'تدريب شخصي · 12 حصة', en: 'Personal training · 12 sessions' },
    quote: {
      ar: 'تعلمت أداء السكوات والديدلفت بشكل صحيح لأول مرة، ووجع الركبة اختفى.',
      en: 'I learned to squat and deadlift properly for the first time, and my knee pain went away.',
    },
    rating: 5,
    sample: true,
  },
  {
    id: 't3',
    name: { ar: 'مراجعة تجريبية – ك.', en: 'Sample review – K.' },
    context: { ar: 'برنامج 12 أسبوع', en: '12-week program' },
    quote: {
      ar: 'الرد على واتساب سريع جداً، وأي سؤال عن الأكل في المطاعم كان له حل.',
      en: 'Replies on WhatsApp were really quick, and every question about eating out had an answer.',
    },
    rating: 5,
    sample: true,
  },
  {
    id: 't4',
    name: { ar: 'مراجعة تجريبية – س.', en: 'Sample review – S.' },
    context: { ar: 'خطة تغذية فقط', en: 'Nutrition only' },
    quote: {
      ar: 'نزلت 6 كيلو بدون ما أحس إني في دايت. أكلت مع أسرتي كل يوم.',
      en: 'I lost 6 kilos without feeling like I was dieting. I ate with my family every day.',
    },
    rating: 4,
    sample: true,
  },
];
