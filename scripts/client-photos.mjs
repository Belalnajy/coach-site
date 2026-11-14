/**
 * Client before/after pictures from the coach's own public posts (originals
 * in assets-src/clients/, kept on the owner's machine and not published).
 * Each screenshot is cropped clear of the app (status bar, captions,
 * counters, icons) and each side-by-side pair is split into a before and an
 * after picture.
 *
 * Framing is the same for every pair: from just above the head (from the
 * chin for the pair whose faces are covered) down to the waistband, body
 * centred, at 2:3. For each half the markers below were read by hand off a
 * pixel grid of the original: the half's horizontal bounds, the head top,
 * the waistband and the body's centre line. Both halves of a view get the
 * same framing relative to those markers and are exported at the smaller
 * crop's size, so the slider compares like with like and nothing is upscaled.
 *
 * Instagram split posts are tall (about 1:2 per half), so 2:3 is the widest
 * frame that still fits head-to-waistband at native width. When a half is
 * too narrow even for that, the pair is framed a little tighter (both halves
 * alike), losing a few pixels of hair and of waistband.
 *
 * Which half is before was judged from the bodies, not the position: the
 * coach's posts are not consistent (see `flipped`). Faces are kept as posted.
 * Re-run with `node scripts/client-photos.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'clients');
const OUT = path.join(ROOT, 'public', 'images', 'transformations');

/** Width : height of every picture. */
export const ASPECT = 2 / 3;
/** Frame height as a multiple of head-top-to-waistband, at most. */
const ROOM = 1.12;

/**
 * id → views. `band` is the photo area of the screenshot [top, bottom]; each
 * half: x0–x1 its bounds, t the head top (or chin), b the waistband, cx the
 * body's centre line, all in source pixels.
 */
export const PAIRS = {
  // 108 → 85 kg; faces covered with emoji, so framed from the chin. Left = after.
  m01: [{ angle: 'front', file: 'ec351cb2-image.jpg', band: [0, 1921], flipped: true,
    after: { x0: 0, x1: 718, t: 455, b: 1290, cx: 260 }, before: { x0: 722, x1: 1440, t: 490, b: 1230, cx: 1080 } }],
  // 80 → 72 kg. Front: left = after. Back: left = before.
  m02: [
    { angle: 'front', file: 'd04f92e4-image.jpg', band: [0, 1564], flipped: true,
      after: { x0: 0, x1: 886, t: 150, b: 1000, cx: 380 }, before: { x0: 890, x1: 1564, t: 243, b: 870, cx: 1193 } },
    { angle: 'back', file: 'cd1feecc-image.jpg', band: [202, 1564],
      before: { x0: 0, x1: 727, t: 313, b: 1126, cx: 344 }, after: { x0: 731, x1: 1564, t: 262, b: 1136, cx: 1156 } },
  ],
  // 100 → 80 kg, posture fixed. Side view; left = after.
  m03: [{ angle: 'side', file: 'ed015eef-image.jpg', band: [660, 1725], flipped: true,
    after: { x0: 0, x1: 537, t: 719, b: 1326, cx: 220 }, before: { x0: 541, x1: 1080, t: 765, b: 1453, cx: 770 } }],
  // 62 → 77 kg, in the same club shirt: framed from the head to just below the
  // shirt's sponsor logo, the one level both pictures show. Left = before.
  m04: [{ angle: 'front', file: '4f6790e6-image.jpg', band: [743, 1740],
    before: { x0: 0, x1: 532, t: 836, b: 1375, cx: 265 }, after: { x0: 536, x1: 1080, t: 886, b: 1392, cx: 766 }, room: 1.32 }],
  // 118 → 98 kg in 4.5 months, posture fixed. Front and side: left = before; back: left = after.
  m05: [
    { angle: 'front', file: 'dd2dc706-image.jpg', band: [413, 1493],
      before: { x0: 0, x1: 537, t: 480, b: 1121, cx: 252 }, after: { x0: 541, x1: 1080, t: 523, b: 1163, cx: 805 } },
    { angle: 'side', file: '67350729-image.jpg', band: [413, 1493],
      before: { x0: 0, x1: 537, t: 413, b: 1280, cx: 245 }, after: { x0: 541, x1: 1080, t: 413, b: 1256, cx: 770 } },
    { angle: 'back', file: 'aebc3b0e-image.jpg', band: [413, 1493], flipped: true,
      after: { x0: 0, x1: 537, t: 561, b: 1251, cx: 285 }, before: { x0: 541, x1: 1080, t: 556, b: 1214, cx: 805 } },
  ],
  // 86 → 74 kg. Left = after.
  m06: [{ angle: 'front', file: '03d5ecce-image.jpg', band: [623, 1703], flipped: true,
    after: { x0: 0, x1: 572, t: 631, b: 1483, cx: 275 }, before: { x0: 577, x1: 1080, t: 699, b: 1508, cx: 831 } }],
  // 82 → 74 kg in 4 months. Front and side: left = before.
  m07: [
    { angle: 'front', file: '9bcec791-image.jpg', band: [596, 1676],
      before: { x0: 0, x1: 583, t: 722, b: 1304, cx: 295 }, after: { x0: 587, x1: 1080, t: 756, b: 1301, cx: 835 } },
    { angle: 'side', file: 'f1416a84-image.jpg', band: [596, 1676],
      before: { x0: 0, x1: 575, t: 751, b: 1389, cx: 305 }, after: { x0: 579, x1: 1080, t: 798, b: 1380, cx: 825 } },
  ],
  // 85 → 77 kg, body fat 26% → 11%, online client. Left = after.
  m08: [{ angle: 'front', file: '5a175c92-image.jpg', band: [547, 1627], flipped: true,
    after: { x0: 0, x1: 593, t: 572, b: 1070, cx: 325 }, before: { x0: 597, x1: 1080, t: 673, b: 1146, cx: 830 } }],
  // 88 (bulk) → 74 kg shredded in 75 days. Left = after.
  m09: [{ angle: 'front', file: '45d4cf50-image.jpg', band: [527, 1607], flipped: true,
    after: { x0: 0, x1: 588, t: 550, b: 1225, cx: 293 }, before: { x0: 592, x1: 1080, t: 561, b: 1180, cx: 810 } }],
  // 75 kg after an ACL tear → 90 kg. Left = before in both.
  m10: [
    { angle: 'front', file: '95cdea4b-image.jpg', band: [723, 1803],
      before: { x0: 0, x1: 570, t: 809, b: 1489, cx: 268 }, after: { x0: 574, x1: 1080, t: 824, b: 1399, cx: 800 } },
    // The back view (69d4b144) is left out: the after picture is only 267 px
    // wide at this framing, too small to look sharp on a phone.
  ],
  // 91 → 79 kg. Left = before.
  m11: [{ angle: 'front', file: '743a1f1d-image.jpg', band: [597, 1677],
    before: { x0: 0, x1: 493, t: 777, b: 1329, cx: 265 }, after: { x0: 497, x1: 1080, t: 698, b: 1363, cx: 800 } }],
};

