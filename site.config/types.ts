/**
 * The shape of everything in site.config/. Editors never touch this file:
 * it only exists so the editor (VS Code) can autocomplete the config and so
 * `src/lib/validate.ts` can check it. A config that breaks these rules
 * fails `npm run build` with a message that names the file and the field.
 */

export type Locale = 'ar' | 'en';

/** A piece of text in both languages. Both are required. */
export interface Localized {
  ar: string;
  en: string;
}

/** Several paragraphs in both languages. */
export interface LocalizedParagraphs {
  ar: string[];
  en: string[];
}

/** A picture: the file under /public and its description for screen readers. */
export interface Picture {
  /** Path from /public, starting with "/", e.g. "/images/coach/hero.webp". */
  src: string;
  /** Pixel size of the file; used to reserve space so nothing jumps. */
  width: number;
  height: number;
  alt: Localized;
}

export interface Certification {
  name: Localized;
  issuer: Localized;
  year: number;
}

export interface CoachConfig {
  /**
   * true while the site still shows the template's made-up sample content.
   * It puts a small "sample content" notice in the footer and keeps the site
   * out of search engines. Set it to false for a real coach: the build then
   * refuses any of the template's placeholder values that are left.
   */
  sample: boolean;
  /**
   * Public address of the site, no trailing slash, used for SEO links. On
   * Vercel it is worked out at build time from the project's production
   * domain (or SITE_URL if set), so this is only the fallback, e.g. for a
   * local build.
   */
  siteUrl: string;
  /** Full name, e.g. "Coach Adam" / "الكابتن آدم". */
  name: Localized;
  /** Shortest form, used in the WhatsApp greeting. */
  shortName: Localized;
  /**
   * How visitors address the coach on its own, in interface text such as
   * "About the coach" / "عن الكابتن". E.g. { ar: 'الكابتن', en: 'the coach' }
   * or, for a woman coach, { ar: 'الكوتش', en: 'the coach' }.
   */
  title: Localized;
  /** What the coach does, in a few words. */
  role: Localized;
  /** Hero headline. Keep it under ~40 characters per line. */
  headline: Localized;
  /** One or two sentences under the headline. */
  intro: Localized;

  // ------------------------------------------------------------------------
  // Everything below is optional. A section whose content is missing or empty
  // is simply not shown (and its menu entry and structured data go with it),
  // so a coach can launch with what they have and add the rest later. Never
  // fill these with guesses about a real person.
  // ------------------------------------------------------------------------

  /** About page story, a few paragraphs. */
  story?: LocalizedParagraphs;
  /** Short philosophy points shown on the About page. */
  principles?: { title: Localized; text: Localized }[];
  /** International number for WhatsApp, digits only, e.g. "201001234567". */
  whatsapp: string;
  email?: string;
  /**
   * Achievements: a competition result, an award… Shown on the About page,
   * with the first one highlighted on the home page and in the proof row.
   */
  achievements?: {
    id: string;
    /** Short form for the proof row, e.g. "3rd place · Shalaby Classic". */
    short: Localized;
    title: Localized;
    text: Localized;
    photos: Picture[];
  }[];
  /** Proof numbers on the home and About pages. Each one is shown only if set. */
  stats?: {
    yearsExperience?: number;
    clients?: number;
    transformations?: number;
  };
  certifications?: Certification[];
  /** The gym. Leave it out for online-only coaches or until it is confirmed. */
  location?: {
    gym: Localized;
    address?: Localized;
    city?: Localized;
    /** ISO country code, e.g. "EG", "SA", "AE". */
    country?: string;
    /** Any Google Maps (or other) link to the gym. */
    mapUrl?: string;
    geo?: { lat: number; lng: number };
    /** Human-readable opening hours. */
    hours?: Localized;
    /** Machine-readable hours for search engines, schema.org format. */
    openingHours?: string[];
  };
  socials?: Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x', string>>;
  /**
   * Promises about the service, each shown only when the coach has confirmed it:
   * - replyTime: the hero's "replies within hours" note;
   * - steps: "How it works" on the home page;
   * - afterBooking: "What happens next?" on the booking page;
   * - guarantee: the refund/guarantee card on the programs page.
   */
  promises?: {
    replyTime?: Localized;
    steps?: { title: Localized; text: Localized }[];
    afterBooking?: Localized[];
    guarantee?: { title: Localized; text: Localized };
  };
  images: {
    hero: Picture;
    portrait: Picture;
    /** A map or gym picture for the location card. */
    map?: Picture;
    /**
     * A finished poster of the coach (name lettering included). Shown whole,
     * never cropped: beside the achievements on About and in the home share image.
     */
    poster?: Picture;
  };
  currency: {
    /** ISO 4217 code, e.g. "EGP", "SAR", "AED", "USD". */
    code: string;
    /** How the price is written after the number in each language. */
    label: Localized;
  };
  /** Digits used for Arabic text: "latn" (123) or "arab" (١٢٣). */
  arabicDigits: 'latn' | 'arab';
}

/** Whole parts of the site that can be switched off. */
export interface FeaturesConfig {
  /**
   * The blog (articles in site.config/posts). Off: no blog pages, menu entry
   * or sitemap entries. Articles read as written by the coach, so keep it off
   * until the coach has approved them.
   */
  blog: boolean;
}

