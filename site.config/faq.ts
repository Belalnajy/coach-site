import type { FaqConfig } from './types.ts';

/**
 * QUESTIONS AND ANSWERS on the home page (and in search results, as FAQ
 * structured data). Edit freely; keep answers short.
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
    question: { ar: 'كيف تتم المتابعة الأسبوعية؟', en: 'How do the weekly check-ins work?' },
    answer: {
      ar: 'ترسل كل أسبوع وزنك ومقاساتك وصوراً ونموذجاً قصيراً عن التمرين والأكل والنوم، وأعدّل الخطة خلال 24 ساعة.',
      en: 'Each week you send your weight, measurements, photos and a short form on training, food and sleep, and I adjust the plan within 24 hours.',
    },
  },
  {
    question: { ar: 'هل سأتبع نظاماً غذائياً قاسياً؟', en: 'Will I be on a strict diet?' },
    answer: {
      ar: 'لا. نضبط كميات الأكل الذي تحبه، مع بدائل للمطاعم والمناسبات. الالتزام أهم من الكمال.',
      en: 'No. We adjust portions of food you like, with swaps for restaurants and events. Consistency beats perfection.',
    },
  },
  {
    question: { ar: 'متى أرى نتيجة؟', en: 'When will I see results?' },
    answer: {
      ar: 'يلاحظ معظم العملاء فرقاً في الطاقة والقوة خلال أسبوعين، وفي المقاسات خلال 4 إلى 6 أسابيع. النتائج تختلف من شخص لآخر.',
      en: 'Most clients notice more energy and strength within two weeks, and measurement changes in four to six weeks. Results vary from person to person.',
    },
  },
  {
    question: { ar: 'هل التدريب مناسب للسيدات والمبتدئين؟', en: 'Is it suitable for women and beginners?' },
    answer: {
      ar: 'نعم. كل برنامج يبدأ من مستواك الحالي، وتوجد برامج مخصصة للسيدات وبعد الولادة.',
      en: 'Yes. Every plan starts from your current level, with dedicated plans for women and postpartum.',
    },
  },
  {
    question: { ar: 'كيف أدفع؟ وهل يمكن الاسترجاع؟', en: 'How do I pay, and can I get a refund?' },
    answer: {
      ar: 'نتفق على طريقة الدفع على واتساب (تحويل بنكي أو محفظة إلكترونية). إذا لم تبدأ البرنامج خلال 7 أيام تسترد المبلغ كاملاً.',
      en: 'We agree on payment over WhatsApp (bank transfer or mobile wallet). If you have not started within 7 days, you get a full refund.',
    },
  },
];
