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
  return sharp({ text: { text: markup, fontfile: heavy ? FONT_HEAVY : FONT, font: heavy ? 'Barlow Condensed ExtraBold, Italic' : 'Barlow Condensed SemiBold,', rgba: true, dpi: 72 } })
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

// ------------------------------------------------------- the athlete figure

/**
 * The figure is drawn the way a physique poster is lit: a dark silhouette
 * against a bright backlight, outlined by coloured rim light, with soft
 * highlights where the light catches muscle. No faces, no real bodies:
 * every shape is geometry.
 *
 * 1. `bodyShapes` lays out tapered limbs (wide at the joint they hang from,
 *    narrow at the far end, calves and forearms with a bulge), a sculpted
 *    torso and a head, all in one colour.
 * 2. The `athlete` filter blurs that and thresholds the alpha, which melts
 *    the parts into one organic outline, then derives rim light from the
 *    outline shifted against itself, a glow from the rim, and grain.
 *
 * `b` is the build (so "before" and "after" differ in body shape, not just
 * width) and `pose` is where the arms go: "down", "flex" or "press".
 * Coordinates are on a 1000 × 1250 grid, figure about 7.5 heads tall.
 */

/** A limb segment: a quadrilateral from a circle of radius ra at a to one of radius rb at b, with round ends. */
const taper = ([ax, ay], ra, [bx, by], rb, paint) => {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const p = [
    [ax + nx * ra, ay + ny * ra],
    [bx + nx * rb, by + ny * rb],
    [bx - nx * rb, by - ny * rb],
    [ax - nx * ra, ay - ny * ra],
  ];
  return `<polygon points="${pts(p)}" fill="${paint}"/>${circle(ax, ay, ra, paint)}${circle(bx, by, rb, paint)}`;
};

/** A limb through a bulge: joint → belly of the muscle → far joint. */
const limb = (a, ra, mid, rm, b, rb, paint) => taper(a, ra, mid, rm, paint) + taper(mid, rm, b, rb, paint);

