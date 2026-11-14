/**
 * Generates the template's sample artwork: no photos of real people, only
 * drawn athlete pictograms, a drawn map and abstract blog covers, in the
 * default theme's colours. Run with `npm run images`; output goes to
 * public/images/. Replace these files with the coach's real pictures at the
 * same sizes (README, "Images").
 *
 *   coach/hero.webp         1200 × 1500   home hero
 *   coach/portrait.webp     1200 × 1500   about page
 *   coach/map.webp          1600 × 1000   about page, location card
 *   transformations/*.webp  1000 × 1250   before/after pairs (4:5)
 *   blog/*.webp             1600 × 900    article covers (16:9)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'images');
const FONT = path.join(ROOT, 'src', 'assets', 'fonts', 'BarlowCondensed-SemiBold.ttf');
const FONT_HEAVY = path.join(ROOT, 'src', 'assets', 'fonts', 'BarlowCondensed-ExtraBoldItalic.ttf');

const ACCENT = '#D4FF3A';
const ACCENT_2 = '#7CE85A';
const HOT = '#FF6A3D';
const INK = '#0A0B0D';
const BONE = '#F3F5EF';

// ---------------------------------------------------------------- helpers

const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const line = (list, width, color, extra = '') =>
  `<polyline points="${pts(list)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (x, y, r, color, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;

/** Deterministic random numbers, so every run draws the same pictures. */
const rng = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const grid = (w, h, step, color) => {
  let out = '';
  for (let x = step; x < w; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1"/>`;
  for (let y = step; y < h; y += step) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
  return out;
};

const svg = (w, h, body, defs = '') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`);

/** A line of text set by Pango (real font, real kerning), as an overlay. */
const label = async (text, { size, color = BONE, alpha = 1, heavy = false, spacing = 0 }) => {
  const pt = Math.round(size * 1024 * 0.75);
  const markup = `<span size="${pt}" foreground="${color}" ${alpha < 1 ? `alpha="${Math.round(alpha * 100)}%"` : ''} letter_spacing="${Math.round(spacing * 1024)}">${text}</span>`;
  return sharp({ text: { text: markup, fontfile: heavy ? FONT_HEAVY : FONT, font: heavy ? 'Barlow Condensed ExtraBold Italic' : 'Barlow Condensed SemiBold', rgba: true, dpi: 72 } })
    .png()
    .toBuffer();
};

const write = async (file, base, overlays = [], quality = 78) => {
  const full = path.join(OUT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  await sharp(base).composite(overlays).webp({ quality, effort: 6, smartSubsample: true }).toFile(full);
  const { size } = fs.statSync(full);
  console.log(`  ${file.padEnd(44)} ${(size / 1024).toFixed(0).padStart(4)} KB`);
};

/** Corner caption that marks a picture as sample art, with its exact size. */
const caption = async (w, h, text) => {
  const img = await label(text, { size: 22, color: BONE, alpha: 0.55, spacing: 2 });
  const { width, height } = await sharp(img).metadata();
  return { input: img, left: w - width - 36, top: h - height - 30 };
};

// ------------------------------------------------------- the front figure

/**
 * An athlete seen from the front, in pictogram style: a curved torso, a
 * round head, tapered limbs drawn as thick rounded strokes. Drawn on a
 * 1000 × 1250 grid (7.5 heads tall). `b` is the build, so the same pose can
 * be drawn "before" (narrow shoulders, wide waist) and "after" (V-taper);
 * `pose` is where the arms go: "down", "flex" (double biceps) or "press".
 */
const frontFigure = (cx, b, paint, detail, pose = 'down') => {
  const headY = 250;
  const neckY = headY + b.head - 6;
  const shY = 372; // top of the shoulders
  const armpitY = 470;
  const waistY = 590;
  const hipY = 680;
  const crotchY = 724;
  const { shoulder: sh, chest: ch, waist: wa, hip: hp } = b;
  let out = '';
  // Ponytail sits behind the head.
  if (b.ponytail) out += `<ellipse cx="${cx + 54}" cy="${headY + 6}" rx="30" ry="74" transform="rotate(30 ${cx + 54} ${headY + 6})" fill="${paint}"/>`;

  // Legs: tapered strokes, thighs heavier than shins, a gap between them.
  const legX = Math.max(b.thigh / 2 + 10, hp - b.thigh / 2 + 6);
  for (const s of [-1, 1]) {
    const top = [cx + s * legX, crotchY - 30];
    const knee = [cx + s * (legX + 4), 925];
    const ankle = [cx + s * (legX + 12), 1112];
    out += line([top, knee], b.thigh, paint);
    out += line([[knee[0], knee[1] - 30], ankle], b.shin, paint);
    out += line([ankle, [ankle[0] + s * 44, ankle[1] + 14]], b.shin * 0.62, paint);
  }

  // Torso: neck → trapezius → round deltoid → armpit → lats in to the waist
  // → out to the hips → straight across at the crotch.
  const side = (s) => [
    `${cx + s * b.neck * 0.5} ${neckY}`,
    `C ${cx + s * (sh * 0.55)} ${shY - 4}, ${cx + s * (sh - 30)} ${shY - 4}, ${cx + s * (sh - 8)} ${shY + 10}`,
    `Q ${cx + s * (sh + 10)} ${shY + 24}, ${cx + s * sh} ${shY + 64}`,
    `L ${cx + s * ch} ${armpitY}`,
    `C ${cx + s * ch} ${armpitY + 50}, ${cx + s * wa} ${waistY - 50}, ${cx + s * wa} ${waistY}`,
    `C ${cx + s * wa} ${waistY + 40}, ${cx + s * hp} ${hipY - 40}, ${cx + s * hp} ${hipY}`,
    `L ${cx + s * (hp - 6)} ${crotchY}`,
  ];
  const l = side(-1);
  const r = side(1);
  const torso = `M ${l[0]} ${l.slice(1).join(' ')} L ${cx} ${crotchY + 6} L ${r[6].slice(2)} L ${cx + hp} ${hipY}
    C ${cx + hp} ${hipY - 40}, ${cx + wa} ${waistY + 40}, ${cx + wa} ${waistY}
    C ${cx + wa} ${waistY - 50}, ${cx + ch} ${armpitY + 50}, ${cx + ch} ${armpitY}
    L ${cx + sh} ${shY + 64} Q ${cx + sh + 10} ${shY + 24}, ${cx + sh - 8} ${shY + 10}
    C ${cx + sh - 30} ${shY - 4}, ${cx + sh * 0.55} ${shY - 4}, ${cx + b.neck * 0.5} ${neckY} Z`;
  out += `<path d="${torso}" fill="${paint}" stroke="${paint}" stroke-width="6" stroke-linejoin="round"/>`;
  if (b.belly) out += `<ellipse cx="${cx}" cy="${waistY + 6}" rx="${wa + b.belly * 0.35}" ry="${b.belly}" fill="${paint}"/>`;

  // Neck and head.
  out += line([[cx, headY + 20], [cx, shY + 10]], b.neck, paint);
  out += circle(cx, headY, b.head, paint);

  // Arms.
  for (const s of [-1, 1]) {
    const shoulder = [cx + s * (sh - b.arm * 0.42), shY + 40];
    let elbow;
    let hand;
    if (pose === 'flex') {
      elbow = [cx + s * (sh + 150), shY + 30];
      hand = [cx + s * (sh + 140), shY - 160];
    } else if (pose === 'press') {
      elbow = [cx + s * (sh + 96), shY - 90];
      hand = [cx + s * (sh + 58), shY - 250];
    } else {
      elbow = [cx + s * (sh + b.armOut), 600];
      hand = [cx + s * (sh + b.armOut + 30), 768];
    }
    out += circle(shoulder[0], shoulder[1], b.arm * 0.62, paint);
    out += line([shoulder, elbow], b.arm, paint);
    out += line([elbow, hand], b.forearm, paint);
    out += circle(hand[0], hand[1], b.forearm * 0.62, paint);
    if (pose === 'flex') out += `<ellipse cx="${cx + s * (sh + 74)}" cy="${shY + 6}" rx="${b.arm * 0.9}" ry="${b.arm * 0.72}" fill="${paint}"/>`;
  }

  // Muscle definition: a few strokes in a darker tone.
  if (detail) {
    const d = (list, w = 6) => line(list, w, detail, 'opacity="0.5"');
    out += d([[cx - ch + 18, armpitY + 6], [cx - 34, armpitY + 26], [cx - 4, armpitY + 8]]);
    out += d([[cx + ch - 18, armpitY + 6], [cx + 34, armpitY + 26], [cx + 4, armpitY + 8]]);
    out += d([[cx, armpitY + 40], [cx, hipY + 10]], 5);
    for (const y of [armpitY + 78, armpitY + 124, armpitY + 170]) {
      out += d([[cx - 42, y], [cx - 12, y + 5]], 5);
      out += d([[cx + 42, y], [cx + 12, y + 5]], 5);
    }
    for (const s of [-1, 1]) out += d([[cx + s * (wa - 6), waistY + 30], [cx + s * 40, hipY + 34]], 5);
  }
  return out;
};

const BUILDS = {
  heavy: { shoulder: 150, chest: 150, waist: 168, hip: 158, belly: 112, arm: 50, forearm: 42, thigh: 104, shin: 70, neck: 74, head: 62, armOut: 64 },
  slim: { shoulder: 132, chest: 112, waist: 96, hip: 108, arm: 40, forearm: 34, thigh: 72, shin: 54, neck: 50, head: 60, armOut: 30 },
  average: { shoulder: 156, chest: 138, waist: 138, hip: 136, belly: 64, arm: 48, forearm: 42, thigh: 90, shin: 64, neck: 64, head: 62, armOut: 48 },
  athlete: { shoulder: 204, chest: 168, waist: 112, hip: 124, arm: 66, forearm: 52, thigh: 96, shin: 66, neck: 66, head: 62, armOut: 50 },
  lean: { shoulder: 186, chest: 154, waist: 112, hip: 124, arm: 58, forearm: 48, thigh: 90, shin: 64, neck: 62, head: 62, armOut: 44 },
  strong: { shoulder: 214, chest: 178, waist: 134, hip: 140, arm: 72, forearm: 58, thigh: 108, shin: 72, neck: 76, head: 64, armOut: 58 },
  womanBefore: { shoulder: 128, chest: 124, waist: 138, hip: 172, belly: 70, arm: 40, forearm: 34, thigh: 96, shin: 62, neck: 48, head: 58, armOut: 52, ponytail: true },
  womanAfter: { shoulder: 142, chest: 124, waist: 96, hip: 152, arm: 44, forearm: 36, thigh: 84, shin: 58, neck: 48, head: 58, armOut: 44, ponytail: true },
  womanSoft: { shoulder: 128, chest: 122, waist: 128, hip: 164, belly: 52, arm: 40, forearm: 34, thigh: 92, shin: 60, neck: 48, head: 58, armOut: 50, ponytail: true },
  womanFit: { shoulder: 140, chest: 122, waist: 104, hip: 150, arm: 43, forearm: 36, thigh: 84, shin: 58, neck: 48, head: 58, armOut: 44, ponytail: true },
};

const transformationArt = async (id, number, beforeBuild, afterBuild, hue) => {
  const W = 1000;
  const H = 1250;
  const cx = W / 2;
  const scan = (color, opacity) =>
    [372, 590, 724]
      .map((y) => `<line x1="80" y1="${y}" x2="${W - 80}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2" stroke-dasharray="4 10"/>`)
      .join('') +
    `<line x1="80" y1="140" x2="80" y2="${H - 140}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>` +
    Array.from({ length: 20 }, (_, i) => `<line x1="80" y1="${140 + i * 50}" x2="${i % 2 ? 92 : 104}" y2="${140 + i * 50}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>`).join('');

  const beforeDefs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23262B"/><stop offset="1" stop-color="#121417"/></linearGradient>
    <linearGradient id="fig" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="1200"><stop offset="0" stop-color="#8C9199"/><stop offset="1" stop-color="#5C6168"/></linearGradient>`;
  const before = svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${grid(W, H, 50, '#FFFFFF08')}${scan('#FFFFFF', 0.16)}
     <ellipse cx="${cx}" cy="1140" rx="250" ry="24" fill="#000" opacity="0.35"/>
     ${frontFigure(cx, BUILDS[beforeBuild], 'url(#fig)', null)}`,
    beforeDefs,
  );
  const afterDefs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hue[0]}"/><stop offset="1" stop-color="#08090A"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.45" r="0.5"><stop offset="0" stop-color="${hue[1]}" stop-opacity="0.30"/><stop offset="1" stop-color="${hue[1]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="fig" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="1200"><stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${hue[1]}"/></linearGradient>`;
  const after = svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>${grid(W, H, 50, '#D4FF3A0D')}${scan(ACCENT, 0.3)}
     <ellipse cx="${cx}" cy="1140" rx="250" ry="24" fill="#000" opacity="0.5"/>
     ${frontFigure(cx, BUILDS[afterBuild], 'url(#fig)', '#1C2A05')}`,
    afterDefs,
  );
  const big = async (color, alpha) => {
    const img = await label(number, { size: 240, color, alpha, heavy: true });
    return { input: img, left: W - 290, top: 40 };
  };
  const cap = await caption(W, H, 'SAMPLE ART · 1000×1250');
  await write(`transformations/${id}-before.webp`, before, [await big('#FFFFFF', 0.06), cap]);
  await write(`transformations/${id}-after.webp`, after, [await big(ACCENT, 0.1), cap]);
};

// ------------------------------------------------------------- hero (press)

const barbell = (cx, y, plate) => {
  let out = line([[cx - 470, y], [cx + 470, y]], 18, '#C9CEC4');
  for (const s of [-1, 1]) {
    out += `<rect x="${cx + s * 400 - 34}" y="${y - 150}" width="68" height="300" rx="16" fill="${plate}"/>`;
    out += `<rect x="${cx + s * 332 - 22}" y="${y - 110}" width="44" height="220" rx="12" fill="${plate}" opacity="0.8"/>`;
    out += `<rect x="${cx + s * 290 - 10}" y="${y - 34}" width="20" height="68" rx="6" fill="#C9CEC4"/>`;
  }
  return out;
};

/** Shared background for the two coach pictures: glow, stripes, rings. */
const stage = (W, H, glow) => {
  const stripes = Array.from({ length: 9 }, (_, i) => {
    const x = -300 + i * 70;
    return `<polygon points="${x},${H} ${x + 34},${H} ${x + 34 + 900},0 ${x + 900},0" fill="${glow}" opacity="${0.04 + (i % 3) * 0.02}"/>`;
  }).join('');
  return `<rect width="${W}" height="${H}" fill="url(#bg)"/>${stripes}<rect width="${W}" height="${H}" fill="url(#glow)"/>${grid(W, H, 60, '#FFFFFF07')}`;
};

const coachDefs = (glow) => `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15181B"/><stop offset="1" stop-color="#060708"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="${glow}" stop-opacity="0.42"/><stop offset="0.55" stop-color="${glow}" stop-opacity="0.06"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fig" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="1150"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C3C8BE"/></linearGradient>
  <linearGradient id="echo" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="1150"><stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT_2}"/></linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>`;

