import path from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import type { Locale } from '../../site.config/types.ts';
import { coach, theme } from './config.ts';
import { dict, fill } from './i18n.ts';
import type { RouteKey } from './routes.ts';

/**
 * Share cards (Open Graph, 1200 × 630) for every page in both languages,
 * rendered at build time with sharp. Text is set by Pango from the bundled
 * font files, which shapes Arabic properly (joined letters, right-to-left
 * word order, correct line breaks), something next/og cannot do. The coach's
 * hero picture fills the far side of the card; colours come from the theme.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const W = OG_SIZE.width;
const H = OG_SIZE.height;
const PAD = 64;
const ART_W = 430;
const TEXT_W = W - ART_W - PAD * 2 + 10;
const FONTS = path.join(process.cwd(), 'src', 'assets', 'fonts');
const FACE = {
  arHeavy: { file: path.join(FONTS, 'Cairo-Black.ttf'), name: 'Cairo Black' },
  arText: { file: path.join(FONTS, 'Cairo-SemiBold.ttf'), name: 'Cairo SemiBold' },
  enHeavy: { file: path.join(FONTS, 'BarlowCondensed-ExtraBoldItalic.ttf'), name: 'Barlow Condensed ExtraBold, Italic' },
  enText: { file: path.join(FONTS, 'BarlowCondensed-SemiBold.ttf'), name: 'Barlow Condensed SemiBold,' },
};

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * A block of text as a transparent PNG, wrapped to `width`. Font names end
 * with a comma so Pango reads the whole thing as the family name ("Barlow
 * Condensed ExtraBold") instead of taking "ExtraBold" as a weight.
 */