const bodyShapes = (cx, b, pose, paint) => {
  const headY = 248;
  const shY = 372;
  const armpitY = 468;
  const waistY = 600;
  const hipY = 690;
  const crotchY = 742;
  const { shoulder: sh, chest: ch, waist: wa, hip: hp } = b;
  let out = '';
  if (b.ponytail) out += `<ellipse cx="${cx + 40}" cy="${headY + 40}" rx="26" ry="70" transform="rotate(18 ${cx + 40} ${headY + 40})" fill="${paint}"/>`;

  // Legs: thigh from the hip (wide) to the knee, calf bulge, narrow ankle.
  const legX = Math.max(b.thigh * 0.5 + 6, hp - b.thigh * 0.5);
  for (const s of [-1, 1]) {
    const hip = [cx + s * legX, crotchY - 40];
    const knee = [cx + s * (legX - 6), 935];
    const calf = [cx + s * (legX - 2), 1010];
    const ankle = [cx + s * (legX + 4), 1112];
    out += limb(hip, b.thigh * 0.62, [cx + s * (legX + b.quad * 0.25), 830], b.thigh * 0.5 + b.quad * 0.2, knee, b.knee, paint);
    out += limb(knee, b.knee, calf, b.calf, ankle, b.ankle, paint);
    out += taper(ankle, b.ankle, [ankle[0] + s * 34, ankle[1] + 22], b.ankle * 0.8, paint);
  }

  // Torso: traps → deltoid caps → lats in to the waist → hips.
  const side = (s) => [
    [cx + s * b.neck * 0.45, headY + 66],
    [cx + s * sh * 0.62, shY - 4],
    [cx + s * (sh - 6), shY + 22],
    [cx + s * ch, armpitY],
    [cx + s * (ch - (ch - wa) * 0.45), (armpitY + waistY) / 2],
    [cx + s * wa, waistY],
    [cx + s * hp, hipY],
    [cx + s * (hp - 10), crotchY],
  ];
  const l = side(-1);
  const r = side(1).reverse();
  out += `<polygon points="${pts([...l, [cx, crotchY + 8], ...r])}" fill="${paint}"/>`;
  if (b.belly) out += `<ellipse cx="${cx}" cy="${waistY + 10}" rx="${wa + b.belly * 0.3}" ry="${b.belly}" fill="${paint}"/>`;
  if (b.chestMass) for (const s of [-1, 1]) out += `<ellipse cx="${cx + s * ch * 0.45}" cy="${armpitY - 8}" rx="${ch * 0.55}" ry="${b.chestMass}" fill="${paint}"/>`;

  // Neck and head (slightly taller than wide, chin narrower).
  out += taper([cx, headY + 30], b.neck * 0.42, [cx, shY + 8], b.neck * 0.55, paint);
  out += `<ellipse cx="${cx}" cy="${headY}" rx="${b.head * 0.88}" ry="${b.head}" fill="${paint}"/>`;

  // Arms, with a deltoid cap at the shoulder.
  for (const s of [-1, 1]) {
    const shoulder = [cx + s * (sh - b.arm * 0.35), shY + 30];
    let elbow;
    let hand;
    let biceps;
    if (pose === 'flex') {
      elbow = [cx + s * (sh + 160), shY + 34];
      hand = [cx + s * (sh + 150), shY - 150];
      biceps = [cx + s * (sh + 80), shY + 10];
    } else if (pose === 'press') {
      elbow = [cx + s * (sh + 96), shY - 92];
      hand = [cx + s * (sh + 54), shY - 252];
      biceps = [cx + s * (sh + 52), shY - 30];
    } else {
      elbow = [cx + s * (sh + b.armOut), 604];
      hand = [cx + s * (sh + b.armOut + 22), 772];
      biceps = [cx + s * (sh + b.armOut * 0.55), 500];
    }
    out += circle(shoulder[0], shoulder[1], b.delt, paint);
    out += limb(shoulder, b.arm * 0.55, biceps, b.arm * 0.5 + b.bicep * 0.12, elbow, b.arm * 0.36, paint);
    const forearmMid = [(elbow[0] * 2 + hand[0]) / 3, (elbow[1] * 2 + hand[1]) / 3];
    out += limb(elbow, b.arm * 0.36, forearmMid, b.arm * 0.42, hand, b.arm * 0.27, paint);
    out += `<ellipse cx="${hand[0]}" cy="${hand[1]}" rx="${b.arm * 0.36}" ry="${b.arm * 0.44}" fill="${paint}"/>`;
  }
  return out;
};

/**
 * Soft highlights where the rim light catches muscle (after) or soft mass
 * (before). Clipped to the body by the filter.
 */
const bodyLight = (cx, b, pose, color, strength) => {
  const h = (x, y, rx, ry, o = 1, rot = 0) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${(strength * o).toFixed(2)}" transform="rotate(${rot} ${x} ${y})"/>`;
  let out = '';
  for (const s of [-1, 1]) {
    out += h(cx + s * (b.shoulder - 22), 400, b.delt * 0.75, b.delt * 0.5, 0.9, s * 30); // delts
    out += h(cx + s * b.chest * 0.42, 448, b.chest * 0.42, 34, b.chestMass ? 0.8 : 0.4); // pecs
    out += h(cx + s * 34, 560, 26, 70, b.belly ? 0.25 : 0.55); // abs
    out += h(cx + s * (b.thigh * 0.5 + 18), 840, b.quad * 0.6 + 14, 80, 0.6, s * -8); // quads
    if (pose === 'down') out += h(cx + s * (b.shoulder + b.armOut * 0.55), 505, b.arm * 0.32, 50, 0.6, s * -8); // biceps
  }
  return out;
};

