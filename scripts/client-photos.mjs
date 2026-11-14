/**
 * Client before/after pictures from the coach's own public posts (originals
 * in assets-src/clients/, kept on the owner's machine and not published).
 *
 * The WHOLE photos are shown, as posted: each side-by-side post is split at
 * its seam into the before and the after photo, with only the app's UI taken
 * away (status bar, caption, like row, the "1/3" counter and the bottom
 * icons). Nothing is cropped in on the person.
 *
 * Both photos of a view are at the same height (the post's), and are placed
 * centred on one common canvas as wide as the wider of the two, so the
 * slider compares them at the same scale and position. Any spare width at
 * the sides is filled with a blurred, darkened copy of the same photo.
 * Native resolution, never upscaled.
 *
 * Which half is before was judged from the bodies, not the position: the
 * coach's posts are not consistent (see `flipped`). Faces are kept as posted.
 * Re-run with `node scripts/client-photos.mjs`; it prints each view's size
 * for site.config/transformations.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'clients');
const OUT = path.join(ROOT, 'public', 'images', 'transformations');

/**
 * id → views. `band` is the photo area of the post [top, bottom], already
 * clear of the app's UI (for Instagram, the bottom icons are left out); each
 * half's x0–x1 is that photo's width, either side of the seam.
 */
export const PAIRS = {
  // 108 → 85 kg; faces covered with emoji as posted. Left = after.
  m01: [{ angle: 'front', file: 'ec351cb2-image.jpg', band: [0, 1921], flipped: true, after: { x0: 16, x1: 718 }, before: { x0: 722, x1: 1440 } }],
  // 80 → 72 kg. Front: left = after. Back: left = before.
  m02: [
    { angle: 'front', file: 'd04f92e4-image.jpg', band: [0, 1564], flipped: true, after: { x0: 0, x1: 886 }, before: { x0: 890, x1: 1564 } },
    { angle: 'back', file: 'cd1feecc-image.jpg', band: [0, 1564], before: { x0: 0, x1: 727 }, after: { x0: 731, x1: 1564 } },
  ],
  // 100 → 80 kg, posture fixed. Side view; left = after.
  m03: [{ angle: 'side', file: 'ed015eef-image.jpg', band: [660, 1725], flipped: true, after: { x0: 0, x1: 537 }, before: { x0: 541, x1: 1080 } }],
  // 62 → 77 kg. Left = before.
  m04: [{ angle: 'front', file: '4f6790e6-image.jpg', band: [743, 1740], before: { x0: 0, x1: 532 }, after: { x0: 536, x1: 1080 } }],
  // 118 → 98 kg in 4.5 months, posture fixed. Front and side: left = before; back: left = after.
  m05: [
    { angle: 'front', file: 'dd2dc706-image.jpg', band: [413, 1393], before: { x0: 0, x1: 537 }, after: { x0: 541, x1: 1080 } },
    { angle: 'side', file: '67350729-image.jpg', band: [413, 1393], before: { x0: 0, x1: 537 }, after: { x0: 541, x1: 1080 } },
    { angle: 'back', file: 'aebc3b0e-image.jpg', band: [413, 1393], flipped: true, after: { x0: 0, x1: 537 }, before: { x0: 541, x1: 1080 } },
  ],
  // 86 → 74 kg. Left = after.
  m06: [{ angle: 'front', file: '03d5ecce-image.jpg', band: [623, 1603], flipped: true, after: { x0: 0, x1: 572 }, before: { x0: 577, x1: 1080 } }],
  // 82 → 74 kg in 4 months. Front and side: left = before.
  m07: [
    { angle: 'front', file: '9bcec791-image.jpg', band: [596, 1576], before: { x0: 0, x1: 583 }, after: { x0: 587, x1: 1080 } },
    { angle: 'side', file: 'f1416a84-image.jpg', band: [596, 1576], before: { x0: 0, x1: 575 }, after: { x0: 579, x1: 1080 } },
  ],
  // 85 → 77 kg, body fat 26% → 11%, online client. Left = after. (Ends above
  // the story-avatar bubble Instagram draws over the bottom left.)
  m08: [{ angle: 'front', file: '5a175c92-image.jpg', band: [547, 1370], flipped: true, after: { x0: 0, x1: 593 }, before: { x0: 597, x1: 1080 } }],
  // 88 (bulk) → 74 kg shredded in 75 days. Left = after.
  m09: [{ angle: 'front', file: '45d4cf50-image.jpg', band: [527, 1507], flipped: true, after: { x0: 0, x1: 588 }, before: { x0: 592, x1: 1080 } }],
  // 75 kg after an ACL tear → 90 kg. Left = before in both.
  m10: [
    { angle: 'front', file: '95cdea4b-image.jpg', band: [723, 1703], before: { x0: 0, x1: 570 }, after: { x0: 574, x1: 1080 } },
    { angle: 'back', file: '69d4b144-image.jpg', band: [723, 1703], before: { x0: 0, x1: 532 }, after: { x0: 536, x1: 1080 } },
  ],
  // 91 → 79 kg. Left = before.
  m11: [{ angle: 'front', file: '743a1f1d-image.jpg', band: [597, 1577], before: { x0: 0, x1: 493 }, after: { x0: 497, x1: 1080 } }],
};

