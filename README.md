# Coach Site — website template for a personal fitness coach

[English](#english) · [العربية](#العربية)

---

## English

A fast, bilingual website for a personal trainer: Arabic first (right-to-left, at `/`) and English at `/en`. Visitors book on **WhatsApp** through a short form that writes the message for them; there is no database and no backend. Everything that identifies the coach lives in one folder, **`site.config/`**, so a new client is a content change, not a code change.

> **Sample content.** The template ships with a made-up coach, "Coach Adam / الكابتن آدم". His clients, results, reviews, certifications, prices and phone number are fictional, and every picture is generated artwork, not a photo of a real person. Stories and reviews carry a visible "Sample" badge and the footer says the site shows sample content until `coach.sample` is set to `false`. Replace everything with the real coach's material, and publish client photos and reviews **only with the client's written consent**.

### What's inside

| Page | Address (AR / EN) | What it does |
| --- | --- | --- |
| Home | `/` · `/en` | Hero with one "Book now" action, proof numbers, featured before/after stories, programs preview, how it works, calculators teaser, reviews, FAQ, final call to action |
| Results | `/transformations` | Before/after slider (drag, tap, or arrow keys), story cards (time, result, goal, quote), goal filters |
| Programs | `/programs` | In-gym and online packages from the config; each "Book" button opens the booking sheet with that package chosen |
| Calculators | `/calculators` | Calories (Mifflin–St Jeor + activity + goal), protein, BMI & ideal weight, body fat (U.S. Navy); results update live and can be sent with the booking |
| Blog | `/blog`, `/blog/<slug>` | Articles from Markdown files, both languages, reading time, categories, share links |
| About | `/about` | Story, principles, certifications, gym location card with map link, hours, socials |
| Booking | `/book` | The WhatsApp form with a live message preview (also a bottom sheet on every page) |
| 404 | any unknown address | In Arabic, or English under `/en` |

Also: dark and light themes, a phone tab bar with a central Book button, share images for every page in both languages, `sitemap.xml` with hreflang, `robots.txt`, a web manifest, and JSON-LD (Person, SportsActivityLocation, FAQPage, Offer catalogue, BlogPosting, breadcrumbs).

### Set up a new coach in under 30 minutes

You need Node.js 22.18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000 (Arabic) and /en (English)
```

Then edit the files below, top to bottom. Every file is commented, and `npm run check-config` tells you exactly what is wrong (file, field, value) if something doesn't fit.

| Step | File | Time | What to change |
| --- | --- | --- | --- |
| 1 | `site.config/coach.ts` | 6 min | Name in both languages, role, headline (`\n` starts the highlighted second line), intro, story, principles, **WhatsApp number** (digits with country code, e.g. `201001234567`), email, stats, certifications, gym address, hours, map link, socials, currency, `siteUrl` |
| 2 | `site.config/theme.ts` | 3 min | `accent` (brand colour) and `onAccent` (text on it); the dark/light palettes if you like. The build refuses colours that fail WCAG AA contrast and says which pair |
| 3 | `site.config/packages.ts` | 5 min | Packages: `kind` (`online` / `in-person`), name, summary, `price` (a number, or `"on-request"`), what the price covers, features, one `popular` per kind |
| 4 | `site.config/booking.ts` | 2 min | Working days (0 = Sunday … 6 = Saturday), time slots, goals (the goals also drive the results filters) |
| 5 | `site.config/transformations.ts` + photos | 7 min | Real, consented client stories; set `sample: false` on each. Put photos in `public/images/transformations/` |
| 6 | `site.config/testimonials.ts`, `faq.ts` | 4 min | Real reviews (`sample: false`) and your FAQ |
| 7 | `site.config/posts/*.md`, `blog.ts` | 3 min | Keep, edit or delete the sample articles; one file per article holds both languages (see any existing file) |
| 8 | `public/images/coach/` | — | Replace the hero, portrait and map pictures (sizes below) |

Finally set `sample: false` in `coach.ts` (the build then refuses any story or review still marked as sample), run the checks, and deploy.

#### Pictures: exact sizes

Replace the files and keep the names and sizes (or change the path and size in the config; the check compares them with the real file).

| File | Size (px) | Used for |
| --- | --- | --- |
| `public/images/coach/hero.webp` | 1200 × 1500 (4:5) | Home hero and share images. Coach in the upper half; the bottom third sits under text on phones |
| `public/images/coach/portrait.webp` | 1200 × 1500 (4:5) | About page |
| `public/images/coach/map.webp` | 1600 × 1000 (16:10) | About page location card (a map screenshot or a gym photo) |
| `public/images/transformations/<id>-before.webp` / `-after.webp` | 1000 × 1250 (4:5) | Before/after pairs. Same spot, distance, pose and light, so the slider lines up |
| `public/images/blog/<slug>.webp` | 1600 × 900 (16:9) | Article covers |

WebP or JPG at about 80% quality is plenty; the site resizes them for each screen. `npm run images` regenerates the sample artwork.

#### Colours and fonts

- **Colours:** `site.config/theme.ts` only. A bright accent (lime, yellow, cyan) needs a dark `onAccent`; a deep accent (blue, red, purple) needs white. `accentText` is the accent used as text, and on the light palette it is usually a darker shade.
- **Fonts:** loaded and self-hosted by `next/font`, which needs them written out in code: `src/lib/fonts-ar.ts` (Arabic pages, default Cairo) and `src/lib/fonts-en.ts` (English pages, default Inter + Barlow Condensed). Swap the import and keep the `variable` names; update the names in `theme.ts` to match. The share images use the font files in `src/assets/fonts/`.

#### Deploy to Vercel (free tier)

1. Push the project to GitHub (or GitLab/Bitbucket).
2. On vercel.com: **Add New → Project**, import the repository. The defaults (framework Next.js, `npm run build`) are right; no environment variables are needed.
3. Add the coach's domain under **Settings → Domains**, and make sure `siteUrl` in `coach.ts` is that address.

Every page is static; only the image resizing and share images run on Vercel's free functions.

### Checks

| Command | What it checks |
| --- | --- |
| `npm run lint` | ESLint (zero warnings) and TypeScript |
| `npm test` | Unit tests: calculators against known values, the WhatsApp message in both languages and its URL encoding, config validation, posts, locale keys |
| `npm run check-config` | The config and pictures (also runs before every build) |
| `npm run smoke` | Builds, starts the site, checks every page returns 200 in both languages (lang/dir, hreflang, share image, one `<h1>`), the metadata routes, and the 404s |
| `npm run check:layout` | With the site running on port 4500: no horizontal scroll at 320–430 px in both themes, one visible `<h1>` per page |
| `npm run check:interactions` | With the site running: booking sheet → WhatsApp link, slider by keyboard and drag, calculator tabs |
| `npm run lighthouse -- http://localhost:4500/` | Lighthouse (mobile); fails below 90 performance or 100 accessibility/best practices/SEO, or CLS above 0 |

Browser checks use Chrome via `puppeteer-core`; set `CHROME_PATH` if it is not found.

### Project structure

```
site.config/        everything about the coach (the only folder a new client needs)
  coach.ts theme.ts booking.ts packages.ts transformations.ts testimonials.ts faq.ts blog.ts
  posts/*.md        articles, both languages per file
  types.ts          the shape of the config (editor autocomplete)
src/app/(ar)/       Arabic pages (root layout: lang="ar" dir="rtl") at /
src/app/en/         English pages (root layout: lang="en" dir="ltr") at /en
src/app/global-not-found.tsx   one 404 document for both languages
src/components/     UI; pages/ holds one component per page, shared by both languages
src/lib/            calculators, WhatsApp message, validation, SEO/JSON-LD, share images, i18n
src/locales/        interface text (ar.ts, en.ts)
scripts/            config check, smoke, layout, interactions, Lighthouse, screenshots, sample art
tests/unit/         node --test unit tests
```

### Placeholders to replace

Coach name, role, story, principles, certifications (marked "sample"), the gym name and address, map link and coordinates, phone number (`201000000000` is not real), email, social links (they point to the networks' home pages), stats, prices, all transformations and reviews, the FAQ answers about payment and refunds, the four articles, `siteUrl`, and every picture in `public/images/`.

---

## العربية

قالب موقع سريع ثنائي اللغة لمدرب لياقة شخصي: العربية أولاً (من اليمين لليسار، على `/`) والإنجليزية على `/en`. الزائر يحجز على **واتساب** من نموذج قصير يكتب الرسالة نيابةً عنه؛ لا قاعدة بيانات ولا خادم. كل ما يخص المدرب موجود في مجلد واحد هو **`site.config/`**، فإضافة عميل جديد تعني تعديل محتوى، لا تعديل كود.

> **محتوى تجريبي.** يأتي القالب بمدرب وهمي اسمه «الكابتن آدم / Coach Adam». العملاء والنتائج والآراء والشهادات والأسعار ورقم الهاتف كلها خيالية، وكل الصور رسومات مولّدة وليست صوراً لأشخاص حقيقيين. القصص والآراء عليها شارة «عيّنة» ظاهرة، والفوتر يوضح أن الموقع يعرض محتوى تجريبياً حتى تضبط `coach.sample` على `false`. استبدل كل شيء بمحتوى المدرب الحقيقي، ولا تنشر صور العملاء أو آراءهم **إلا بموافقة مكتوبة منهم**.

### الصفحات

| الصفحة | الرابط | الوظيفة |
| --- | --- | --- |
| الرئيسية | `/` · `/en` | واجهة بزر «احجز الآن»، أرقام المدرب، قصص قبل وبعد، لمحة عن الباقات، خطوات البدء، الحاسبات، الآراء، الأسئلة الشائعة |
| النتائج | `/transformations` | شريط مقارنة قبل/بعد (سحب أو لمس أو أسهم لوحة المفاتيح)، بطاقات القصص، فلترة حسب الهدف |
| الباقات | `/programs` | باقات الجيم والأونلاين من الإعدادات، وكل زر حجز يفتح نموذج الحجز بالباقة مختارة |
| الحاسبات | `/calculators` | السعرات (ميفلين–سانت جيور)، البروتين، مؤشر الكتلة والوزن المثالي، نسبة الدهون (البحرية الأمريكية) |
| المقالات | `/blog` | مقالات من ملفات Markdown باللغتين، مع وقت القراءة والتصنيفات وروابط المشاركة |
| عن الكابتن | `/about` | القصة، المبادئ، الشهادات، مكان الجيم ورابط الخريطة، المواعيد، الحسابات |
| الحجز | `/book` | نموذج واتساب مع معاينة حيّة للرسالة (ويظهر كنافذة سفلية من أي صفحة) |
| 404 | أي رابط غير موجود | بالعربية، أو بالإنجليزية تحت `/en` |

### تجهيز مدرب جديد في أقل من 30 دقيقة

تحتاج Node.js إصدار 22.18 أو أحدث:

```bash
npm install
npm run dev
```

ثم عدّل الملفات بالترتيب. كل ملف عليه شرح، والأمر `npm run check-config` يخبرك بالضبط بالخطأ (الملف والحقل والقيمة).

| الخطوة | الملف | الوقت | ماذا تغيّر |
| --- | --- | --- | --- |
| 1 | `site.config/coach.ts` | 6 دقائق | الاسم باللغتين، التخصص، العنوان الرئيسي (`\n` يبدأ السطر الثاني الملوّن)، النبذة، القصة، **رقم واتساب** (أرقام فقط مع كود الدولة مثل `201001234567`)، البريد، الأرقام، الشهادات، عنوان الجيم، المواعيد، رابط الخريطة، الحسابات، العملة، `siteUrl` |
| 2 | `site.config/theme.ts` | 3 دقائق | `accent` لون العلامة و`onAccent` لون النص فوقه. البناء يرفض أي ألوان تباينها أقل من معيار WCAG AA ويذكر أي زوج |
| 3 | `site.config/packages.ts` | 5 دقائق | الباقات: النوع (`online` / `in-person`)، الاسم، الوصف، `price` رقم أو `"on-request"` للسعر عند الطلب، المميزات، وباقة واحدة `popular` لكل نوع |
| 4 | `site.config/booking.ts` | دقيقتان | أيام العمل (0 = الأحد … 6 = السبت)، الفترات، الأهداف (تُستخدم أيضاً في فلاتر النتائج) |
| 5 | `site.config/transformations.ts` + الصور | 7 دقائق | قصص عملاء حقيقية بموافقتهم مع `sample: false`، والصور في `public/images/transformations/` |
| 6 | `testimonials.ts` و `faq.ts` | 4 دقائق | آراء حقيقية (`sample: false`) وأسئلتك الشائعة |
| 7 | `site.config/posts/*.md` | 3 دقائق | عدّل المقالات أو احذفها؛ كل ملف يحمل اللغتين |
| 8 | `public/images/coach/` | — | استبدل صور الواجهة والبورتريه والخريطة |

في النهاية اضبط `sample: false` في `coach.ts` (سيرفض البناء أي قصة أو رأي ما زال تجريبياً)، شغّل الفحوصات، وانشر.

#### مقاسات الصور

| الملف | المقاس (بكسل) | الاستخدام |
| --- | --- | --- |
| `public/images/coach/hero.webp` | 1200 × 1500 | واجهة الرئيسية وصور المشاركة؛ المدرب في النصف العلوي |
| `public/images/coach/portrait.webp` | 1200 × 1500 | صفحة «عن الكابتن» |
| `public/images/coach/map.webp` | 1600 × 1000 | بطاقة مكان الجيم |
| `public/images/transformations/<id>-before.webp` و `-after.webp` | 1000 × 1250 | قبل/بعد: نفس المكان والمسافة والوضعية والإضاءة |
| `public/images/blog/<slug>.webp` | 1600 × 900 | أغلفة المقالات |

#### الألوان والخطوط

- **الألوان:** من `site.config/theme.ts` فقط. اللون الفاتح (ليموني، أصفر) يحتاج `onAccent` داكناً، واللون الغامق يحتاج أبيض.
- **الخطوط:** في `src/lib/fonts-ar.ts` (العربية، افتراضياً Cairo) و `src/lib/fonts-en.ts` (الإنجليزية). غيّر الاستيراد واترك أسماء `variable` كما هي.

#### النشر على Vercel (مجاناً)

1. ارفع المشروع إلى GitHub.
2. في vercel.com اختر **Add New → Project** واستورد المستودع؛ الإعدادات الافتراضية صحيحة ولا حاجة لمتغيرات بيئة.
3. أضف دومين المدرب من **Settings → Domains** وتأكد أن `siteUrl` يطابقه.

### الفحوصات

`npm run lint` (بدون أي تحذير) · `npm test` (اختبارات الحاسبات ورسالة واتساب والإعدادات) · `npm run smoke` (بناء وفحص كل الصفحات باللغتين) · `npm run check:layout` و `npm run check:interactions` و `npm run lighthouse` (على نسخة تعمل على المنفذ 4500).

### ما يجب استبداله

اسم المدرب وتخصصه وقصته ومبادئه وشهاداته (المكتوب عليها «عيّنة»)، اسم الجيم وعنوانه ورابط الخريطة، رقم الهاتف (`201000000000` غير حقيقي)، البريد، روابط الحسابات، الأرقام، الأسعار، كل قصص التحوّل والآراء، إجابات الدفع والاسترجاع في الأسئلة الشائعة، المقالات الأربع، `siteUrl`، وكل الصور في `public/images/`.