const hero = async () => {
  const W = 1200;
  const H = 1500;
  // The figure is drawn on the 1000 × 1250 grid and scaled up 1.12×.
  const place = (inner) => `<g transform="translate(40 150) scale(1.12)">${inner}</g>`;
  const body = `${stage(W, H, ACCENT)}
    <circle cx="600" cy="660" r="440" fill="none" stroke="${ACCENT}" stroke-opacity="0.22" stroke-width="3"/>
    <circle cx="600" cy="660" r="530" fill="none" stroke="${ACCENT}" stroke-opacity="0.10" stroke-width="2" stroke-dasharray="6 14"/>
    <ellipse cx="600" cy="1418" rx="320" ry="30" fill="#000" opacity="0.6"/>
    ${place(`<g transform="translate(-18 14)" filter="url(#soft)">${frontFigure(500, BUILDS.athlete, 'url(#echo)', null, 'press')}</g>
      ${frontFigure(500, BUILDS.athlete, 'url(#fig)', '#5A6052', 'press')}
      ${barbell(500, 122, ACCENT)}`)}`;
  const word = await label('STRONGER', { size: 210, color: '#FFFFFF', alpha: 0.05, heavy: true, spacing: 4 });
  const meta = await sharp(word).metadata();
  await write(
    'coach/hero.webp',
    svg(W, H, body, coachDefs(ACCENT)),
    [{ input: word, left: Math.round((W - meta.width) / 2), top: 1110 }, await caption(W, H, 'SAMPLE ART · REPLACE WITH COACH PHOTO · 1200×1500')],
    80,
  );
};