const athleteFilter = (id, { rim, rim2, glow }) => `
  <filter id="${id}" x="-25%" y="-15%" width="150%" height="130%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="soft"/>
    <feComponentTransfer in="soft" result="shape"><feFuncA type="linear" slope="14" intercept="-6"/></feComponentTransfer>
    <feComposite in="SourceGraphic" in2="shape" operator="in" result="body"/>
    <feOffset in="shape" dx="9" dy="7" result="o1"/>
    <feComposite in="shape" in2="o1" operator="out" result="e1"/>
    <feGaussianBlur in="e1" stdDeviation="1.2" result="e1s"/>
    <feFlood flood-color="${rim}"/>
    <feComposite in2="e1s" operator="in" result="rim1"/>
    <feOffset in="shape" dx="-6" dy="5" result="o2"/>
    <feComposite in="shape" in2="o2" operator="out" result="e2"/>
    <feGaussianBlur in="e2" stdDeviation="1.6" result="e2s"/>
    <feFlood flood-color="${rim2}" flood-opacity="0.75"/>
    <feComposite in2="e2s" operator="in" result="rim2"/>
    <feGaussianBlur in="rim1" stdDeviation="14" result="halo"/>
    <feFlood flood-color="${glow}" flood-opacity="0.55"/>
    <feComposite in2="halo" operator="in" result="haloc"/>
    <feMerge><feMergeNode in="haloc"/><feMergeNode in="body"/><feMergeNode in="rim2"/><feMergeNode in="rim1"/></feMerge>
  </filter>`;

/** Film grain over the whole picture: fine, colourless, faint. */
const GRAIN = `<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="7" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 -0.36"/>
</filter>
<filter id="hl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>`;

/**
 * A lit stage: deep background, a backlight behind the figure, two light
 * beams from above, a glossy floor with the figure's reflection.
 */
const scene = ({ W, H, cx, light, tint, figure, floorY, beams = true }) => {
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint}"/><stop offset="0.7" stop-color="#060707"/><stop offset="1" stop-color="#030303"/></linearGradient>
    <radialGradient id="back" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stop-color="${light}" stop-opacity="0.55"/><stop offset="0.45" stop-color="${light}" stop-opacity="0.14"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}" stop-opacity="0.22"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient>
    <linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="reflect"><rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#floorfade)"/></mask>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>
    ${GRAIN}`;
  const beamPolys = beams
    ? [
        [cx - 420, cx - 250, cx - 120, cx + 40],
        [cx + 300, cx + 420, cx + 30, cx + 160],
      ]
        .map(([a, b2, c, d]) => `<polygon points="${a},0 ${b2},0 ${d},${floorY} ${c},${floorY}" fill="url(#beam)"/>`)
        .join('')
    : '';
  const body = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${beamPolys}
    <ellipse cx="${cx}" cy="${H * 0.42}" rx="${W * 0.55}" ry="${H * 0.42}" fill="url(#back)"/>
    <ellipse cx="${cx}" cy="${floorY + 6}" rx="${W * 0.38}" ry="26" fill="${light}" opacity="0.10"/>
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="#000" opacity="0.35"/>
    <g mask="url(#reflect)" opacity="0.6"><g transform="translate(0 ${2 * floorY}) scale(1 -1)">${figure}</g></g>
    ${figure}
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.4"/>`;
  return { defs, body };
};

const bodyFill = (id, top, bottom) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="1150"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;

