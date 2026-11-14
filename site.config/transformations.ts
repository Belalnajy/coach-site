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
 * Pictures: the whole photos as posted; before and after of one view at the same size, in
 * public/images/transformations/. While this list is empty the results page,
 * its menu entry and the home block are hidden.
 */

const angleName: Record<TransformationView['angle'], Localized> = {
  front: { ar: 'من الأمام', en: 'front' },
  side: { ar: 'من الجانب', en: 'side' },
  back: { ar: 'من الخلف', en: 'back' },
  clothed: { ar: 'بالملابس', en: 'clothed' },
  pose: { ar: 'صورة ثانية', en: 'second photo' },
};

/** The picture pair for one view: /images/transformations/<id>-<angle>-before|after.webp, both width × height. */
const view = (id: string, angle: TransformationView['angle'], width: number, height: number): TransformationView => {
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
    id: 'm27',
    goal: 'fat-loss',
    title: { ar: 'تحوّل من 3 زوايا', en: 'Three-angle transformation' },
    caption: {
      ar: 'قبل وبعد من الأمام والجانب والخلف.',
      en: 'Before and after from the front, side and back.',
    },
    views: [view('m27', 'front', 550, 1100), view('m27', 'side', 412, 1100), view('m27', 'back', 733, 1100)],
    featured: true,
    sample: false,
  },
  {
    id: 'm26',
    goal: 'muscle-gain',
    badges: ['contest'],
    title: { ar: 'تحضير بطولة', en: 'Contest prep' },
    caption: {
      ar: 'قبل وبعد التحضير: وضعية الدبل بايسبس ووضعية فرد الظهر.',
      en: 'Before and after the prep: front double biceps and front lat spread.',
    },
    views: [view('m26', 'front', 733, 1100), view('m26', 'pose', 733, 1100)],
    featured: true,
    sample: false,
  },
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
    views: [view('m05', 'front', 539, 980), view('m05', 'side', 539, 980), view('m05', 'back', 539, 980)],
    featured: true,
    sample: false,
  },
  {
    id: 'm28',
    goal: 'fat-loss',
    title: { ar: 'من الشاطئ للجيم', en: 'Beach to gym' },
    caption: {
      ar: 'قبل وبعد: أنشف وأقوى.',
      en: 'Before and after: leaner and stronger.',
    },
    views: [view('m28', 'front', 550, 1100)],
    sample: false,
  },
  {
    id: 'm02',
    goal: 'fat-loss',
    title: { ar: 'من 80 إلى 72 كجم', en: '80 → 72 kg' },
    result: { ar: '−8 كجم', en: '−8 kg' },
    caption: { ar: 'يوم جديد وتحوّل جديد: من 80 إلى 72 كيلو.', en: 'New day, new transformation: from 80 to 72 kg.' },
    views: [view('m02', 'front', 623, 1100), view('m02', 'back', 586, 1100)],
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
    views: [view('m10', 'front', 570, 980), view('m10', 'back', 544, 980)],
    sample: false,
  },
  {
    id: 'm01',
    goal: 'fat-loss',
    title: { ar: 'من 108 إلى 85 كجم', en: '108 → 85 kg' },
    result: { ar: '−23 كجم', en: '−23 kg' },
    caption: { ar: 'تحوّل جديد: من 108 إلى 85 كيلو.', en: 'New transformation: from 108 to 85 kg.' },
    views: [view('m01', 'front', 411, 1100)],
    sample: false,
  },
  {
    id: 'm14',
    goal: 'fat-loss',
    title: { ar: 'من 110 إلى 75 كجم', en: '110 → 75 kg' },
    result: { ar: '−35 كجم', en: '−35 kg' },
    duration: { ar: 'حوالي 3 شهور', en: 'about 3 months' },
    caption: {
      ar: 'من 110 إلى 75 كيلو في حوالي 3 شهور.',
      en: 'From 110 to 75 kg in about 3 months.',
    },
    views: [view('m14', 'front', 605, 1100), view('m14', 'pose', 624, 1100)],
    sample: false,
  },
  {
    id: 'm16',
    goal: 'fat-loss',
    title: { ar: 'من 105 إلى 74 كجم', en: '105 → 74 kg' },
    result: { ar: '−31 كجم', en: '−31 kg' },
    caption: {
      ar: 'من الصفر للقمة: تحوّل حوالي 30 كيلو، من 105 إلى 74.',
      en: 'From zero to hero: about a 30-kilo transformation, from 105 to 74.',
    },
    views: [view('m16', 'front', 605, 1100), view('m16', 'back', 605, 1100), view('m16', 'clothed', 652, 1100)],
    sample: false,
  },
  {
    id: 'm25',
    goal: 'fat-loss',
    title: { ar: 'من 110 إلى 74 كجم', en: '110 → 74 kg' },
    result: { ar: '−36 كجم', en: '−36 kg' },
    caption: {
      ar: 'من 110 إلى 74.',
      en: 'From 110 to 74.',
    },
    views: [view('m25', 'front', 537, 658)],
    sample: false,
  },
  {
    id: 'm12',
    goal: 'fat-loss',
    title: { ar: '−30 كجم', en: '−30 kg' },
    result: { ar: '−30 كجم', en: '−30 kg' },
    caption: {
      ar: 'نزل 30 كيلو.',
      en: 'Down 30 kilos.',
    },
    views: [view('m12', 'front', 544, 1100)],
    sample: false,
  },
  {
    id: 'm13',
    goal: 'fat-loss',
    title: { ar: 'من 110 إلى 88 كجم', en: '110 → 88 kg' },
    result: { ar: '−22 كجم', en: '−22 kg' },
    detail: { ar: 'الدهون من 45% إلى 30%', en: 'body fat 45% → 30%' },
    duration: { ar: '3 شهور ونص', en: '3.5 months' },
    stages: [{ ar: '14/11: ‏110 كجم، دهون 45%', en: '14/11: 110 kg, 45% fat' }, { ar: '23/1: ‏95 كجم، دهون 35%', en: '23/1: 95 kg, 35% fat' }, { ar: '6/3: ‏88 كجم، دهون 30%', en: '6/3: 88 kg, 30% fat' }],
    caption: {
      ar: '3 شهور ونص من المجهود: من 110 كيلو ودهون 45%، إلى 95 كيلو ودهون 35%، ثم 88 كيلو ودهون 30%.',
      en: 'Three and a half months of effort: from 110 kg at 45% body fat, to 95 kg at 35%, then 88 kg at 30%.',
    },
    views: [view('m13', 'front', 431, 878)],
    sample: false,
  },
  {
    id: 'm23',
    goal: 'fat-loss',
    title: { ar: 'من 105 إلى 82 كجم', en: '105 → 82 kg' },
    result: { ar: '−23 كجم', en: '−23 kg' },
    duration: { ar: 'حوالي شهرين ونص', en: 'about 2.5 months' },
    caption: {
      ar: 'تحوّل جديد في حوالي شهرين ونص: من 105 كيلو إلى 82 كيلو.',
      en: 'A new transformation in about two and a half months: from 105 to 82 kg.',
    },
    views: [view('m23', 'front', 605, 1100)],
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
    views: [view('m03', 'side', 539, 1065)],
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
    views: [view('m08', 'front', 593, 823), view('m08', 'back', 629, 1100)],
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
    views: [view('m09', 'front', 588, 980)],
    sample: false,
  },
  {
    id: 'm22',
    goal: 'muscle-gain',
    title: { ar: 'من 72 إلى 90 كجم', en: '72 → 90 kg' },
    result: { ar: '+18 كجم', en: '+18 kg' },
    duration: { ar: '6 شهور', en: '6 months' },
    caption: {
      ar: 'تحوّل في 6 شهور: من 72 إلى 90 كيلو (ذاكرة العضلات).',
      en: 'A 6-month transformation: from 72 to 90 kg (muscle memory).',
    },
    views: [view('m22', 'front', 712, 1100)],
    sample: false,
  },
  {
    id: 'm18',
    goal: 'muscle-gain',
    title: { ar: 'من 49 إلى 68 كجم', en: '49 → 68 kg' },
    result: { ar: '+19 كجم', en: '+19 kg' },
    caption: {
      ar: 'من 49 إلى 68 كيلو.',
      en: 'From 49 to 68 kg.',
    },
    views: [view('m18', 'front', 635, 1100), view('m18', 'clothed', 629, 1100)],
    sample: false,
  },
  {
    id: 'm04',
    goal: 'muscle-gain',
    title: { ar: 'من 62 إلى 77 كجم', en: '62 → 77 kg' },
    result: { ar: '+15 كجم', en: '+15 kg' },
    caption: { ar: 'نفس التيشيرت، شخص مختلف: من 62 إلى 77 كيلو.', en: 'Same T-shirt, different man: from 62 to 77 kg.' },
    views: [view('m04', 'front', 544, 997)],
    sample: false,
  },
  {
    id: 'm07',
    goal: 'fat-loss',
    title: { ar: 'من 82 إلى 74 كجم', en: '82 → 74 kg' },
    result: { ar: '−8 كجم', en: '−8 kg' },
    duration: { ar: '4 شهور', en: '4 months' },
    caption: { ar: 'تحوّل في 4 شهور: من 82 إلى 74 كيلو.', en: 'A 4-month transformation: from 82 to 74 kg.' },
    views: [view('m07', 'front', 583, 980), view('m07', 'side', 575, 980)],
    sample: false,
  },
  {
    id: 'm06',
    goal: 'fat-loss',
    title: { ar: 'من 86 إلى 74 كجم', en: '86 → 74 kg' },
    result: { ar: '−12 كجم', en: '−12 kg' },
    caption: { ar: 'سنة جديدة وتحوّل جديد: من 86 إلى 74 كيلو.', en: 'New year, new transformation: from 86 to 74 kg.' },
    views: [view('m06', 'front', 572, 980)],
    sample: false,
  },
  {
    id: 'm11',
    goal: 'fat-loss',
    badges: ['posture'],
    title: { ar: 'من 91 إلى 79 كجم', en: '91 → 79 kg' },
    result: { ar: '−12 كجم', en: '−12 kg' },
    caption: {
      ar: 'تحوّل جديد: من 91 إلى 79 كيلو، وقدرنا نحل مشكلة انحناء عضلات الظهر.',
      en: 'New transformation: from 91 to 79 kg, and the rounded back fixed.',
    },
    views: [view('m11', 'front', 583, 980), view('m11', 'side', 619, 1100)],
    sample: false,
  },
  {
    id: 'm21',
    goal: 'muscle-gain',
    title: { ar: 'أول 6 شهور من السنة', en: 'First 6 months of the year' },
    duration: { ar: '6 شهور', en: '6 months' },
    caption: {
      ar: 'شغل أول 6 شهور من السنة.',
      en: 'The work of the first six months of the year.',
    },
    views: [view('m21', 'front', 652, 1100)],
    sample: false,
  },
  {
    id: 'm15',
    goal: 'muscle-gain',
    title: { ar: 'شهرين بعد كورونا', en: '2 months after the pandemic' },
    duration: { ar: 'شهرين', en: '2 months' },
    caption: {
      ar: 'تقدّم شهرين بعد جائحة كورونا.',
      en: 'Two months of progress after the coronavirus pandemic.',
    },
    views: [view('m15', 'front', 605, 1100)],
    sample: false,
  },
  {
    id: 'm20',
    goal: 'muscle-gain',
    title: { ar: 'تحوّل مايو 2022', en: 'May 2022 transformation' },
    caption: {
      ar: 'من منشورات الكابتن، مايو 2022.',
      en: 'From the coach\'s posts, May 2022.',
    },
    views: [view('m20', 'front', 588, 1100)],
    sample: false,
  },
  {
    id: 'm24',
    goal: 'fat-loss',
    title: { ar: 'تحوّل أكتوبر 2024', en: 'October 2024 transformation' },
    caption: {
      ar: 'تحوّل: أنشف وأوضح.',
      en: 'Transformation: leaner and more defined.',
    },
    views: [view('m24', 'front', 662, 1100)],
    sample: false,
  },
  {
    id: 'm17',
    goal: 'fat-loss',
    title: { ar: 'تحوّل 3 شهور', en: '3-month transformation' },
    duration: { ar: '3 شهور', en: '3 months' },
    caption: {
      ar: 'تحوّل في 3 شهور، وما زال مستمراً.',
      en: 'A 3-month transformation, still in progress.',
    },
    views: [view('m17', 'front', 644, 1100)],
    sample: false,
  },
  {
    id: 'm19',
    goal: 'fat-loss',
    title: { ar: 'تحوّل 3 شهور', en: '3-month transformation' },
    duration: { ar: '3 شهور', en: '3 months' },
    caption: {
      ar: 'تحوّل في 3 شهور بالضبط.',
      en: 'A transformation in exactly 3 months.',
    },
    views: [view('m19', 'side', 605, 1100)],
    sample: false,
  },
];