// ------------------------------------------------- portrait (double biceps)

const portrait = async () => {
  const W = 1200;
  const H = 1500;
  const place = (inner) => `<g transform="translate(40 150) scale(1.12)">${inner}</g>`;
  const body = `${stage(W, H, HOT)}
    <circle cx="600" cy="640" r="420" fill="${HOT}" opacity="0.07"/>
    <ellipse cx="600" cy="1418" rx="320" ry="30" fill="#000" opacity="0.6"/>
    ${place(`<g transform="translate(16 12)" filter="url(#soft)">${frontFigure(500, BUILDS.strong, HOT, null, 'flex')}</g>
      ${frontFigure(500, BUILDS.strong, 'url(#fig)', '#5A6052', 'flex')}`)}`;
  const word = await label('COACH', { size: 260, color: HOT, alpha: 0.1, heavy: true });
  const meta = await sharp(word).metadata();
  await write(
    'coach/portrait.webp',
    svg(W, H, body, coachDefs(HOT)),
    [{ input: word, left: Math.round((W - meta.width) / 2), top: 40 }, await caption(W, H, 'SAMPLE ART · REPLACE WITH COACH PORTRAIT · 1200×1500')],
    80,
  );
};

// ------------------------------------------------------------------- map

const map = async () => {
  const W = 1600;
  const H = 1000;
  const r = rng(7);
  let roads = '';
  for (let i = 0; i < 16; i++) {
    const y = i * 70 + r() * 30;
    roads += `<line x1="0" y1="${y}" x2="${W}" y2="${y + 120 - r() * 240}" stroke="#262A30" stroke-width="${i % 5 === 0 ? 16 : 6}"/>`;
  }
  for (let i = 0; i < 22; i++) {
    const x = i * 76 + r() * 30;
    roads += `<line x1="${x}" y1="0" x2="${x + 140 - r() * 280}" y2="${H}" stroke="#262A30" stroke-width="${i % 6 === 0 ? 16 : 6}"/>`;
  }
  const body = `<rect width="${W}" height="${H}" fill="#111316"/>
    <path d="M0 760 C 300 700, 520 860, 820 800 S 1300 640, 1600 700 L1600 820 C 1300 760, 1100 900, 820 920 S 300 840, 0 880 Z" fill="#12202B"/>
    <polygon points="1040,140 1300,110 1340,330 1080,360" fill="#17241A" stroke="#1E2E20" stroke-width="4"/>
    <polygon points="160,180 360,160 380,330 190,350" fill="#17241A" stroke="#1E2E20" stroke-width="4"/>
    ${roads}
    <path d="M -20 520 C 400 470, 900 600, 1620 430" stroke="#3A3F46" stroke-width="26" fill="none"/>
    <path d="M -20 520 C 400 470, 900 600, 1620 430" stroke="#F3F5EF" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="18 18" fill="none"/>
    <circle cx="800" cy="500" r="190" fill="${ACCENT}" opacity="0.06"/>
    <circle cx="800" cy="500" r="120" fill="${ACCENT}" opacity="0.10"/>
    <circle cx="800" cy="500" r="60" fill="${ACCENT}" opacity="0.18"/>
    <ellipse cx="800" cy="512" rx="34" ry="10" fill="#000" opacity="0.5"/>
    <path d="M800 510 C 770 460, 740 440, 740 400 A 60 60 0 1 1 860 400 C 860 440, 830 460, 800 510 Z" fill="${ACCENT}"/>
    <circle cx="800" cy="398" r="22" fill="${INK}"/>`;
  await write('coach/map.webp', svg(W, H, body), [await caption(W, H, 'SAMPLE MAP · 1600×1000')]);
};

