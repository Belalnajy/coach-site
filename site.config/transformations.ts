import type { Localized, TransformationConfig, TransformationView } from './types.ts';

/**
 * BEFORE / AFTER RESULTS.
 *
 * Consent: the coach asked each of these clients, and all of them agreed to
 * appear on the site (confirmed by the coach, 2026-11-14). Client names are
 * never published. Any new story needs the same consent first; that is the
 * coach's responsibility.
 *
 * The pictures come from the coach's own public posts, cropped and split by
 * scripts/client-photos.mjs (originals in assets-src/clients/). The numbers
 * and texts below come only from the coach's captions.
 *
 * Pictures: 4:5, before and after of one view at the same size, in
 * public/images/transformations/. While this list is empty the results page,
 * its menu entry and the home block are hidden.
 */

const angleName: Record<TransformationView['angle'], Localized> = {
  front: { ar: 'من الأمام', en: 'front' },
  side: { ar: 'من الجانب', en: 'side' },
  back: { ar: 'من الخلف', en: 'back' },
};

/** The picture pair for one view: /images/transformations/<id>-<angle>-before|after.webp */
const view = (id: string, angle: TransformationView['angle'], width: number): TransformationView => {
  const height = Math.round(width * 1.25);
  const alt = (when: Localized) => ({
    ar: `${when.ar}، ${angleName[angle].ar}: صورة عميل الكابتن`,
    en: `${when.en}, ${angleName[angle].en}: the coach's client`,
  });
  return {
    angle,
    before: { src: `/images/transformations/${id}-${angle}-before.webp`, width, height, alt: alt({ ar: 'قبل', en: 'Before' }) },
    after: { src: `/images/transformations/${id}-${angle}-after.webp`, width, height, alt: alt({ ar: 'بعد', en: 'After' }) },
  };
};

