import type {
  BookingConfig,
  CoachConfig,
  FeaturesConfig,
  FaqConfig,
  Localized,
  PackageConfig,
  Palette,
  Picture,
  TestimonialConfig,
  ThemeConfig,
  TransformationConfig,
} from '../../site.config/types.ts';
import { contrastRatio, isHex } from './contrast.ts';

/**
 * Checks the whole site.config folder and returns every problem at once, as
 * sentences an editor can act on: which file, which field, what is wrong and
 * what was found. Pure (no file system), so the browser bundle can run it
 * too; file checks (pictures exist, posts parse) live in validate-files.ts.
 */

export interface SiteConfig {
  coach: CoachConfig;
  features: FeaturesConfig;
  theme: ThemeConfig;
  booking: BookingConfig;
  packages: PackageConfig[];
  transformations: TransformationConfig[];
  testimonials: TestimonialConfig[];
  faq: FaqConfig[];
  blogCategories: { id: string; label: Localized }[];
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const show = (value: unknown): string => {
  const text = JSON.stringify(value);
  return text === undefined ? 'nothing' : text.length > 60 ? `${text.slice(0, 57)}…` : text;
};

export const validateConfig = (config: SiteConfig): string[] => {
  const errors: string[] = [];
  // `found` is optional: pass it (even as undefined) to quote the bad value.
  const fail = (file: string, path: string, message: string, ...found: unknown[]) =>
    errors.push(`site.config/${file} → ${path}: ${message}${found.length ? ` (found ${show(found[0])})` : ''}`);

  const text = (file: string, path: string, value: unknown) => {
    const loc = value as Localized | undefined;
    if (!loc || typeof loc !== 'object') return fail(file, path, 'needs both { ar: "…", en: "…" }', value);
    for (const lang of ['ar', 'en'] as const) {
      if (typeof loc[lang] !== 'string' || loc[lang].trim() === '') fail(file, `${path}.${lang}`, 'must be non-empty text', loc[lang]);
    }
  };
  const picture = (file: string, path: string, pic: Picture | undefined) => {
    if (!pic) return fail(file, path, 'is missing');
    if (typeof pic.src !== 'string' || !/^\/[^\s]+\.(webp|jpe?g|png|avif)$/i.test(pic.src))
      fail(file, `${path}.src`, 'must be a path under /public starting with "/" and ending in .webp, .jpg, .png or .avif', pic.src);
    for (const side of ['width', 'height'] as const)
      if (!Number.isInteger(pic[side]) || pic[side] <= 0) fail(file, `${path}.${side}`, 'must be the picture’s size in pixels', pic[side]);
    text(file, `${path}.alt`, pic.alt);
  };
  const uniqueIds = (file: string, list: { id: string }[], label: string) => {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      if (typeof item.id !== 'string' || !ID.test(item.id))
        fail(file, `${label}[${i}].id`, 'must be lowercase letters, digits and dashes, e.g. "fat-loss"', item.id);
      else if (seen.has(item.id)) fail(file, `${label}[${i}].id`, 'is used twice; ids must be unique', item.id);
      seen.add(item.id);
    });
    return seen;
  };

  // coach.ts
  const { coach } = config;
  try {
    const url = new URL(coach.siteUrl);
    if (!/^https?:$/.test(url.protocol) || coach.siteUrl.endsWith('/'))
      fail('coach.ts', 'siteUrl', 'must be a full http(s) address without a trailing slash', coach.siteUrl);
  } catch {
    fail('coach.ts', 'siteUrl', 'must be a full address like "https://coach.example.com"', coach.siteUrl);
  }
  for (const key of ['name', 'shortName', 'title', 'role', 'headline', 'intro'] as const) text('coach.ts', key, coach[key]);
  // Optional sections: missing or empty is fine (the site hides them); what
  // is there must be complete.
  if (coach.story) {
    const counts = (['ar', 'en'] as const).map((lang) => (Array.isArray(coach.story![lang]) ? coach.story![lang].length : -1));
    if (counts[0] !== counts[1]) fail('coach.ts', 'story', 'needs the same number of paragraphs in ar and en', counts);
    for (const lang of ['ar', 'en'] as const) coach.story[lang]?.forEach((p, i) => !p.trim() && fail('coach.ts', `story.${lang}[${i}]`, 'is empty'));
  }
  coach.principles?.forEach((p, i) => {
    text('coach.ts', `principles[${i}].title`, p.title);
    text('coach.ts', `principles[${i}].text`, p.text);
  });
  if (!/^[1-9]\d{7,14}$/.test(coach.whatsapp))
    fail('coach.ts', 'whatsapp', 'must be the international number in digits only, with the country code and no "+", e.g. "201001234567"', coach.whatsapp);
  if (coach.email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(coach.email)) fail('coach.ts', 'email', 'is not an email address', coach.email);
  for (const [key, value] of Object.entries(coach.stats ?? {}))
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) fail('coach.ts', `stats.${key}`, 'must be a whole number, 0 or more', value);
  coach.certifications?.forEach((c, i) => {
    text('coach.ts', `certifications[${i}].name`, c.name);
    text('coach.ts', `certifications[${i}].issuer`, c.issuer);
    if (!Number.isInteger(c.year) || c.year < 1950 || c.year > 2100) fail('coach.ts', `certifications[${i}].year`, 'must be a year', c.year);
  });
  const loc = coach.location;
  if (loc) {
    text('coach.ts', 'location.gym', loc.gym);
    for (const key of ['address', 'city', 'hours'] as const) if (loc[key]) text('coach.ts', `location.${key}`, loc[key]);
    if (loc.country !== undefined && !/^[A-Z]{2}$/.test(loc.country)) fail('coach.ts', 'location.country', 'must be a two-letter country code like "EG"', loc.country);
    if (loc.mapUrl !== undefined && !/^https:\/\//.test(loc.mapUrl)) fail('coach.ts', 'location.mapUrl', 'must be an https link', loc.mapUrl);
    if (loc.geo && (Math.abs(loc.geo.lat) > 90 || Math.abs(loc.geo.lng) > 180)) fail('coach.ts', 'location.geo', 'has an impossible latitude/longitude', loc.geo);
  }
  for (const [name, href] of Object.entries(coach.socials ?? {}))
    if (href !== undefined && !/^https:\/\//.test(href)) fail('coach.ts', `socials.${name}`, 'must be an https link', href);
  const promises = coach.promises;
  if (promises) {
    if (promises.replyTime) text('coach.ts', 'promises.replyTime', promises.replyTime);
    promises.steps?.forEach((st, i) => {
      text('coach.ts', `promises.steps[${i}].title`, st.title);
      text('coach.ts', `promises.steps[${i}].text`, st.text);
    });
    promises.afterBooking?.forEach((st, i) => text('coach.ts', `promises.afterBooking[${i}]`, st));
    if (promises.guarantee) {
      text('coach.ts', 'promises.guarantee.title', promises.guarantee.title);
      text('coach.ts', 'promises.guarantee.text', promises.guarantee.text);
    }
  }
  coach.achievements?.forEach((ach, i) => {
    const at = `achievements[${i}]`;
    for (const key of ['short', 'title', 'text'] as const) text('coach.ts', `${at}.${key}`, ach[key]);
    if (!ach.photos?.length) fail('coach.ts', `${at}.photos`, 'needs at least one photo');
    ach.photos?.forEach((ph, j) => picture('coach.ts', `${at}.photos[${j}]`, ph));
  });
  if (typeof config.features?.blog !== 'boolean') fail('features.ts', 'blog', 'must be true or false', config.features?.blog);
  picture('coach.ts', 'images.hero', coach.images.hero);
  picture('coach.ts', 'images.portrait', coach.images.portrait);
  if (coach.images.map) picture('coach.ts', 'images.map', coach.images.map);
  if (coach.images.poster) picture('coach.ts', 'images.poster', coach.images.poster);
  if (!/^[A-Z]{3}$/.test(coach.currency.code)) fail('coach.ts', 'currency.code', 'must be a three-letter currency code like "EGP"', coach.currency.code);
  text('coach.ts', 'currency.label', coach.currency.label);
  if (coach.arabicDigits !== 'latn' && coach.arabicDigits !== 'arab') fail('coach.ts', 'arabicDigits', 'must be "latn" or "arab"', coach.arabicDigits);

  // theme.ts
  const { theme } = config;
  if (theme.defaultMode !== 'dark' && theme.defaultMode !== 'light') fail('theme.ts', 'defaultMode', 'must be "dark" or "light"', theme.defaultMode);
  const colors: [string, string][] = [
    ['accent', theme.accent],
    ['onAccent', theme.onAccent],
    ['hot', theme.hot],
    ['onHot', theme.onHot],
  ];
  for (const mode of ['dark', 'light'] as const)
    for (const [key, value] of Object.entries(theme[mode] ?? {})) colors.push([`${mode}.${key}`, value]);
  const badColor = colors.filter(([, value]) => !isHex(value));
  badColor.forEach(([key, value]) => fail('theme.ts', key, 'must be a colour written as #rrggbb', value));
  if (badColor.length === 0) {
    const pair = (path: string, fg: string, bg: string, min = 4.5) => {
      const ratio = contrastRatio(fg, bg);
      if (ratio < min)
        fail('theme.ts', path, `is too hard to read: contrast ${ratio.toFixed(2)}:1, needs at least ${min}:1 (WCAG AA). Darken or lighten one of the two colours`);
    };
    pair('onAccent on accent', theme.onAccent, theme.accent);
    pair('onHot on hot', theme.onHot, theme.hot);
    for (const mode of ['dark', 'light'] as const) {
      const p: Palette = theme[mode];
      for (const bg of ['bg', 'surface', 'surface2'] as const) {
        pair(`${mode}.text on ${mode}.${bg}`, p.text, p[bg]);
        pair(`${mode}.muted on ${mode}.${bg}`, p.muted, p[bg]);
        pair(`${mode}.accentText on ${mode}.${bg}`, p.accentText, p[bg]);
        pair(`${mode}.hotText on ${mode}.${bg}`, p.hotText, p[bg]);
        // A selected chip or tab has to stand out from what is around it.
        pair(`${mode}.selected against ${mode}.${bg}`, p.selected, p[bg], 3);
      }
      pair(`${mode}.onSelected on ${mode}.selected`, p.onSelected, p.selected);
    }
  }
  for (const key of ['arabic', 'latin', 'display'] as const)
    if (typeof theme.fonts?.[key] !== 'string' || !theme.fonts[key].trim()) fail('theme.ts', `fonts.${key}`, 'must name a font', theme.fonts?.[key]);

  // booking.ts
  const { booking } = config;
  if (!Array.isArray(booking.days) || booking.days.length === 0) fail('booking.ts', 'days', 'needs at least one day (0 = Sunday … 6 = Saturday)');
  booking.days.forEach((d, i) => {
    if (!Number.isInteger(d) || d < 0 || d > 6) fail('booking.ts', `days[${i}]`, 'must be 0 (Sunday) to 6 (Saturday)', d);
  });
  if (new Set(booking.days).size !== booking.days.length) fail('booking.ts', 'days', 'lists a day twice', booking.days);
  if (booking.slots.length === 0) fail('booking.ts', 'slots', 'needs at least one time slot');
  uniqueIds('booking.ts', booking.slots, 'slots');
  booking.slots.forEach((s, i) => text('booking.ts', `slots[${i}].label`, s.label));
  if (booking.goals.length === 0) fail('booking.ts', 'goals', 'needs at least one goal');
  const goals = uniqueIds('booking.ts', booking.goals, 'goals');
  booking.goals.forEach((g, i) => text('booking.ts', `goals[${i}].label`, g.label));

  // packages.ts
  if (config.packages.length === 0) fail('packages.ts', 'packages', 'needs at least one package');
  uniqueIds('packages.ts', config.packages, 'packages');
  let popular = 0;
  config.packages.forEach((p, i) => {
    const at = `packages[${i}]`;
    if (p.kind !== 'online' && p.kind !== 'in-person') fail('packages.ts', `${at}.kind`, 'must be "online" or "in-person"', p.kind);
    text('packages.ts', `${at}.name`, p.name);
    text('packages.ts', `${at}.summary`, p.summary);
    text('packages.ts', `${at}.per`, p.per);
    if (p.price !== 'on-request' && !(typeof p.price === 'number' && Number.isFinite(p.price) && p.price > 0))
      fail('packages.ts', `${at}.price`, 'must be a positive number or "on-request"', p.price);
    if (!Array.isArray(p.features) || p.features.length === 0) fail('packages.ts', `${at}.features`, 'needs at least one item');
    else p.features.forEach((f, j) => text('packages.ts', `${at}.features[${j}]`, f));
    if (p.popular) popular++;
  });
  if (popular > 1) fail('packages.ts', 'popular', `only one package on the site can be marked popular, ${popular} are`);

  // transformations.ts
  uniqueIds('transformations.ts', config.transformations, 'transformations');
  config.transformations.forEach((t, i) => {
    const at = `transformations[${i}]`;
    if (!goals.has(t.goal)) fail('transformations.ts', `${at}.goal`, `must be one of the goals in booking.ts: ${[...goals].join(', ')}`, t.goal);
    t.tags?.forEach((tag, j) => {
      if (!goals.has(tag)) fail('transformations.ts', `${at}.tags[${j}]`, `must be one of the goals in booking.ts: ${[...goals].join(', ')}`, tag);
    });
    t.badges?.forEach((badge, j) => {
      if (!['posture', 'online', 'injury', 'student', 'contest'].includes(badge)) fail('transformations.ts', `${at}.badges[${j}]`, 'must be "posture", "online", "injury", "student" or "contest"', badge);
    });
    for (const key of ['title', 'caption'] as const) text('transformations.ts', `${at}.${key}`, t[key]);
    for (const key of ['result', 'detail', 'duration'] as const) if (t[key]) text('transformations.ts', `${at}.${key}`, t[key]);
    t.stages?.forEach((st, j) => text('transformations.ts', `${at}.stages[${j}]`, st));
    if (!Array.isArray(t.views) || t.views.length === 0) fail('transformations.ts', `${at}.views`, 'needs at least one before/after pair');
    const angles = new Set<string>();
    t.views?.forEach((v, j) => {
      const vat = `${at}.views[${j}]`;
      if (!['front', 'side', 'back', 'clothed', 'pose'].includes(v.angle)) fail('transformations.ts', `${vat}.angle`, 'must be "front", "side", "back", "clothed" or "pose"', v.angle);
      if (angles.has(v.angle)) fail('transformations.ts', `${vat}.angle`, 'is used twice in this story', v.angle);
      angles.add(v.angle);
      picture('transformations.ts', `${vat}.before`, v.before);
      picture('transformations.ts', `${vat}.after`, v.after);
      if (v.before && v.after && (v.before.width !== v.after.width || v.before.height !== v.after.height))
        fail('transformations.ts', vat, 'before and after must be the same size so the slider lines up');
    });
    if (typeof t.sample !== 'boolean') fail('transformations.ts', `${at}.sample`, 'must be true (made-up) or false (real, consented)', t.sample);
    if (t.order !== undefined && !Number.isFinite(t.order)) fail('transformations.ts', `${at}.order`, 'must be a number', t.order);
  });

  // testimonials.ts
  uniqueIds('testimonials.ts', config.testimonials, 'testimonials');
  config.testimonials.forEach((t, i) => {
    const at = `testimonials[${i}]`;
    for (const key of ['name', 'context', 'quote'] as const) text('testimonials.ts', `${at}.${key}`, t[key]);
    if (!Number.isInteger(t.rating) || t.rating < 1 || t.rating > 5) fail('testimonials.ts', `${at}.rating`, 'must be a whole number from 1 to 5', t.rating);
    if (typeof t.sample !== 'boolean') fail('testimonials.ts', `${at}.sample`, 'must be true (made-up) or false (real)', t.sample);
  });

  // faq.ts
  config.faq.forEach((f, i) => {
    text('faq.ts', `faq[${i}].question`, f.question);
    text('faq.ts', `faq[${i}].answer`, f.answer);
  });

  // blog.ts
  uniqueIds('blog.ts', config.blogCategories, 'blogCategories');
  config.blogCategories.forEach((c, i) => text('blog.ts', `blogCategories[${i}].label`, c.label));

  // A real coach's site must not keep made-up results, reviews or details.
  if (!coach.sample) {
    for (const problem of samplePlaceholders(config)) fail(problem.file, problem.path, `still holds the template's sample value; replace it with the coach's own`, problem.value);
    config.transformations.forEach((t, i) => {
      if (t.sample) fail('transformations.ts', `transformations[${i}].sample`, 'coach.sample is false, so made-up stories must be removed or replaced with real ones');
    });
    config.testimonials.forEach((t, i) => {
      if (t.sample) fail('testimonials.ts', `testimonials[${i}].sample`, 'coach.sample is false, so made-up reviews must be removed or replaced with real ones');
    });
  }

  return errors;
};

/**
 * Values that only the template's made-up coach uses. Once `coach.sample`
 * is false, finding any of them fails the build, so a placeholder phone
 * number, address or picture cannot go live by accident.
 */
export const samplePlaceholders = (config: SiteConfig): { file: string; path: string; value: unknown }[] => {
  const found: { file: string; path: string; value: unknown }[] = [];
  const { coach } = config;
  const flag = (file: string, path: string, value: unknown) => found.push({ file, path, value });
  const sampleWord = /\(sample\)|\(عيّنة\)|\(عينة\)/i;
  if (coach.whatsapp === '201000000000') flag('coach.ts', 'whatsapp', coach.whatsapp);
  if (/(^|[./@])example\.(com|org|net)$|\.example(\.|$)/i.test(new URL(coach.siteUrl, 'https://x.invalid').hostname)) flag('coach.ts', 'siteUrl', coach.siteUrl);
  if (coach.email && /@(.+\.)?example\.(com|org|net)$/i.test(coach.email)) flag('coach.ts', 'email', coach.email);
  if (coach.name.en === 'Coach Adam' || coach.name.ar === 'الكابتن آدم') flag('coach.ts', 'name', coach.name);
  coach.certifications?.forEach((c, i) => {
    if (sampleWord.test(c.name.en) || sampleWord.test(c.name.ar)) flag('coach.ts', `certifications[${i}].name`, c.name.en);
  });
  for (const key of ['gym', 'address'] as const) {
    const value = coach.location?.[key];
    if (value && (sampleWord.test(value.en) || sampleWord.test(value.ar) || /sample/i.test(value.en))) flag('coach.ts', `location.${key}`, value.en);
  }
  // Template copy left in the story.
  if (coach.story?.en.some((p) => /twenty-two kilos overweight|nine years on the same idea/i.test(p))) flag('coach.ts', 'story', 'the template story');
  for (const [name, href] of Object.entries(coach.socials ?? {}))
    if (href && /^https:\/\/(www\.)?[^/]+\/?$/.test(href)) flag('coach.ts', `socials.${name}`, href);
  const pictures: [string, string, string][] = [
    ['coach.ts', 'images.hero.src', coach.images.hero.src],
    ['coach.ts', 'images.portrait.src', coach.images.portrait.src],
    ...(coach.images.map ? [['coach.ts', 'images.map.src', coach.images.map.src] as [string, string, string]] : []),
    ...config.transformations.flatMap((t, i): [string, string, string][] =>
      (t.views ?? []).flatMap((v, j): [string, string, string][] => [
        ['transformations.ts', `transformations[${i}].views[${j}].before.src`, v.before.src],
        ['transformations.ts', `transformations[${i}].views[${j}].after.src`, v.after.src],
      ]),
    ),
  ];
  for (const [file, path, src] of pictures) if (/\/sample-[^/]*$/.test(src) || /^\/images\/coach\/(hero|portrait|map)\.webp$/.test(src)) flag(file, path, src);
  return found;
};

export class ConfigError extends Error {
  constructor(errors: string[]) {
    super(`\n\nThe site config has ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n\n${errors.map((e) => `  • ${e}`).join('\n')}\n\nFix ${errors.length === 1 ? 'it' : 'them'} and run the build again.\n`);
    this.name = 'ConfigError';
  }
}

export const assertValidConfig = (config: SiteConfig): void => {
  const errors = validateConfig(config);
  if (errors.length) throw new ConfigError(errors);
};
