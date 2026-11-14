/**
 * The coach's hero and portrait pictures from his original photo
 * (assets-src/, not published), with plain photo editing only:
 *
 * - a tight 4:5 crop around him, at the photo's own resolution (no upscaling);
 * - an even grade over the whole picture: a little more contrast, colour
 *   kept natural and slightly calmer (or `--bw` for a clean black and white);
 * - a gentle dark gradient along the bottom edge, nothing else.
 *
 * No cutout, mask, glow or retouching: his face, body, clothes and the
 * background are as photographed. Re-run with `node scripts/coach-photo.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'coach-mohamed-nasser-original.jpg');
const OUT = path.join(ROOT, 'public', 'images', 'coach');
const BW = process.argv.includes('--bw');

/** Crops in original pixels; the photo sits between white margins at x 89–894. */
const CROPS = {
  'mohamed-nasser-hero.webp': { left: 96, top: 64, width: 640, height: 800 },
  'mohamed-nasser-portrait.webp': { left: 110, top: 84, width: 600, height: 750 },
};

const bottomShade = (width, height) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/></svg>`,
  );

console.log(`Coach photo → public/images/coach/ (${BW ? 'black and white' : 'colour'})`);
for (const [name, crop] of Object.entries(CROPS)) {
  let img = sharp(SRC).extract(crop);
  img = BW ? img.grayscale().linear(1.12, -10) : img.modulate({ saturation: 0.88 }).linear(1.1, -10);
  const file = path.join(OUT, name);
  await sharp(await img.png().toBuffer())
    .composite([{ input: bottomShade(crop.width, crop.height) }])
    .webp({ quality: 80, effort: 6 })
    .toFile(file);
  console.log(`  ${name.padEnd(30)} ${crop.width}×${crop.height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