/** The achievement photos: the coach with his athlete (medal, certificate). */
const ACHIEVEMENTS = [
  { name: 'shalaby-classic-1', file: '22867822-image.jpg', box: [120, 960, 800, 1000] },
  { name: 'shalaby-classic-2', file: '4c1649fe-image.jpg', box: [212, 1000, 768, 960] },
];

/**
 * Instagram draws its "1/3" counter pill over the top-right of each post.
 * Where a crop reaches it, it is covered with the wall texture just below it,
 * so the app's UI does not show; people are never touched (checked on each pair).
 */
const INSTAGRAM = new Set(['03d5ecce', '45d4cf50', '5a175c92', '67350729', '743a1f1d', '95cdea4b', '9bcec791', 'aebc3b0e', 'dd2dc706', 'f1416a84'].map((id) => `${id}-image.jpg`));
const COUNTER = { left: 912, width: 150, top: 18, height: 112 };

const source = async (v) => {
  const img = sharp(path.join(SRC, v.file));
  if (!INSTAGRAM.has(v.file)) return img;
  // Fill the pill with the wall just below it (soft-edged), so no smudge shows.
  const box = { left: COUNTER.left, top: v.band[0] + COUNTER.top, width: COUNTER.width, height: COUNTER.height };
  const below = { ...box, top: box.top + COUNTER.height + 6 };
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}"><defs><filter id="f"><feGaussianBlur stdDeviation="3"/></filter></defs><rect x="4" y="4" width="${box.width - 8}" height="${box.height - 8}" rx="14" fill="#fff" filter="url(#f)"/></svg>`,
  );
  const fill = await sharp(path.join(SRC, v.file)).extract(below).blur(2).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(await img.composite([{ input: fill, left: box.left, top: box.top }]).png().toBuffer());
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The crop box of one half for a given room factor: head-to-waist times
 * `room` tall (40% of the extra above the head, 60% below the waistband),
 * 2:3, centred on the body, kept inside the half and the photo band.
 */
export const frame = (h, room, band) => {
  const len = h.b - h.t;
  const height = Math.round(len * room);
  const width = Math.round(height * ASPECT);
  const top = clamp(Math.round(h.t - (height - len) * 0.4), band[0], band[1] - height);
  const left = clamp(Math.round(h.cx - width / 2), h.x0, h.x1 - width);
  return { left, top, width, height };
};

/** The largest room (≤ ROOM, or the view's own) both halves can take at 2:3 inside their bounds. */
export const roomFor = (v) => {
  const fits = (h) => ((h.x1 - h.x0) / ASPECT) / (h.b - h.t);
  return Math.min(v.room ?? ROOM, fits(v.before), fits(v.after), (v.band[1] - v.band[0]) / Math.max(v.before.b - v.before.t, v.after.b - v.after.t));
};

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [id, views] of Object.entries(PAIRS))
    for (const v of views) {
      const room = roomFor(v);
      const boxes = { before: frame(v.before, room, v.band), after: frame(v.after, room, v.band) };
      // Both at the smaller crop's size, so the pair lines up; never upscaled.
      const width = Math.min(boxes.before.width, boxes.after.width);
      const size = { width, height: Math.round(width / ASPECT) };
      for (const side of ['before', 'after']) {
        const name = `${id}-${v.angle}-${side}.webp`;
        const file = path.join(OUT, name);
        await (await source(v))
          .extract(boxes[side])
          .resize(size.width, size.height, { fit: 'fill', kernel: 'lanczos3' })
          .webp({ quality: 80, effort: 6 })
          .toFile(file);
        console.log(`  ${name.padEnd(26)} ${size.width}×${size.height}  room ${room.toFixed(2)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
      }
    }
  const achDir = path.join(ROOT, 'public', 'images', 'achievements');
  fs.mkdirSync(achDir, { recursive: true });
  for (const a of ACHIEVEMENTS) {
    const [left, top, width, height] = a.box;
    const file = path.join(achDir, `${a.name}.webp`);
    await sharp(path.join(SRC, a.file)).extract({ left, top, width, height }).webp({ quality: 76, effort: 6 }).toFile(file);
    console.log(`  achievements/${a.name}.webp ${width}×${height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