/**
 * Later posts (1272 px wide screenshots, and the coach's clean originals).
 * Each side is its own box {x0, x1, y0, y1} in source pixels, so a collage
 * panel or a cropped-off UI strip can be described exactly. Instagram's
 * bottom icons are left out (the last ~118 px of the post), and the "1/4"
 * counter pill, where there is one, is filled in from the background just
 * around it (`counter`: [left, top, width, height, true]).
 */
const box = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
const IG = (y0) => y0 + 1272 - 118; // bottom of an Instagram post without its icon strip
export const MORE = {
  // −30 kg (WhatsApp caption «30 كيلو»). Left = after (thinner), right = before.
  m12: [{ angle: 'front', file: '45144c46-image.jpg', flipped: true, after: box(15, 791, 15, 1585), before: box(808, 1585, 15, 1585), counter: false }],
  // 14/11 110 kg 45% → 6/3 88 kg 30%. First panel = before, third = after (the middle stage is listed, not shown).
  m13: [{ angle: 'front', file: '68448272-image.jpg', before: box(0, 416, 912, 1790), after: box(841, 1272, 912, 1790), counter: false }],
  // 110 → 75 kg in about 3 months. Suit = before; teal hoodie pair: left = before.
  m14: [
    { angle: 'front', file: 'c61cc675-image.jpg', before: box(0, 634, 519, IG(519)), after: box(637, 1272, 519, IG(519)), counter: [1056, 554, 186, 118, true] },
    { angle: 'pose', file: 'bf9f7837-image.jpg', before: box(0, 614, 519, IG(519)), after: box(617, 1272, 519, IG(519)), counter: false },
  ],
  // 2 months after the pandemic. Left = after (more muscle).
  m15: [{ angle: 'front', file: '3adcd5f1-image.jpg', flipped: true, after: box(0, 634, 519, IG(519)), before: box(637, 1272, 519, IG(519)), counter: false }],
  // 105 → 74, about 30 kg. Purple tee front and back: left = after. White shirt: left = before.
  m16: [
    { angle: 'front', file: '92df250a-image.jpg', flipped: true, after: box(0, 634, 519, IG(519)), before: box(637, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] },
    { angle: 'back', file: 'ac9e0fc3-image.jpg', flipped: true, after: box(0, 634, 519, IG(519)), before: box(637, 1272, 519, IG(519)), counter: [1056, 548, 186, 118, true] },
    { angle: 'clothed', file: 'af052fcc-image.jpg', before: box(0, 585, 519, IG(519)), after: box(588, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] },
  ],
  // 3 months, still in progress. Left = before.
  m17: [{ angle: 'front', file: '9a67006e-image.jpg', before: box(0, 593, 519, IG(519)), after: box(596, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] }],
  // 49 → 68. Shirtless: left = before; "GO BELGIUM" tee: left = before.
  m18: [
    { angle: 'front', file: 'f75509b3-image.jpg', before: box(0, 657, 655, 1912 - 118), after: box(660, 1272, 655, 1912 - 118), counter: [1056, 662, 186, 118, true] },
    { angle: 'clothed', file: '39dc6a48-image.jpg', before: box(0, 660, 640, IG(640)), after: box(663, 1272, 640, IG(640)), counter: [1056, 673, 186, 118, true] },
  ],
  // 3 months, side view (Oct 2021). Left = before.
  m19: [{ angle: 'side', file: 'c75ee454-image.jpg', before: box(0, 634, 519, IG(519)), after: box(637, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] }],
  // May 2022. Left = after; right = before (face covered with an emoji as posted).
  m20: [{ angle: 'front', file: '9645b3e5-image.jpg', flipped: true, after: box(0, 667, 531, 1779), before: box(679, 1272, 531, 1779), counter: [1056, 549, 186, 118, true] }],
  // First 6 months of the year (July 2021). Left = after (gym), right = before (beach).
  m21: [{ angle: 'front', file: 'fe1569d4-image.jpg', flipped: true, after: box(0, 684, 519, IG(519)), before: box(687, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] }],
  // 72 → 90 in 6 months (muscle memory). Left = after.
  m22: [{ angle: 'front', file: '861419cf-image.jpg', flipped: true, after: box(0, 720, 808, 2038 - 118), before: box(723, 1272, 808, 2038 - 118), counter: [1056, 798, 186, 118, true] }],
  // 105 → 82 in about two and a half months. Left = after, right = before.
  m23: [{ angle: 'front', file: 'a7702af7-image.jpg', flipped: true, after: box(0, 634, 668, IG(668)), before: box(637, 1272, 668, IG(668)), counter: [1056, 701, 186, 118, true] }],
  // "TRANSFORMATION", Oct 2024. Left = before, right = after (leaner).
  m24: [{ angle: 'front', file: '587bbf29-image.jpg', before: box(0, 574, 519, IG(519)), after: box(577, 1272, 519, IG(519)), counter: false }],
  // 110 → 74 (Aug 2024). Collage: big left = before; top right = after.
  m25: [{ angle: 'front', file: '0720116b-image.jpg', before: box(0, 732, 676, 1948), after: box(735, 1272, 676, 1334), counter: [1072, 702, 166, 130, true] }],
  // Clean originals: contest prep. Left = before in both.
  m26: [
    { angle: 'front', file: '905a0bec-image.jpg', before: box(0, 2046, 0, 3072), after: box(2049, 4096, 0, 3072), counter: false },
    { angle: 'pose', file: 'fbdbc3cf-image.jpg', before: box(0, 2046, 0, 3072), after: box(2049, 4096, 0, 3072), counter: false },
  ],
  // Clean originals: locker room. Front: left = before; side and back: left = after.
  m27: [
    { angle: 'front', file: '3da7e4ec-image.jpg', before: box(0, 2046, 0, 4096), after: box(2049, 4096, 0, 4096), counter: false },
    { angle: 'side', file: 'd538822c-image.jpg', flipped: true, after: box(0, 1534, 0, 4096), before: box(1537, 3072, 0, 4096), counter: false },
    { angle: 'back', file: '0b93a4cc-image.jpg', flipped: true, after: box(0, 2046, 0, 3072), before: box(2049, 4096, 0, 3072), counter: false },
  ],
  // Clean original: beach → gym. Left = before.
  m28: [{ angle: 'front', file: '2a4ee440-image.jpg', before: box(0, 2046, 0, 4096), after: box(2049, 4096, 0, 4096), counter: false }],
  // Clean original: «فرق 5 كيلو ف 20 يوم», 7th place. Left = after (leaner), right = before (gym); black frame cut off.
  m29: [{ angle: 'front', file: '5afb01f2-image.jpg', flipped: true, after: box(2, 831, 82, 1391), before: box(838, 1562, 2, 1562), counter: false }],
  // Added views for existing stories.
  m08: [{ angle: 'back', file: '91df9b8e-image.jpg', before: box(0, 660, 667, IG(667)), after: box(663, 1272, 667, IG(667)), counter: false }],
  m11: [{ angle: 'side', file: '093b4847-image.jpg', before: box(0, 649, 519, IG(519)), after: box(652, 1272, 519, IG(519)), counter: [1056, 552, 186, 118, true] }],
};

