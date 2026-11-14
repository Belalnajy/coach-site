import type { Picture, TransformationConfig } from './types.ts';

/**
 * BEFORE / AFTER RESULTS.
 *
 * ⚠ SAMPLE STORIES. These clients do not exist: the pictures are generated
 * artwork and the numbers and quotes are made up to show the layout. Replace
 * them with real clients' results ONLY with each client's written consent,
 * and set `sample: false` on each real story. Never publish a client's
 * photos without permission.
 *
 * Pictures: 1000 × 1250 px (4:5), WebP or JPG, before and after taken from
 * the same spot, distance and pose so the slider lines up. Put them in
 * public/images/transformations/.
 */

const pair = (id: string, alt: { ar: string; en: string }): { before: Picture; after: Picture } => ({
  before: {
    src: `/images/transformations/${id}-before.webp`,
    width: 1000,
    height: 1250,
    alt: { ar: `قبل: ${alt.ar}`, en: `Before: ${alt.en}` },
  },
  after: {
    src: `/images/transformations/${id}-after.webp`,
    width: 1000,
    height: 1250,
    alt: { ar: `بعد: ${alt.ar}`, en: `After: ${alt.en}` },
  },
});

export const transformations: TransformationConfig[] = [
  {
    id: 'sample-01',
    goal: 'fat-loss',
    client: { ar: 'عميل تجريبي 1', en: 'Sample client 1' },
    duration: { ar: '16 أسبوع', en: '16 weeks' },
    result: { ar: '−14 كجم', en: '−14 kg' },
    detail: { ar: 'الخصر −13 سم', en: 'waist −13 cm' },
    quote: {
      ar: 'أول مرة أكمل خطة لآخرها. الأكل كان من البيت، والمتابعة كل أحد خلتني ملتزم.',
      en: 'The first plan I ever finished. Food from home, and the Sunday check-in kept me honest.',
    },
    ...pair('sample-01', { ar: 'رسم لجسم بوزن زائد', en: 'artwork of a heavier build' }),
    featured: true,
    sample: true,
  },
  {
    id: 'sample-02',
    goal: 'fat-loss',
    tags: ['women'],
    client: { ar: 'عميلة تجريبية 2', en: 'Sample client 2' },
    duration: { ar: '12 أسبوع', en: '12 weeks' },
    result: { ar: '−7% دهون', en: '−7% body fat' },
    detail: { ar: '−8 كجم', en: '−8 kg' },
    quote: {
      ar: 'كنت خايفة من الأوزان. دلوقتي برفع ضعف اللي كنت متخيلاه، وهدومي القديمة رجعت تلبس.',
      en: 'I was scared of weights. Now I lift twice what I imagined, and my old clothes fit again.',
    },
    ...pair('sample-02', { ar: 'رسم لجسم سيدة قبل التدريب', en: 'artwork of a woman’s build before training' }),
    featured: true,
    sample: true,
  },
  {
    id: 'sample-03',
    goal: 'muscle-gain',
    client: { ar: 'عميل تجريبي 3', en: 'Sample client 3' },
    duration: { ar: '20 أسبوع', en: '20 weeks' },
    result: { ar: '+6 كجم عضل', en: '+6 kg lean' },
    detail: { ar: 'بنش +30 كجم', en: 'bench +30 kg' },
    quote: {
      ar: 'كنت بتمرن 3 سنين من غير نتيجة. البرنامج المتدرّج فرق في أول شهرين.',
      en: 'Three years of training with nothing to show. The progressive plan made a difference in two months.',
    },
    ...pair('sample-03', { ar: 'رسم لجسم نحيف', en: 'artwork of a slim build' }),
    featured: true,
    sample: true,
  },
  {
    id: 'sample-04',
    goal: 'fitness',
    tags: ['women'],
    client: { ar: 'عميلة تجريبية 4', en: 'Sample client 4' },
    duration: { ar: '10 أسابيع', en: '10 weeks' },
    result: { ar: '5 كم بدون توقف', en: '5 km non-stop' },
    detail: { ar: '−5 كجم', en: '−5 kg' },
    quote: {
      ar: 'بعد الولادة كنت محتاجة أبدأ بهدوء. التمارين كانت 30 دقيقة في البيت.',
      en: 'After my baby I needed a gentle start. The workouts were 30 minutes at home.',
    },
    ...pair('sample-04', { ar: 'رسم لجسم سيدة', en: 'artwork of a woman’s build' }),
    sample: true,
  },
  {
    id: 'sample-05',
    goal: 'strength',
    client: { ar: 'عميل تجريبي 5', en: 'Sample client 5' },
    duration: { ar: '24 أسبوع', en: '24 weeks' },
    result: { ar: 'ديدلفت 180 كجم', en: '180 kg deadlift' },
    detail: { ar: '+50 كجم', en: '+50 kg' },
    quote: {
      ar: 'الظهر كان بيوجعني من الشغل على المكتب. اليوم بشيل أكتر من ضعف وزني.',
      en: 'Desk work gave me back pain. Today I pull more than twice my bodyweight.',
    },
    ...pair('sample-05', { ar: 'رسم لجسم متوسط', en: 'artwork of an average build' }),
    sample: true,
  },
  {
    id: 'sample-06',
    goal: 'fat-loss',
    client: { ar: 'عميل تجريبي 6', en: 'Sample client 6' },
    duration: { ar: '12 أسبوع', en: '12 weeks' },
    result: { ar: '−9 كجم', en: '−9 kg' },
    detail: { ar: 'الخصر −9 سم', en: 'waist −9 cm' },
    quote: {
      ar: 'شغلي سفر كتير. الخطة كانت فيها بدائل للفنادق والمطاعم، فمكنش فيه عذر.',
      en: 'I travel a lot for work. The plan had hotel and restaurant swaps, so there was no excuse.',
    },
    ...pair('sample-06', { ar: 'رسم لجسم بوزن زائد', en: 'artwork of a heavier build' }),
    sample: true,
  },
];