const BUILDS = {
  heavy: { shoulder: 150, chest: 146, waist: 170, hip: 160, belly: 118, thigh: 116, quad: 4, knee: 40, calf: 40, ankle: 22, neck: 82, head: 64, arm: 82, bicep: 6, delt: 40, armOut: 64 },
  slim: { shoulder: 128, chest: 108, waist: 92, hip: 104, thigh: 74, quad: 2, knee: 28, calf: 28, ankle: 17, neck: 54, head: 60, arm: 58, bicep: 2, delt: 26, armOut: 28 },
  average: { shoulder: 150, chest: 136, waist: 140, hip: 138, belly: 64, thigh: 96, quad: 6, knee: 35, calf: 35, ankle: 20, neck: 68, head: 62, arm: 72, bicep: 8, delt: 34, armOut: 46 },
  athlete: { shoulder: 206, chest: 170, waist: 112, hip: 124, chestMass: 40, thigh: 104, quad: 30, knee: 34, calf: 40, ankle: 19, neck: 74, head: 62, arm: 92, bicep: 34, delt: 52, armOut: 52 },
  lean: { shoulder: 186, chest: 156, waist: 114, hip: 124, chestMass: 30, thigh: 96, quad: 20, knee: 33, calf: 36, ankle: 19, neck: 66, head: 62, arm: 82, bicep: 22, delt: 44, armOut: 46 },
  strong: { shoulder: 216, chest: 182, waist: 134, hip: 140, chestMass: 46, thigh: 116, quad: 36, knee: 37, calf: 44, ankle: 21, neck: 84, head: 64, arm: 102, bicep: 40, delt: 58, armOut: 58 },
  womanBefore: { shoulder: 126, chest: 120, waist: 138, hip: 176, belly: 74, thigh: 108, quad: 2, knee: 36, calf: 34, ankle: 18, neck: 50, head: 58, arm: 62, bicep: 2, delt: 28, armOut: 78, ponytail: true },
  womanAfter: { shoulder: 142, chest: 122, waist: 96, hip: 154, thigh: 92, quad: 14, knee: 30, calf: 33, ankle: 17, neck: 50, head: 58, arm: 64, bicep: 10, delt: 32, armOut: 66, ponytail: true },
  womanSoft: { shoulder: 128, chest: 120, waist: 128, hip: 166, belly: 56, thigh: 102, quad: 2, knee: 34, calf: 33, ankle: 18, neck: 50, head: 58, arm: 62, bicep: 2, delt: 28, armOut: 74, ponytail: true },
  womanFit: { shoulder: 140, chest: 120, waist: 104, hip: 150, thigh: 92, quad: 12, knee: 30, calf: 33, ankle: 17, neck: 50, head: 58, arm: 62, bicep: 8, delt: 31, armOut: 64, ponytail: true },
};