/** Tallest output: big originals are scaled down to this (never up). */
const MAX_H = 1100;

/** The achievement photos: the coach with his athlete (medal, certificate). */
const ACHIEVEMENTS = [
  { name: 'shalaby-classic-1', file: '22867822-image.jpg', box: [120, 960, 800, 1000] },
  { name: 'shalaby-classic-2', file: '4c1649fe-image.jpg', box: [212, 1000, 768, 960] },
];

/**
 * Instagram draws a "1/3" counter pill (and, on some screenshots, a dark
 * rounded corner) over the top right of each post. That patch of wall is
 * covered with the wall just below it; people are never touched.
 */
const INSTAGRAM = new Set(['03d5ecce', '45d4cf50', '5a175c92', '67350729', '69d4b144', '743a1f1d', '95cdea4b', '9bcec791', 'aebc3b0e', 'dd2dc706', 'f1416a84'].map((id) => `${id}-image.jpg`));
const COUNTER = { left: 912, width: 168, top: 0, height: 130 };

const source = async (v) => {
  const img = sharp(path.join(SRC, v.file));
  if (!INSTAGRAM.has(v.file)) return img;
  const box = { left: COUNTER.left, top: v.band[0] + COUNTER.top, width: COUNTER.width, height: COUNTER.height };
  const below = { ...box, top: box.top + COUNTER.height + 6 };
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}"><defs><filter id="f"><feGaussianBlur stdDeviation="3"/></filter></defs><rect x="4" y="-20" width="${box.width + 20}" height="${box.height + 16}" rx="14" fill="#fff" filter="url(#f)"/></svg>`,
  );
  const fill = await sharp(path.join(SRC, v.file)).extract(below).blur(2).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(await img.composite([{ input: fill, left: box.left, top: box.top }]).png().toBuffer());
};