const text = async (content: string, { face, size, color, width, lineHeight = 1, rtl }: { face: { file: string; name: string }; size: number; color: string; width: number; lineHeight?: number; rtl: boolean }) => {
  const markup = `<span size="${Math.round(size * 1024 * 0.75)}" foreground="${color}" line_height="${lineHeight}">${escape(content)}</span>`;
  const { data, info } = await sharp({
    text: { text: markup, fontfile: face.file, font: face.name, rgba: true, dpi: 72, width, wrap: 'word', align: rtl ? 'right' : 'left', spacing: 0 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
};

const titleSize = (title: string, rtl: boolean) => {
  const n = title.length;
  if (rtl) return n <= 18 ? 74 : n <= 32 ? 62 : n <= 48 ? 52 : 44;
  return n <= 16 ? 128 : n <= 28 ? 112 : n <= 44 ? 92 : 76;
};

export const renderOg = async ({ lang, eyebrow, title, subtitle }: { lang: Locale; eyebrow: string; title: string; subtitle?: string }): Promise<Buffer> => {
  const rtl = lang === 'ar';
  const heavy = rtl ? FACE.arHeavy : FACE.enHeavy;
  const light = rtl ? FACE.arText : FACE.enText;
  const accent = theme.accent;
  const textColor = theme.dark.text;
  const muted = theme.dark.muted;
  const artX = rtl ? 0 : W - ART_W;
  const fadeDir = rtl ? 'x1="1" x2="0"' : 'x1="0" x2="1"';

  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme.dark.surface}"/><stop offset="1" stop-color="${theme.dark.bg}"/></linearGradient>
      <radialGradient id="glow" cx="${rtl ? 0.85 : 0.15}" cy="0" r="0.8"><stop offset="0" stop-color="${accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 64}" y1="0" x2="${i * 64}" y2="${H}" stroke="#ffffff" stroke-opacity="0.035"/>`).join('')}
    <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${accent}"/>
  </svg>`);

  const art = await sharp(path.join(process.cwd(), 'public', coach.images.hero.src)).resize(ART_W, H, { fit: 'cover', position: 'top' }).toBuffer();
  const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ART_W}" height="${H}"><defs><linearGradient id="f" ${fadeDir} y1="0" y2="0"><stop offset="0" stop-color="${theme.dark.bg}" stop-opacity="1"/><stop offset="0.35" stop-color="${theme.dark.bg}" stop-opacity="0"/></linearGradient></defs><rect width="${ART_W}" height="${H}" fill="url(#f)"/><rect y="${H - 10}" width="${ART_W}" height="10" fill="${accent}"/></svg>`);

  // Brand row: accent badge + name.
  const badge = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" rx="14" fill="${accent}"/><path d="M31 9 15 31h12l-2 16 16-22H29z" fill="${theme.onAccent}"/></svg>`);
  const name = await text(coach.name[lang], { face: heavy, size: 34, color: textColor, width: TEXT_W, rtl });
  const eyebrowImg = await text(rtl ? eyebrow : eyebrow.toUpperCase(), { face: light, size: rtl ? 26 : 28, color: accent, width: TEXT_W, rtl });
  const titleImg = await text(rtl ? title : title.toUpperCase(), { face: heavy, size: titleSize(title, rtl), color: textColor, width: TEXT_W, lineHeight: rtl ? 0.85 : 0.82, rtl });
  const subImg = subtitle ? await text(subtitle, { face: light, size: rtl ? 26 : 30, color: muted, width: TEXT_W, lineHeight: rtl ? 0.85 : 1, rtl }) : null;
  const cta = await text(dict(lang).book.title, { face: heavy, size: rtl ? 26 : 30, color: theme.onAccent, width: 600, rtl });
  const pillW = cta.width + 56;
  const pill = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="60"><rect width="${pillW}" height="60" rx="30" fill="${accent}"/></svg>`);

  // Lay out from the start edge of the text column.
  const start = rtl ? ART_W + PAD - 10 : PAD;
  const end = rtl ? W - PAD : W - ART_W - PAD + 10;
  const at = (width: number) => (rtl ? end - width : start);

  let y = PAD - 6;
  const layers: OverlayOptions[] = [
    { input: art, left: artX, top: 0 },
    { input: fade, left: artX, top: 0 },
    { input: badge, left: rtl ? end - 56 : start, top: y },
    { input: name.input, left: rtl ? end - 56 - 16 - name.width : start + 56 + 16, top: y + Math.round((56 - name.height) / 2) },
  ];
  y = 168;
  layers.push({ input: eyebrowImg.input, left: at(eyebrowImg.width), top: y });
  y += eyebrowImg.height + 14;
  // Keep the title clear of the call to action at the bottom.
  const room = H - 120 - y - (subImg ? subImg.height + 18 : 0);
  const titleBuf = titleImg.height > room ? await sharp(titleImg.input).resize({ height: room, fit: 'inside' }).toBuffer({ resolveWithObject: true }) : { data: titleImg.input, info: { width: titleImg.width, height: titleImg.height } };
  layers.push({ input: titleBuf.data, left: at(titleBuf.info.width), top: y });
  y += titleBuf.info.height + 18;
  if (subImg) layers.push({ input: subImg.input, left: at(subImg.width), top: y });
  layers.push({ input: pill, left: at(pillW), top: H - 60 - 46 });
  layers.push({ input: cta.input, left: at(pillW) + 28, top: H - 60 - 46 + Math.round((60 - cta.height) / 2) });

  return sharp(base).composite(layers).png({ palette: true, quality: 90, effort: 8 }).toBuffer();
};

/** Share card for one of the fixed pages. */
export const routeOg = (lang: Locale, key: RouteKey) => {
  const t = dict(lang);
  const vars = { coach: coach.name[lang], role: coach.role[lang], intro: coach.intro[lang] };
  if (key === 'home') return renderOg({ lang, eyebrow: coach.role[lang], title: coach.headline[lang].split('\n')[0], subtitle: coach.headline[lang].split('\n')[1] });
  const titles: Record<Exclude<RouteKey, 'home'>, string> = {
    transformations: t.transformations.title,
    programs: t.programs.title,
    calculators: t.calculators.title,
    blog: t.blog.title,
    about: fill(t.meta.about.title, vars),
    book: t.book.title,
  };
  const subtitles: Record<Exclude<RouteKey, 'home'>, string> = {
    transformations: t.transformations.eyebrow,
    programs: t.programs.intro.split(/[.،]/)[0],
    calculators: Object.values(t.calculators.tabs).join(' · '),
    blog: t.blog.intro,
    about: coach.role[lang],
    book: t.book.sheetText,
  };
  return renderOg({ lang, eyebrow: t.nav[key], title: titles[key], subtitle: subtitles[key] });
};

export const ogResponse = async (png: Promise<Buffer>) =>
  new Response(new Uint8Array(await png), { headers: { 'Content-Type': OG_CONTENT_TYPE, 'Cache-Control': 'public, max-age=31536000, immutable' } });
