# Coach Site — build brief

A website template for a personal fitness coach ("Captain"). The same code
serves any coach: everything that identifies the coach (name, photos,
colours, prices, phone number, transformations, programs, articles) lives
in one config folder, so a new client is a content change, not a code
change. It also goes into Belal Nagy's portfolio as a project, so the
quality bar is "premium product", not "demo".

## Decisions already made by the owner

- **Template for any coach.** Ship with clearly fictional sample data
  (sample name, e.g. "Coach Adam / الكابتن آدم"), marked as sample in the
  config and README. Never present sample results or reviews as real
  people; the config comments say they must be replaced with the client's
  real, consented material.
- **Language:** Arabic first (RTL, default at `/`), English at `/en`, with
  a language switch that goes to the twin page.
- **Booking happens on WhatsApp.** The visitor picks a package, a
  preferred day and time slot, a goal and their name in a short form on the
  site; the site opens WhatsApp (`https://wa.me/<number>?text=…`) with a
  ready, nicely formatted message in the page's language. No database, no
  backend.
- **Digital features:**
  1. **Transformations:** a before/after gallery with a draggable
     comparison slider (touch, mouse and keyboard accessible), and per-client
     story cards (duration, weight or body-fat change, goal, short quote).
     Filters by goal (fat loss, muscle gain, fitness, women, etc.).
  2. **Fitness calculators:** calories (Mifflin–St Jeor with activity
     levels and goal adjustment), protein needs, ideal weight / BMI, body
     fat estimate (US Navy). Each ends with a call to action to book.
     Results are clearly marked as estimates, not medical advice.
  3. **Online programs:** packages for online coaching (e.g. monthly
     follow-up, 12-week program, nutrition-only) with what's included, and
     a buy/book button that goes to the same WhatsApp flow. Prices come from
     config; a price can be "on request".
  4. **Blog / tips:** short articles in both languages from local content
     files (no CMS), with reading time, categories, and share links.

## Pages

- Home: hero (coach, value proposition, one primary CTA "احجز الآن" /
  "Book now"), proof strip (years, clients, transformations count from
  config), featured transformations, services / packages preview, how it
  works (3–4 steps), calculators teaser, testimonials (from config), FAQ,
  final CTA band.
- Transformations (gallery + filters + stories)
- Programs & packages (in-person training and online coaching)
- Calculators (one page with tabs, or one route per calculator)
- Blog list + article page
- About the coach (story, certifications, gym location map link, socials)
- Booking page with the WhatsApp form (also reachable as a sheet from
  every page)
- 404 in both languages

## Design

- Energetic, premium, mobile-first. The best experience is on phones:
  bottom tab bar or a floating "Book" button, thumb-zone CTAs, swipeable
  galleries, fast. Desktop is still polished.
- Theme driven by config: brand colour(s), dark/light, fonts (an Arabic
  font such as Cairo or IBM Plex Sans Arabic plus a Latin display font).
  Ship one strong default theme (dark with a bold accent works well for
  fitness) and support light.
- Real-looking imagery without real people: the sample photos must be
  either generated abstract/silhouette artwork or clearly placeholder
  images that look intentional (no stock photos of real people, nothing
  downloaded from the web). Document the exact sizes and where to drop
  the client's photos.
- Accessibility: WCAG AA contrast, 44px targets, keyboard and screen
  reader friendly slider and forms, `prefers-reduced-motion`, correct RTL.

## Technical

- Next.js (App Router, latest stable), React, Tailwind CSS v4, static
  output where possible (deploys on Vercel free tier). No paid services.
- `site.config` folder: `coach.(ts|js)`, `theme`, `packages`,
  `transformations`, `testimonials`, `faq`, `posts/` — typed or validated
  so a bad config fails the build with a clear message.
- i18n with locale files (`ar`, `en`) for UI strings; content files carry
  both languages.
- SEO: metadata per page and language, hreflang, sitemap, robots,
  Open Graph images (generated per page), JSON-LD (Person/LocalBusiness
  `SportsActivityLocation`, Article, FAQPage, Offer for packages).
- Performance: Lighthouse mobile ≥ 90 performance, 100 accessibility,
  best practices and SEO; CLS 0; images via next/image with sizes.
- Quality: ESLint clean, unit tests for the calculators (known values) and
  the WhatsApp message builder (both languages, encoding), a config
  validation test, and a smoke test that builds and checks every route
  returns 200 in both languages.
- README (Arabic + English): how to set up a new coach in under 30
  minutes — which files to edit, image sizes, how to change colours,
  how to deploy to Vercel.