/** One lit athlete, ready to place in a scene. */
const litAthlete = (id, cx, build, pose, { rim, rim2, glow, top, bottom, light, lightStrength }) => {
  const b = BUILDS[build];
  const defs = athleteFilter(`f-${id}`, { rim, rim2, glow }) + bodyFill(`g-${id}`, top, bottom);
  const figure = `<g filter="url(#f-${id})">${bodyShapes(cx, b, pose, `url(#g-${id})`)}<g filter="url(#hl)">${bodyLight(cx, b, pose, light, lightStrength)}</g></g>`;
  return { defs, figure };
};

const transformationArt = async (id, number, beforeBuild, afterBuild, hue) => {
  const W = 1000;
  const H = 1250;
  const cx = W / 2;
  const floorY = 1138;
  const ticks = (color) =>
    `<line x1="70" y1="160" x2="70" y2="${floorY - 40}" stroke="${color}" stroke-opacity="0.35" stroke-width="2"/>` +
    Array.from({ length: 20 }, (_, i) => `<line x1="70" y1="${160 + i * 48}" x2="${i % 2 ? 80 : 90}" y2="${160 + i * 48}" stroke="${color}" stroke-opacity="0.35" stroke-width="2"/>`).join('');
  const make = async (which, build, look) => {
    const a = litAthlete(`${id}-${which}`, cx, build, 'down', look);
    const s = scene({ W, H, cx, light: look.backlight, tint: look.tint, figure: a.figure, floorY });
    const big = await label(number, { size: 240, color: look.numberColor, alpha: 0.09, heavy: true });
    await write(`transformations/${id}-${which}.webp`, svg(W, H, `${s.body}${ticks(look.backlight)}`, s.defs + a.defs), [{ input: big, left: W - 300, top: 36 }, await caption(W, H, 'SAMPLE ART · 1000×1250')], 74);
  };
  // Before: cool, flat light. After: the brand's light, warmer and brighter.
  await make('before', beforeBuild, { rim: '#B9C6D6', rim2: '#5B6B80', glow: '#8FA3BF', top: '#2A2F36', bottom: '#14171B', light: '#9FB2C8', lightStrength: 0.16, backlight: '#7D8EA6', tint: '#151A21', numberColor: '#FFFFFF' });
  await make('after', afterBuild, { rim: ACCENT, rim2: hue[1], glow: ACCENT, top: '#20271A', bottom: '#0E110B', light: ACCENT, lightStrength: 0.3, backlight: hue[1], tint: hue[0], numberColor: ACCENT });
};

// ------------------------------------------------------------- hero (press)

const barbell = (cx, y, plate) => {
  let out = line([[cx - 470, y], [cx + 470, y]], 16, '#B9BEB5');
  for (const s of [-1, 1]) {
    out += `<rect x="${cx + s * 400 - 34}" y="${y - 150}" width="68" height="300" rx="16" fill="${plate}"/>`;
    out += `<rect x="${cx + s * 400 - 34}" y="${y - 150}" width="68" height="300" rx="16" fill="url(#plateShade)"/>`;
    out += `<rect x="${cx + s * 332 - 22}" y="${y - 110}" width="44" height="220" rx="12" fill="${plate}" opacity="0.85"/>`;
    out += `<rect x="${cx + s * 290 - 10}" y="${y - 34}" width="20" height="68" rx="6" fill="#C9CEC4"/>`;
  }
  return out;
};

const coachArt = async ({ file, pose, build, rim, rim2, light, tint, word, wordColor, withBar, captionText }) => {
  const W = 1200;
  const H = 1500;
  const cx = 500; // figure grid, placed with a transform
  const floorY = 1140;
  const a = litAthlete(file, cx, build, pose, { rim, rim2, glow: rim, top: '#1E2319', bottom: '#0B0D0A', light: rim, lightStrength: 0.28 });
  // Scaled down a little so the raised bar and hands fit, feet on the floor.
  const figure = `<g transform="translate(75 175) scale(0.85)">${a.figure}${withBar ? barbell(cx, 122, rim) : ''}</g>`;
  const s = scene({ W: 1000, H: 1250, cx, light, tint, figure, floorY });
  const defs = `${s.defs}${a.defs}<linearGradient id="plateShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>`;
  // The 1000 × 1250 stage scaled to 1200 × 1500.
  const body = `<g transform="scale(1.2)">${s.body}</g>`;
  const big = await label(word, { size: 230, color: wordColor, alpha: 0.08, heavy: true, spacing: 4 });
  const meta = await sharp(big).metadata();
  await write(`coach/${file}.webp`, svg(W, H, body, defs), [{ input: big, left: Math.round((W - meta.width) / 2), top: 40 }, await caption(W, H, captionText)], 76);
};

const hero = () =>
  coachArt({ file: 'hero', pose: 'press', build: 'athlete', rim: ACCENT, rim2: '#FFFFFF', light: ACCENT, tint: '#11160C', word: 'STRONGER', wordColor: '#FFFFFF', withBar: true, captionText: 'SAMPLE ART · REPLACE WITH COACH PHOTO · 1200×1500' });

// ------------------------------------------------- portrait (double biceps)

const portrait = () =>
  coachArt({ file: 'portrait', pose: 'flex', build: 'strong', rim: HOT, rim2: ACCENT, light: HOT, tint: '#1A0E0A', word: 'COACH', wordColor: HOT, withBar: false, captionText: 'SAMPLE ART · REPLACE WITH COACH PORTRAIT · 1200×1500' });

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
