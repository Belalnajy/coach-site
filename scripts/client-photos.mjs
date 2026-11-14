/**
 * Client before/after pictures from the coach's own public posts (originals
 * in assets-src/clients/, not published). Each screenshot is cropped clear
 * of the app (status bar, captions, counters, icons), each side-by-side
 * pair is split into a before and an after picture, and both are framed 4:5
 * on the torso. A pair is exported at the smaller crop's size, so the two
 * line up in the slider and nothing is upscaled.
 *
 * Which half is before was judged from the bodies, not the position: the
 * coach's posts are not consistent (see `flipped` below). Faces are kept as
 * posted. Re-run with `node scripts/client-photos.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'clients');
const OUT = path.join(ROOT, 'public', 'images', 'transformations');

/**
 * id → views. Each view: the source file and the before/after crop boxes
 * [left, top, width] in source pixels (height = width × 1.25).
 */
export const PAIRS = {
  // 108 → 85 kg. Left = after (flipped).
  'm01': [{ angle: 'front', file: 'ec351cb2-image.jpg', before: [750, 470, 660], after: [30, 460, 660], flipped: true }],
  // 80 → 72 kg. Front: left = after (flipped). Back: left = before.
  'm02': [
    { angle: 'front', file: 'd04f92e4-image.jpg', before: [1128, 410, 436], after: [110, 380, 600], flipped: true },
    { angle: 'back', file: 'cd1feecc-image.jpg', before: [20, 300, 640], after: [830, 290, 640] },
  ],
  // 100 → 80 kg and a posture fix. Side view; left = after (flipped).
  'm03': [{ angle: 'side', file: 'ed015eef-image.jpg', before: [600, 790, 480], after: [0, 780, 480], flipped: true }],
  // 62 → 77 kg (bulk). Left = before.
  'm04': [{ angle: 'front', file: '4f6790e6-image.jpg', before: [20, 900, 480], after: [570, 900, 480] }],
  // 118 → 98 kg in 4.5 months, posture fix. Front and side: left = before; back: left = after (flipped).
  'm05': [
    { angle: 'front', file: 'dd2dc706-image.jpg', before: [20, 560, 480], after: [580, 580, 480] },
    { angle: 'side', file: '67350729-image.jpg', before: [30, 520, 480], after: [560, 530, 480] },
    { angle: 'back', file: 'aebc3b0e-image.jpg', before: [560, 620, 480], after: [20, 620, 480], flipped: true },
  ],
  // 86 → 74 kg. Left = after (flipped).
  'm06': [{ angle: 'front', file: '03d5ecce-image.jpg', before: [595, 960, 480], after: [0, 940, 480], flipped: true }],
  // 82 → 74 kg in 4 months. Front and side: left = before.
  'm07': [
    { angle: 'front', file: '9bcec791-image.jpg', before: [60, 760, 480], after: [580, 770, 480] },
    { angle: 'side', file: 'f1416a84-image.jpg', before: [50, 760, 480], after: [590, 780, 480] },
  ],
  // 85 → 77 kg, body fat 26% → 11%, online client. Left = after (flipped).
  'm08': [{ angle: 'front', file: '5a175c92-image.jpg', before: [590, 670, 480], after: [60, 650, 480], flipped: true }],
  // 88 (bulk) → 74 kg shredded in 75 days. Left = after (flipped).
  'm09': [{ angle: 'front', file: '45d4cf50-image.jpg', before: [590, 640, 480], after: [40, 600, 480], flipped: true }],
  // 75 kg after an ACL tear → 90 kg. Left = before in both.
  'm10': [
    { angle: 'front', file: '95cdea4b-image.jpg', before: [30, 820, 480], after: [575, 840, 480] },
    { angle: 'back', file: '69d4b144-image.jpg', before: [25, 1000, 480], after: [560, 950, 480] },
  ],
  // 91 → 79 kg. Left = before.
  'm11': [{ angle: 'front', file: '743a1f1d-image.jpg', before: [10, 800, 480], after: [600, 790, 480] }],
};

/** The achievement photos: the coach with his athlete (medal, certificate). */
const ACHIEVEMENTS = [
  { name: 'shalaby-classic-1', file: '22867822-image.jpg', box: [120, 960, 800, 1000] },
  { name: 'shalaby-classic-2', file: '4c1649fe-image.jpg', box: [212, 1000, 768, 960] },
];

const cut = async (file, [left, top, width, height = Math.round(width * 1.25)], size) =>
  sharp(path.join(SRC, file))
    .extract({ left, top, width, height })
    .resize(size.width, size.height, { fit: 'fill', kernel: 'lanczos3' })
    .modulate({ saturation: 1.02 })
    .webp({ quality: 76, effort: 6 });

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const sizes = {};
  for (const [id, views] of Object.entries(PAIRS))
    for (const v of views) {
      // Both pictures at the smaller crop: line up in the slider, never upscaled.
      const width = Math.min(v.before[2], v.after[2]);
      const size = { width, height: Math.round(width * 1.25) };
      for (const side of ['before', 'after']) {
        const name = `${id}-${v.angle}-${side}.webp`;
        await (await cut(v.file, v[side], size)).toFile(path.join(OUT, name));
        sizes[name] = size;
        console.log(`  ${name.padEnd(26)} ${size.width}×${size.height}  ${(fs.statSync(path.join(OUT, name)).size / 1024).toFixed(0)} KB`);
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
  return sizes;
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
