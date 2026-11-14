import type { PackageConfig } from './types.ts';

/**
 * PACKAGES AND PRICES.
 *
 * ⚠ SAMPLE PRICES. Replace with the coach's real packages.
 *
 * - `kind`: "in-person" (in the gym) or "online".
 * - `price`: a number in the currency set in coach.ts, or "on-request".
 * - `popular: true` adds a "Most popular" tag (one package on the whole site).
 * - The order here is the order on the site.
 */
export const packages: PackageConfig[] = [
  {
    id: 'online-monthly',
    kind: 'online',
    name: { ar: 'متابعة أونلاين شهرية', en: 'Monthly online coaching' },
    summary: {
      ar: 'برنامج تمرين وتغذية يتحدّث كل أسبوع حسب تقدّمك.',
      en: 'A training and nutrition plan updated every week as you progress.',
    },
    price: 1000,
    per: { ar: 'شهرياً', en: 'per month' },
    features: [
      { ar: 'برنامج تمرين مصمم لك (جيم أو بيت)', en: 'Training plan built for you (gym or home)' },
      { ar: 'خطة أكل مرنة بالكميات', en: 'Flexible nutrition plan with portions' },
      { ar: 'متابعة أسبوعية بالقياسات والصور', en: 'Weekly check-in with measurements and photos' },
      { ar: 'رد على واتساب في اليوم نفسه', en: 'Same-day replies on WhatsApp' },
      { ar: 'فيديوهات شرح لكل تمرين', en: 'Video demo for every exercise' },
    ],
    popular: true,
  },
  {
    id: 'twelve-week',
    kind: 'online',
    name: { ar: 'برنامج التحوّل 12 أسبوع', en: '12-week transformation' },
    summary: {
      ar: 'ثلاث مراحل واضحة بهدف واحد ومقاسات قبل وبعد.',
      en: 'Three clear phases, one goal, with before and after measurements.',
    },
    price: 2000,
    per: { ar: 'دفعة واحدة', en: 'one-time' },
    features: [
      { ar: 'كل ما في المتابعة الشهرية', en: 'Everything in monthly coaching' },
      { ar: 'تحليل وضعيات التمرين بالفيديو', en: 'Form review on your videos' },
      { ar: 'تقرير تقدّم في نهاية كل مرحلة', en: 'Progress report after each phase' },
    ],
  },
  {
    id: 'nutrition-only',
    kind: 'online',
    name: { ar: 'خطة تغذية فقط', en: 'Nutrition only' },
    summary: {
      ar: 'لمن يتمرّن بالفعل ويحتاج ضبط الأكل.',
      en: 'For people who already train and need their eating sorted.',
    },
    price: 700,
    per: { ar: 'شهرياً', en: 'per month' },
    features: [
      { ar: 'سعرات وماكروز محسوبة لك', en: 'Calories and macros set for you' },
      { ar: 'بدائل من أكل البيت والمطاعم', en: 'Swaps from home food and restaurants' },
      { ar: 'متابعة أسبوعية للوزن والمقاسات', en: 'Weekly weight and measurement check' },
    ],
  },
  {
    id: 'pt-12',
    kind: 'in-person',
    name: { ar: 'تدريب شخصي – 12 حصة', en: 'Personal training – 12 sessions' },
    summary: {
      ar: 'حصص فردية في الجيم، 3 مرات أسبوعياً.',
      en: 'One-to-one sessions in the gym, three times a week.',
    },
    price: 3600,
    per: { ar: '12 حصة', en: '12 sessions' },
    features: [
      { ar: 'تقييم بدني وقياسات في أول حصة', en: 'Assessment and measurements in session one' },
      { ar: 'تصحيح الأداء في كل تمرين', en: 'Hands-on form coaching on every lift' },
      { ar: 'خطة أكل مع المتابعة', en: 'Nutrition plan included' },
      { ar: 'برنامج للأيام التي تتمرن فيها وحدك', en: 'A plan for the days you train alone' },
    ],
  },
  {
    id: 'small-group',
    kind: 'in-person',
    name: { ar: 'مجموعة صغيرة (3 أشخاص)', en: 'Small group (3 people)' },
    summary: {
      ar: 'تدرّب مع صديقين بتكلفة أقل وطاقة أعلى.',
      en: 'Train with two friends: lower cost, more energy.',
    },
    price: 1800,
    per: { ar: 'للفرد شهرياً', en: 'per person / month' },
    features: [
      { ar: '12 حصة جماعية في الشهر', en: '12 group sessions a month' },
      { ar: 'برنامج قوة ولياقة متدرّج', en: 'Progressive strength and conditioning' },
      { ar: 'تحدّيات شهرية بين المجموعة', en: 'Monthly challenges within the group' },
    ],
  },
  {
    id: 'vip-hybrid',
    kind: 'in-person',
    name: { ar: 'هجين VIP', en: 'VIP hybrid' },
    summary: {
      ar: 'حصص في الجيم ومتابعة يومية أونلاين لهدف بموعد محدد.',
      en: 'Gym sessions plus daily online check-ins, for a goal with a deadline.',
    },
    price: 'on-request',
    per: { ar: 'حسب الخطة', en: 'tailored' },
    features: [
      { ar: 'حتى 5 حصص أسبوعياً', en: 'Up to five sessions a week' },
      { ar: 'متابعة يومية للأكل والنوم والخطوات', en: 'Daily food, sleep and step check-ins' },
      { ar: 'أولوية في المواعيد', en: 'Priority scheduling' },
    ],
  },
];