export const transformations: TransformationConfig[] = [
  {
    id: 'm05',
    goal: 'fat-loss',
    badges: ['posture', 'student'],
    title: { ar: 'من 118 إلى 98 كجم', en: '118 → 98 kg' },
    result: { ar: '−20 كجم', en: '−20 kg' },
    duration: { ar: '4 شهور ونص', en: '4.5 months' },
    caption: {
      ar: 'تحوّل في 4 شهور ونص: من 118 إلى 98 كيلو وسط زحمة مراجعات ومذاكرة الثانوية العامة، مع حل مشكلة تحدّب الظهر.',
      en: 'A 4.5-month transformation: from 118 to 98 kg in the middle of high-school final exam revision, with his hunched back fixed.',
    },
    views: [view('m05', 'front', 480), view('m05', 'side', 480), view('m05', 'back', 480)],
    featured: true,
    sample: false,
  },
  {
    id: 'm02',
    goal: 'fat-loss',
    title: { ar: 'من 80 إلى 72 كجم', en: '80 → 72 kg' },
    result: { ar: '−8 كجم', en: '−8 kg' },
    caption: { ar: 'يوم جديد وتحوّل جديد: من 80 إلى 72 كيلو.', en: 'New day, new transformation: from 80 to 72 kg.' },
    views: [view('m02', 'front', 436), view('m02', 'back', 640)],
    featured: true,
    sample: false,
  },
  {
    id: 'm10',
    goal: 'muscle-gain',
    badges: ['injury'],
    title: { ar: 'من 75 إلى 90 كجم', en: '75 → 90 kg' },
    result: { ar: '+15 كجم', en: '+15 kg' },
    caption: {
      ar: 'من 75 كيلو بإصابة قطع في الرباط الصليبي، إلى 90 كيلو تضخيم.',
      en: 'From 75 kg with a torn ACL to a 90 kg bulk.',
    },
    views: [view('m10', 'front', 480), view('m10', 'back', 480)],
    featured: true,
    sample: false,
  },
  {
    id: 'm01',
    goal: 'fat-loss',
    title: { ar: 'من 108 إلى 85 كجم', en: '108 → 85 kg' },
    result: { ar: '−23 كجم', en: '−23 kg' },
    caption: { ar: 'تحوّل جديد: من 108 إلى 85 كيلو.', en: 'New transformation: from 108 to 85 kg.' },
    views: [view('m01', 'front', 660)],
    sample: false,
  },
  {
    id: 'm03',
    goal: 'fat-loss',
    badges: ['posture'],
    title: { ar: 'من 100 إلى 80 كجم', en: '100 → 80 kg' },
    result: { ar: '−20 كجم', en: '−20 kg' },
    caption: {
      ar: 'نزلنا من 100 إلى 80 كيلو، وحللنا مشكلة تحدّب أو تقوّس الظهر.',
      en: 'Down from 100 to 80 kg, and the curved, hunched back fixed.',
    },
    views: [view('m03', 'side', 480)],
    sample: false,
  },
  {
    id: 'm08',
    goal: 'fat-loss',
    badges: ['online'],
    title: { ar: 'من 85 إلى 77 كجم', en: '85 → 77 kg' },
    result: { ar: '−8 كجم', en: '−8 kg' },
    detail: { ar: 'الدهون من 26% إلى 11%', en: 'body fat 26% → 11%' },
    caption: {
      ar: 'من دبي مع الحب: متابعة أونلاين من 85 إلى 77 كيلو، ونسبة الدهون من 26% إلى 11%.',
      en: 'From Dubai with love: online coaching from 85 to 77 kg, body fat from 26% to 11%.',
    },
    views: [view('m08', 'front', 480)],
    sample: false,
  },
  {
    id: 'm09',
    goal: 'fat-loss',
    title: { ar: 'من 88 إلى 74 كجم', en: '88 → 74 kg' },
    result: { ar: '−14 كجم', en: '−14 kg' },
    detail: { ar: 'من التضخيم إلى التنشيف', en: 'bulk → shredded' },
    duration: { ar: '75 يوم', en: '75 days' },
    caption: { ar: 'تحوّل في 75 يوم: من 88 كيلو (تضخيم) إلى 74 كيلو بتنشيف كامل.', en: '75-day transformation: from 88 kg (bulk) to 74 kg, shredded.' },
    views: [view('m09', 'front', 480)],
    sample: false,
  },
  {
    id: 'm04',
    goal: 'muscle-gain',
    title: { ar: 'من 62 إلى 77 كجم', en: '62 → 77 kg' },
    result: { ar: '+15 كجم', en: '+15 kg' },
    caption: { ar: 'نفس التيشيرت، شخص مختلف: من 62 إلى 77 كيلو.', en: 'Same T-shirt, different man: from 62 to 77 kg.' },
    views: [view('m04', 'front', 480)],
    sample: false,
  },
  {
    id: 'm07',
    goal: 'fat-loss',
    title: { ar: 'من 82 إلى 74 كجم', en: '82 → 74 kg' },
    result: { ar: '−8 كجم', en: '−8 kg' },
    duration: { ar: '4 شهور', en: '4 months' },
    caption: { ar: 'تحوّل في 4 شهور: من 82 إلى 74 كيلو.', en: 'A 4-month transformation: from 82 to 74 kg.' },
    views: [view('m07', 'front', 480), view('m07', 'side', 480)],
    sample: false,
  },
  {
    id: 'm06',
    goal: 'fat-loss',
    title: { ar: 'من 86 إلى 74 كجم', en: '86 → 74 kg' },
    result: { ar: '−12 كجم', en: '−12 kg' },
    caption: { ar: 'سنة جديدة وتحوّل جديد: من 86 إلى 74 كيلو.', en: 'New year, new transformation: from 86 to 74 kg.' },
    views: [view('m06', 'front', 480)],
    sample: false,
  },
  {
    id: 'm11',
    goal: 'fat-loss',
    title: { ar: 'من 91 إلى 79 كجم', en: '91 → 79 kg' },
    result: { ar: '−12 كجم', en: '−12 kg' },
    caption: { ar: 'تحوّل جديد: من 91 إلى 79 كيلو.', en: 'New transformation: from 91 to 79 kg.' },
    views: [view('m11', 'front', 480)],
    sample: false,
  },
];