// ------------------------------------------------------------ blog covers

const cover = async (slug, scene, tint) => {
  const W = 1600;
  const H = 900;
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="#08090A"/></linearGradient>
    <radialGradient id="glow" cx="0.68" cy="0.5" r="0.5"><stop offset="0" stop-color="${ACCENT}" stop-opacity="0.22"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>`;
  await write(
    `blog/${slug}.webp`,
    svg(W, H, `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>${grid(W, H, 64, '#FFFFFF08')}${scene}`, defs),
    [await caption(W, H, 'SAMPLE COVER · 1600×900')],
  );
};

const arc = (cx, cy, r, from, to) => {
  const a = (deg) => [cx + r * Math.cos(((deg - 90) * Math.PI) / 180), cy + r * Math.sin(((deg - 90) * Math.PI) / 180)];
  const [x1, y1] = a(from);
  const [x2, y2] = a(to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

const covers = async () => {
  // Protein: a plate as a donut chart.
  await cover(
    'protein-how-much',
    `<circle cx="1080" cy="450" r="300" fill="#16191C" stroke="#2A2E34" stroke-width="6"/>
     <path d="${arc(1080, 450, 220, 0, 150)}" stroke="${ACCENT}" stroke-width="90" fill="none"/>
     <path d="${arc(1080, 450, 220, 156, 270)}" stroke="${HOT}" stroke-width="90" fill="none"/>
     <path d="${arc(1080, 450, 220, 276, 354)}" stroke="#F3F5EF" stroke-width="90" fill="none" opacity="0.8"/>
     <line x1="690" y1="230" x2="690" y2="680" stroke="#C9CEC4" stroke-width="16" stroke-linecap="round"/>
     <line x1="1470" y1="230" x2="1470" y2="680" stroke="#C9CEC4" stroke-width="16" stroke-linecap="round"/>
     ${[0, 1, 2].map((i) => `<line x1="${670 + i * 20}" y1="230" x2="${670 + i * 20}" y2="330" stroke="#C9CEC4" stroke-width="8" stroke-linecap="round"/>`).join('')}`,
    '#1D2410',
  );
  // Fat loss: a line chart going down, steadily.
  const xs = [260, 420, 580, 740, 900, 1060, 1220, 1380];
  const ys = [250, 300, 285, 380, 430, 420, 520, 600];
  await cover(
    'fat-loss-without-starving',
    `${xs.map((x, i) => `<rect x="${x - 40}" y="${ys[i] + 40}" width="80" height="${760 - ys[i]}" rx="14" fill="#FFFFFF" opacity="${0.04 + i * 0.012}"/>`).join('')}
     ${line(xs.map((x, i) => [x, ys[i]]), 14, ACCENT)}
     ${xs.map((x, i) => circle(x, ys[i], i === xs.length - 1 ? 26 : 14, i === xs.length - 1 ? ACCENT : INK, `stroke="${ACCENT}" stroke-width="8"`)).join('')}
     <line x1="200" y1="760" x2="1440" y2="760" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="4"/>`,
    '#24150F',
  );
  // Beginner plan: a loaded barbell and three training days.
  await cover(
    'beginner-full-body',
    `<g transform="rotate(-12 800 450)">${barbell(800, 450, ACCENT)}</g>
     ${[0, 1, 2].map((i) => `<rect x="${600 + i * 150}" y="720" width="110" height="60" rx="18" fill="${i === 1 ? HOT : ACCENT}" opacity="0.9"/>`).join('')}`,
    '#10202A',
  );
  // Sleep: a moon and sleep cycles.
  const starRng = rng(4242);
  const stars = () => starRng();
  const wave = Array.from({ length: 9 }, (_, i) => `${i === 0 ? 'M' : 'S'} ${180 + i * 160} ${i % 2 ? 640 : 760}, ${260 + i * 160} ${i % 2 ? 700 : 700}`).join(' ');
  await cover(
    'sleep-the-multiplier',
    `<circle cx="1120" cy="330" r="190" fill="${ACCENT}"/><circle cx="1210" cy="270" r="170" fill="#0D1220"/>
     ${Array.from({ length: 26 }, () => {
       const r = stars;
       return circle(Math.round(120 + r() * 1360), Math.round(80 + r() * 420), (r() * 3 + 1.5).toFixed(1), '#F3F5EF', `opacity="${(0.3 + r() * 0.6).toFixed(2)}"`);
     }).join('')}
     <path d="${wave}" stroke="${ACCENT}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/>`,
    '#0D1220',
  );
};

// ---------------------------------------------------------------- run all

console.log('Generating sample artwork into public/images/');
await hero();
await portrait();
await map();
await transformationArt('sample-01', '01', 'heavy', 'lean', ['#141A0C', '#7CE85A']);
await transformationArt('sample-02', '02', 'womanBefore', 'womanAfter', ['#1A1410', '#FFB13D']);
await transformationArt('sample-03', '03', 'slim', 'athlete', ['#0C1418', '#3DDCFF']);
await transformationArt('sample-04', '04', 'womanSoft', 'womanFit', ['#18101A', '#FF7AC8']);
await transformationArt('sample-05', '05', 'average', 'strong', ['#1A0E0C', HOT]);
await transformationArt('sample-06', '06', 'heavy', 'athlete', ['#101418', ACCENT_2]);
await covers();
console.log('Done.');