export type ColorMode = 'dark' | 'light';

export interface Palette {
  /** Page background. */
  bg: string;
  /** Cards and sheets. */
  surface: string;
  /** Raised elements on top of cards (inputs, chips). */
  surface2: string;
  /** Hairlines and borders. */
  line: string;
  /** Main text. Must reach 4.5:1 on bg and surface. */
  text: string;
  /** Secondary text. Must reach 4.5:1 on bg and surface. */
  muted: string;
  /** The brand colour used as text or icons on this background. */
  accentText: string;
  /**
   * Fill of selected chips, tabs and options. Must reach 3:1 against the
   * page and cards so the selection is visible (WCAG 1.4.11): in the dark
   * palette this is usually the accent itself, in the light one a deep shade.
   */
  selected: string;
  /** Text on top of `selected`. Must reach 4.5:1. */
  onSelected: string;
  /** The warm highlight used as text (error messages, invalid fields). Must reach 4.5:1. */
  hotText: string;
}

export interface ThemeConfig {
  /** Theme a first-time visitor sees. They can switch; the choice is remembered. */
  defaultMode: ColorMode;
  /** Main brand colour, used for buttons and highlights. */
  accent: string;
  /** Text colour on top of the accent (buttons). */
  onAccent: string;
  /** A second, warmer highlight used sparingly (badges, the "popular" tag). */
  hot: string;
  /** Text on top of the hot colour. */
  onHot: string;
  dark: Palette;
  light: Palette;
  /**
   * Fonts are loaded by next/font, which needs them written out in code, so
   * the choice itself lives in src/app/(ar)/cairo.css (Arabic, self-hosted)
   * and src/lib/fonts-en.ts. A unit test checks these names match them.
   */
  fonts: {
    arabic: string;
    latin: string;
    display: string;
  };
}

export type PackageKind = 'in-person' | 'online';

export interface PackageConfig {
  /** Short id, lowercase-with-dashes. Used in links: /book?package=<id>. */
  id: string;
  kind: PackageKind;
  name: Localized;
  /** One line under the name. */
  summary: Localized;
  /** A number, or "on-request" to show "Price on request". */
  price: number | 'on-request';
  /** What the price covers, e.g. "/ month", "one-time", "12 sessions". */
  per: Localized;
  /** Bullet points of what is included. 3–7 reads best. */
  features: Localized[];
  /** Shows the "Most popular" tag. At most one package on the whole site. */
  popular?: boolean;
}

export interface GoalConfig {
  /** Short id, lowercase-with-dashes. */
  id: string;
  label: Localized;
}

export interface BookingConfig {
  /**
   * Days the coach takes sessions. 0 = Sunday … 6 = Saturday. Shown in the
   * order given, so a Saturday-first week is [6, 0, 1, 2, 3, 4].
   */
  days: number[];
  /** Time slots offered in the form. */
  slots: { id: string; label: Localized }[];
  /** Goals: used by the booking form, the transformations filters and the calculators. */
  goals: GoalConfig[];
}

/** One camera angle of a before/after pair. Both pictures the same size (4:5). */
export interface TransformationView {
  /** front, side, back; "clothed" for a dressed before/after; "pose" for a second pose. */
  angle: 'front' | 'side' | 'back' | 'clothed' | 'pose';
  before: Picture;
  after: Picture;
}

/** Extra facts about a story, each shown as a small badge and usable as a filter. */
export type TransformationBadge = 'posture' | 'online' | 'injury' | 'student' | 'contest';

export interface TransformationConfig {
  id: string;
  /** Must be one of booking.goals ids. */
  goal: string;
  /** Extra goal tags (each a goal id), for the filters. */
  tags?: string[];
  badges?: TransformationBadge[];
  /** Short title. Never the client's name unless they asked for it. */
  title: Localized;
  /**
   * The headline result, e.g. "−23 kg" or "+15 kg". Only when the coach's
   * caption gives a number; without it the card shows no result tile.
   */
  result?: Localized;
  /** A second figure, e.g. "108 → 85 kg" or "body fat 26% → 11%". */
  detail?: Localized;
  /** How long it took, only if known, e.g. "4 months". */
  duration?: Localized;
  /** Stages in between, from the caption, e.g. "23/1: 95 kg, 35% fat". */
  stages?: Localized[];
  /** One or two sentences from the coach's own post. No invented quotes. */
  caption: Localized;
  /** The first view is the one shown first; with more, the slider lets you switch. */
  views: TransformationView[];
  /**
   * Position on the site (lower first): clean, high-resolution, front-facing
   * pairs first, screenshot-quality ones last. Stories without it come last.
   */
  order?: number;
  /** Show on the home page. */
  featured?: boolean;
  /** true for the template's made-up stories. Shows a "Sample" badge. */
  sample: boolean;
}

export interface TestimonialConfig {
  id: string;
  name: Localized;
  /** e.g. "Online coaching · 6 months" */
  context: Localized;
  quote: Localized;
  /** 1–5 */
  rating: number;
  /** true for the template's made-up reviews. Shows a "Sample" badge. */
  sample: boolean;
}

export interface FaqConfig {
  question: Localized;
  answer: Localized;
}
