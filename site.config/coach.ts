import type { CoachConfig } from './types.ts';

/**
 * WHO THE SITE IS FOR: Coach Mohamed Nasser.
 *
 * Only confirmed facts go here. Sections with nothing in them (story,
 * certifications, gym, stats, socials, promises…) are hidden on the site
 * until they are filled in, so leave them out rather than guess.
 */
export const coach: CoachConfig = {
  sample: false,
  // Fallback only: on Vercel the address comes from the production domain
  // (VERCEL_PROJECT_PRODUCTION_URL), or SITE_URL when set.
  siteUrl: 'http://localhost:3000',

  name: { ar: 'الكابتن محمد ناصر', en: 'Coach Mohamed Nasser' },
  shortName: { ar: 'كابتن محمد', en: 'Coach Mohamed' },
  title: { ar: 'الكابتن', en: 'the coach' },
  role: {
    ar: 'مدرب لياقة وتغيير شكل جسم',
    en: 'Fitness and body transformation coach',
  },
  headline: {
    ar: 'أقوى كل أسبوع.\nبخطة مكتوبة لك أنت.',
    en: 'Stronger every week.\nOn a plan built for you.',
  },
  intro: {
    ar: 'تدريب شخصي ومتابعة أونلاين.',
    en: 'Personal training and online coaching.',
  },

  // Egypt (+20), digits only.
  whatsapp: '201147868373',

  // Only counts that are shown on the site: the 11 stories on the results page.
  stats: { transformations: 11 },

  // From the coach's own post (no athlete name).
  achievements: [
    {
      id: 'shalaby-classic',
      short: { ar: 'المركز الثالث · شلبي كلاسيك', en: '3rd place · Shalaby Classic' },
      title: { ar: 'المركز الثالث في بطولة شلبي كلاسيك', en: '3rd place at the Shalaby Classic' },
      text: {
        ar: 'لاعب من فريق الكابتن حصل على المركز الثالث في بطولة شلبي كلاسيك لكمال الأجسام، بعد تحضير 6 أسابيع.',
        en: 'An athlete coached by Mohamed took 3rd place at the Shalaby Classic bodybuilding championship, after a 6-week prep.',
      },
      photos: [
        {
          src: '/images/achievements/shalaby-classic-1.webp',
          width: 800,
          height: 1000,
          alt: { ar: 'الكابتن محمد ناصر مع لاعبه بالميدالية والشهادة في بطولة شلبي كلاسيك', en: 'Coach Mohamed Nasser with his athlete, medal and certificate, at the Shalaby Classic' },
        },
        {
          src: '/images/achievements/shalaby-classic-2.webp',
          width: 768,
          height: 960,
          alt: { ar: 'لاعب الكابتن يستعرض بعد الفوز بالمركز الثالث', en: 'The coach\'s athlete posing after taking 3rd place' },
        },
      ],
    },
  ],

  images: {
    hero: {
      src: '/images/coach/mohamed-nasser-hero.webp',
      width: 768,
      height: 960,
      alt: { ar: 'الكابتن محمد ناصر', en: 'Coach Mohamed Nasser' },
    },
    portrait: {
      src: '/images/coach/mohamed-nasser-portrait.webp',
      width: 600,
      height: 750,
      alt: { ar: 'صورة الكابتن محمد ناصر', en: 'Portrait of Coach Mohamed Nasser' },
    },
  },

  currency: {
    code: 'EGP',
    label: { ar: 'ج.م', en: 'EGP' },
  },
  arabicDigits: 'latn',
};
