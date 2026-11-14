import type { CoachConfig } from './types.ts';

/**
 * WHO THE SITE IS FOR.
 *
 * ⚠ SAMPLE DATA. "Coach Adam / الكابتن آدم" is a made-up coach that ships
 * with the template. Replace every value below with the real coach's
 * details, and set `sample: false` when nothing made-up is left.
 */
export const coach: CoachConfig = {
  sample: true,
  siteUrl: 'https://coach-adam.example.com',

  name: { ar: 'الكابتن آدم', en: 'Coach Adam' },
  shortName: { ar: 'كابتن آدم', en: 'Adam' },
  // How the interface refers to the coach ("عن الكابتن" / "About the coach").
  title: { ar: 'الكابتن', en: 'the coach' },
  role: {
    ar: 'مدرب لياقة وقوة ونحت جسم',
    en: 'Strength & body recomposition coach',
  },
  headline: {
    ar: 'أقوى كل أسبوع.\nبخطة مكتوبة لك أنت.',
    en: 'Stronger every week.\nOn a plan built for you.',
  },
  intro: {
    ar: 'تدريب شخصي في الجيم ومتابعة أونلاين: برنامج تمرين وتغذية مصمم لك، وقياس أسبوعي، ورد على واتساب في اليوم نفسه.',
    en: 'In-gym personal training and online coaching: a training and nutrition plan fitted to you, weekly check-ins, and same-day replies on WhatsApp.',
  },
  story: {
    ar: [
      'بدأت التدريب في سن 17 ووزني يزيد 22 كيلو عن الطبيعي. في السنة الأولى جرّبت كل الحلول السريعة، وكلها أعادتني إلى نقطة البداية. ما غيّر كل شيء كان خطة بسيطة أستطيع الالتزام بها، ومدرباً يتابعني كل أسبوع.',
      'أدرّب منذ 9 سنوات على الفكرة نفسها: لا يوجد برنامج واحد يناسب الجميع. نبدأ من قياسات حقيقية ومن أسلوب حياتك ومواعيد عملك، ونبني خطة تستطيع الاستمرار عليها، لا خطة تتحمّلها أسبوعين.',
      'أدرّب في الجيم بالقاهرة، وأونلاين لعملاء في مصر والخليج وأوروبا. معظم عملائي مشغولون جداً، ولهذا بالتحديد برامجي قصيرة ومركّزة.',
    ],
    en: [
      'I started training at 17, twenty-two kilos overweight. For a year I tried every quick fix, and every one of them put me back where I started. What changed everything was a simple plan I could stick to, and a coach who checked in every week.',
      'I have coached for nine years on the same idea: there is no plan that fits everyone. We start from real measurements, your lifestyle and your work hours, and build a plan you can keep going with, not one you survive for two weeks.',
      'I coach in the gym in Cairo, and online for clients in Egypt, the Gulf and Europe. Most of my clients are very busy, which is exactly why my programs are short and focused.',
    ],
  },
  principles: [
    {
      title: { ar: 'نقيس ولا نخمّن', en: 'Measure, don’t guess' },
      text: {
        ar: 'الوزن والمقاسات والصور وأرقام التمرين كل أسبوع. القرار يُبنى على الأرقام.',
        en: 'Weight, measurements, photos and training numbers every week. Decisions come from the data.',
      },
    },
    {
      title: { ar: 'تمرين أقل، أذكى', en: 'Train less, smarter' },
      text: {
        ar: 'من 3 إلى 4 حصص أسبوعياً، لكل حصة هدف واضح وتقدّم تدريجي.',
        en: 'Three to four sessions a week, each with a clear purpose and steady progression.',
      },
    },
    {
      title: { ar: 'أكل تقدر تعيش بيه', en: 'Food you can live with' },
      text: {
        ar: 'بلا حرمان ولا وجبات منفصلة عن عائلتك. نضبط كميات الأكل الذي تأكله بالفعل.',
        en: 'No starving and no separate meals from your family. We adjust portions of the food you already eat.',
      },
    },
  ],

  // Digits only, with the country code, no "+" or spaces. 20 = Egypt.
  // SAMPLE: this number is not real and WhatsApp will say so.
  whatsapp: '201000000000',
  email: 'hello@coach-adam.example.com',

  stats: {
    yearsExperience: 9,
    clients: 420,
    transformations: 180,
  },

  certifications: [
    {
      name: { ar: 'مدرب شخصي معتمد (عيّنة)', en: 'Certified Personal Trainer (sample)' },
      issuer: { ar: 'جهة اعتماد دولية', en: 'International certifying body' },
      year: 2017,
    },
    {
      name: { ar: 'أخصائي تغذية رياضية (عيّنة)', en: 'Sports Nutrition Specialist (sample)' },
      issuer: { ar: 'أكاديمية تغذية', en: 'Nutrition academy' },
      year: 2019,
    },
    {
      name: { ar: 'مدرب قوة وتكييف بدني (عيّنة)', en: 'Strength & Conditioning Coach (sample)' },
      issuer: { ar: 'اتحاد قوة وتكييف', en: 'Strength & conditioning association' },
      year: 2021,
    },
    {
      name: { ar: 'إسعافات أولية وإنعاش قلبي (عيّنة)', en: 'First Aid & CPR (sample)' },
      issuer: { ar: 'الهلال الأحمر', en: 'Red Crescent' },
      year: 2024,
    },
  ],

  location: {
    gym: { ar: 'آيرون يارد جيم (عيّنة)', en: 'Iron Yard Gym (sample)' },
    address: { ar: '12 شارع المثال، مدينة نصر', en: '12 Sample Street, Nasr City' },
    city: { ar: 'القاهرة', en: 'Cairo' },
    country: 'EG',
    mapUrl: 'https://maps.google.com/?q=Nasr+City+Cairo',
    geo: { lat: 30.0561, lng: 31.3301 },
    hours: {
      ar: 'السبت – الخميس، 7 صباحاً – 10 مساءً',
      en: 'Saturday – Thursday, 7 am – 10 pm',
    },
    openingHours: ['Sa-Th 07:00-22:00'],
  },

  socials: {
    instagram: 'https://instagram.com/',
    tiktok: 'https://www.tiktok.com/',
    youtube: 'https://youtube.com/',
    facebook: 'https://facebook.com/',
  },

  // Replace the files, keep the sizes (see README, "Images").
  images: {
    hero: {
      src: '/images/coach/hero.webp',
      width: 1200,
      height: 1500,
      alt: {
        ar: 'رسم توضيحي لرياضي يرفع بار فوق رأسه (صورة مؤقتة لصورة المدرب)',
        en: 'Illustration of an athlete pressing a barbell overhead (placeholder for the coach’s photo)',
      },
    },
    portrait: {
      src: '/images/coach/portrait.webp',
      width: 1200,
      height: 1500,
      alt: {
        ar: 'رسم توضيحي لعدّاء في وضع الانطلاق (صورة مؤقتة لصورة المدرب)',
        en: 'Illustration of a sprinter mid-stride (placeholder for the coach’s portrait)',
      },
    },
    map: {
      src: '/images/coach/map.webp',
      width: 1600,
      height: 1000,
      alt: {
        ar: 'خريطة مرسومة توضح مكان الجيم (صورة مؤقتة)',
        en: 'Drawn map showing the gym’s location (placeholder)',
      },
    },
  },

  currency: {
    code: 'EGP',
    label: { ar: 'ج.م', en: 'EGP' },
  },
  arabicDigits: 'latn',
};
