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

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const sizes = {};
  for (const [id, views] of Object.entries(PAIRS))
    for (const v of views) {
      const src = await (await source(v)).png().toBuffer();
      const height = v.band[1] - v.band[0];
      const photos = {};
      for (const side of ['before', 'after'])
        photos[side] = await sharp(src).extract({ left: v[side].x0, top: v.band[0], width: v[side].x1 - v[side].x0, height }).png().toBuffer();
      const width = Math.max(v.before.x1 - v.before.x0, v.after.x1 - v.after.x0);
      for (const side of ['before', 'after']) {
        const name = `${id}-${v.angle}-${side}.webp`;
        const file = path.join(OUT, name);
        await sharp(await onCanvas(photos[side], width, height)).webp({ quality: 78, effort: 6 }).toFile(file);
        console.log(`  ${name.padEnd(26)} ${width}×${height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
      }
      sizes[`${id}-${v.angle}`] = [width, height];
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
