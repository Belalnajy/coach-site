/**
 * The coach's pictures, from his gym photo (assets-src/, not published):
 * black and white as given, no effects, cutouts or retouching.
 *
 * - hero (also the About portrait): a 4:5 crop from just above his hair
 *   down to just below the crossed arms, ending above the
 *   "CAPTAIN / MOHAMED NASSER" lettering baked into the bottom of the photo
 *   (from y ≈ 815);
 * - poster: the whole photo, lettering included, used where it reads as a
 *   poster (the About page, the home share image).
 *
 * Native resolution, never upscaled. Re-run with `node scripts/coach-photo.mjs`.
 * (The earlier café photo is kept in assets-src/ but no longer used.)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'coach-mohamed-nasser-gym-poster.jpg');
const OUT = path.join(ROOT, 'public', 'images', 'coach');

const OUTPUTS = {
  'mohamed-nasser-hero.webp': { left: 63, top: 6, width: 640, height: 800 },
  'mohamed-nasser-poster.webp': null, // the whole photo
};

console.log('Coach photo → public/images/coach/');
for (const [name, crop] of Object.entries(OUTPUTS)) {
  const img = crop ? sharp(SRC).extract(crop) : sharp(SRC);
  const file = path.join(OUT, name);
  await img.webp({ quality: 80, effort: 6 }).toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`  ${name.padEnd(30)} ${meta.width}×${meta.height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