/** One photo, centred on a canvas `width` wide, sides filled with a blurred dark copy of itself. */
const onCanvas = async (photo, width, height) => {
  const meta = await sharp(photo).metadata();
  if (meta.width === width) return photo;
  const back = await sharp(photo).resize(width, height, { fit: 'cover' }).blur(28).modulate({ brightness: 0.35, saturation: 0.6 }).png().toBuffer();
  return sharp(back).composite([{ input: photo, left: Math.round((width - meta.width) / 2), top: 0 }]).png().toBuffer();
};

/** Covers a counter pill at box [left, top, width, height] with what is just below it. */
const coverCounter = async (file, [left, top, width, height, flat]) => {
  const img = sharp(path.join(SRC, file));
  if (flat) {
    // Fill the pill's box from its edges (each pixel blends the pixels just
    // outside the box on its row and column), so wall gradients carry on
    // through; then a light blur. A simple inpaint: background only.
    const { data, info } = await sharp(path.join(SRC, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const at = (x, y, c) => data[(y * W + x) * 3 + c];
    const r = Math.min(left + width, W - 1);
    const b = top + height;
    const patch = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const fx = (x + 1) / (width + 1);
        const fy = (y + 1) / (height + 1);
        for (let c = 0; c < 3; c++) {
          const h = at(left - 1, top + y, c) * (1 - fx) + at(r, top + y, c) * fx;
          const v = at(left + x, top - 1, c) * (1 - fy) + at(left + x, b, c) * fy;
          patch[(y * width + x) * 4 + c] = Math.round((h + v) / 2);
        }
        // Fully opaque over the pill, fading out over the outer 14 px.
        const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
        patch[(y * width + x) * 4 + 3] = Math.round(255 * Math.min(1, (edge + 2) / 14));
      }
    const smooth = await sharp(patch, { raw: { width, height, channels: 4 } }).blur(5).png().toBuffer();
    return sharp(await img.composite([{ input: smooth, left, top }]).png().toBuffer());
  }
  const below = { left, top: top + height + 6, width, height };
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><filter id="f"><feGaussianBlur stdDeviation="3"/></filter></defs><rect x="4" y="-20" width="${width + 20}" height="${height + 16}" rx="14" fill="#fff" filter="url(#f)"/></svg>`,
  );
  const fill = await sharp(path.join(SRC, file)).extract(below).blur(2).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(await img.composite([{ input: fill, left, top }]).png().toBuffer());
};

/** Both photos of a view at one height (the smaller one's, at most MAX_H), centred on one canvas. */
const writePair = async (id, angle, src, boxes) => {
  const photos = {};
  for (const side of ['before', 'after']) {
    const b = boxes[side];
    photos[side] = await sharp(src).extract({ left: b.x0, top: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0 }).png().toBuffer();
  }
  const height = Math.min(MAX_H, boxes.before.y1 - boxes.before.y0, boxes.after.y1 - boxes.after.y0);
  for (const side of ['before', 'after']) photos[side] = await sharp(photos[side]).resize({ height }).png().toBuffer();
  const widths = await Promise.all(['before', 'after'].map(async (side) => (await sharp(photos[side]).metadata()).width));
  const width = Math.max(...widths);
  for (const side of ['before', 'after']) {
    const name = `${id}-${angle}-${side}.webp`;
    const file = path.join(OUT, name);
    await sharp(await onCanvas(photos[side], width, height)).webp({ quality: 78, effort: 6 }).toFile(file);
    console.log(`  ${name.padEnd(26)} ${width}×${height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
  return [width, height];
};

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const sizes = {};
  for (const [id, views] of Object.entries(PAIRS))
    for (const v of views) {
      const src = await (await source(v)).png().toBuffer();
      const boxes = Object.fromEntries(['before', 'after'].map((side) => [side, { ...v[side], y0: v.band[0], y1: v.band[1] }]));
      sizes[`${id}-${v.angle}`] = await writePair(id, v.angle, src, boxes);
    }
  for (const [id, views] of Object.entries(MORE))
    for (const v of views) {
      const counter = v.counter || null;
      const src = await (counter ? await coverCounter(v.file, counter) : sharp(path.join(SRC, v.file))).png().toBuffer();
      sizes[`${id}-${v.angle}`] = await writePair(id, v.angle, src, v);
    }
  console.log(JSON.stringify(sizes));
  const achDir = path.join(ROOT, 'public', 'images', 'achievements');
  fs.mkdirSync(achDir, { recursive: true });
  for (const a of ACHIEVEMENTS) {
    const [left, top, width, height] = a.box;
    const file = path.join(achDir, `${a.name}.webp`);
    await sharp(path.join(SRC, a.file)).extract({ left, top, width, height }).webp({ quality: 76, effort: 6 }).toFile(file);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
