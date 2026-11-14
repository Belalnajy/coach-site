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
   * It puts a small "sample content" notice in the footer. Set it to false
   * only after every sample (results, reviews, photos) has been replaced.
   */
  sample: boolean;
  /** Public address of the site, no trailing slash. Used for SEO links. */
  siteUrl: string;
  /** Full name, e.g. "Coach Adam" / "الكابتن آدم". */
  name: Localized;
  /** Shortest form, used in the logo and the WhatsApp greeting. */
  shortName: Localized;
  /** What the coach does, in a few words. */
  role: Localized;
  /** Hero headline. Keep it under ~40 characters per line. */
  headline: Localized;
  /** One or two sentences under the headline. */
  intro: Localized;
  /** About page story. */
  story: LocalizedParagraphs;
  /** Short philosophy points shown on the About page. */
  principles: { title: Localized; text: Localized }[];
  /** International number for WhatsApp, digits only, e.g. "201001234567". */
  whatsapp: string;
  email?: string;
  stats: {
    yearsExperience: number;
    clients: number;
    transformations: number;
  };
  certifications: Certification[];
  location: {
    gym: Localized;
    address: Localized;
    city: Localized;
    /** ISO country code, e.g. "EG", "SA", "AE". */
    country: string;
    /** Any Google Maps (or other) link to the gym. */
    mapUrl: string;
    geo?: { lat: number; lng: number };
    /** Human-readable opening hours. */
    hours: Localized;
    /** Machine-readable hours for search engines, schema.org format. */
    openingHours: string[];
  };
  socials: Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x', string>>;
  images: {
    hero: Picture;
    portrait: Picture;
    map: Picture;
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
   * the choice itself lives in src/lib/fonts-ar.ts and fonts-en.ts. These names are
   * only used to check that file and the config agree.
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
  /** Shows the "Most popular" tag. At most one per kind. */
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

export interface TransformationConfig {
  id: string;
  /** Must be one of booking.goals ids. */
  goal: string;
  /** Extra filter tags, e.g. "women". Each must be a goal id too. */
  tags?: string[];
  /** Display name. With real clients: first name or initials, with consent. */
  client: Localized;
  /** How long the change took, e.g. "12 weeks". */
  duration: Localized;
  /** The headline result, e.g. "−9 kg" or "−6% body fat". */
  result: Localized;
  /** A second figure, optional, e.g. "waist −11 cm". */
  detail?: Localized;
  quote: Localized;
  before: Picture;
  after: Picture;
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
