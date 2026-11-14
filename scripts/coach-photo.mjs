/**
 * Turns the coach's original photo (assets-src/, not published) into the
 * site's hero and portrait pictures with honest photo editing only:
 *
 * - crop to 4:5 around him, at the photo's own resolution (no upscaling);
 * - a high-contrast black-and-white grade, the same for him and the scene;
 * - the background (separated by a hand-traced, feathered outline of him)
 *   blurred, darkened and lit from behind with the brand's lime;
 * - lime rim light just inside his edges (not on his face), a vignette,
 *   light grain.
 *
 * His face, body and clothes are not changed: no generation, no reshaping,
 * no composite. Re-run with `node scripts/coach-photo.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src', 'coach-mohamed-nasser-original.jpg');
const OUT = path.join(ROOT, 'public', 'images', 'coach');
const LIME = '#D4FF3A';

// The photo inside the original's white margins.
const AREA = { left: 89, top: 0, width: 806, height: 960 };

// His outline, traced by hand on the original (x, y in original pixels):
// hair, right side of the face, shoulder, sleeve, arm to the pocket, then
// back up the left arm, sleeve and shoulder to the hair.
const OUTLINE = [
  [380, 116], [432, 122], [472, 148], [494, 188], [499, 234], [487, 280], [470, 312], [452, 335], [441, 352], [446, 366],
  [457, 374], [480, 383], [520, 393], [544, 410], [590, 438], [622, 480], [646, 540], [666, 600], [680, 652], [674, 672],
  [656, 684], [632, 692], [630, 724], [624, 764], [614, 822], [606, 878], [612, 920], [626, 960], [238, 960], [244, 918],
  [234, 878], [214, 830], [199, 790], [184, 742], [174, 708], [146, 700], [139, 688], [149, 640], [169, 560], [190, 500],
  [216, 458], [262, 424], [282, 397], [332, 385], [330, 360], [318, 340], [304, 302], [294, 266], [270, 240], [261, 204],
  [274, 164], [310, 134], [345, 119],
].map(([x, y]) => [x - AREA.left, y - AREA.top]);

const W = AREA.width;
const H = AREA.height;
const pts = OUTLINE.map(([x, y]) => `${x},${y}`).join(' ');
const svg = (body, defs = '') => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${defs}</defs>${body}</svg>`);

const graded = () =>
  sharp(SRC)
    .extract(AREA)
    .grayscale()
    // Contrast with lifted blacks kept in check, a gentle S-curve.
    .linear(1.28, -30)
    .gamma(1.08);

const smoothstep = (lo, hi, v) => {
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
};

// His face (and ears) as an ellipse, in photo-area pixels: kept whole by the
// hair matte, and kept free of coloured light.
const FACE = { cx: 381 - AREA.left, cy: 268, rx: 100, ry: 118 };
const inFace = (x, y) => ((x - FACE.cx) / FACE.rx) ** 2 + ((y - FACE.cy) / FACE.ry) ** 2 <= 1;

const build = async () => {
  const one = (img) => img.removeAlpha().extractChannel(0).raw().toBuffer();
  const gray = await one(graded());
  const poly = await one(sharp(svg(`<rect width="${W}" height="${H}" fill="#000"/><polygon points="${pts}" fill="#fff"/>`)).blur(2.5));

  // The matte: the traced outline pulled in a pixel or two (no background
  // fringe), and around the hair, where the outline cannot follow every
  // curl, the hair's own darkness against the bright sky decides.
  const alpha = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let a = smoothstep(0.45, 0.85, poly[i] / 255);
      // Fades out above the beard line, below which the outline is exact.
      if (a > 0 && y < 360 && !inFace(x, y)) a *= 1 - smoothstep(125, 170, gray[i]) * (1 - smoothstep(330, 360, y));
      alpha[i] = Math.round(a * 255);
    }
  const matte = await one(sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(0.8));

  // Background: the same grade, blurred and darkened, lit from behind in lime.
  const backlight = svg(
    `<rect width="${W}" height="${H}" fill="url(#g)"/>`,
    `<radialGradient id="g" cx="0.40" cy="0.36" r="0.66"><stop offset="0" stop-color="${LIME}" stop-opacity="0.95"/><stop offset="0.42" stop-color="${LIME}" stop-opacity="0.32"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>`,
  );
  const background = await graded().blur(12).linear(0.3, 0).toColourspace('srgb').composite([{ input: backlight, blend: 'screen' }]).png().toBuffer();

  // Him: the graded photo through the matte, a touch more contrast.
  const him = await graded().linear(1.06, -6).toColourspace('srgb').joinChannel(matte, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();

  // Rim light: a band just inside his edges, lime from the left (strong) and
  // the right (softer), never across his face.
  const spread = await one(sharp(matte, { raw: { width: W, height: H, channels: 1 } }).blur(9));
  for (const [name, buf] of Object.entries({ gray, poly, matte, spread })) if (buf.length !== W * H) throw new Error(`${name}: expected one channel`);
  const rim = Buffer.alloc(W * H * 4);
  const lime = [0xd4, 0xff, 0x3a];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const band = (matte[i] / 255) * (1 - spread[i] / 255) * 2;
      const side = Math.max(1 - x / (W * 0.42), 0.55 * smoothstep(W * 0.5, W * 0.8, x));
      const a = inFace(x, y) ? 0 : Math.min(1, band * side * 1.6);
      rim[i * 4] = lime[0];
      rim[i * 4 + 1] = lime[1];
      rim[i * 4 + 2] = lime[2];
      rim[i * 4 + 3] = Math.round(a * 255);
    }
  const rimSoft = await sharp(rim, { raw: { width: W, height: H, channels: 4 } }).blur(1.2).png().toBuffer();

  // Vignette, a darker floor for text over the lower part, and grain.
  const shade = svg(
    `<rect width="${W}" height="${H}" fill="url(#v)"/><rect width="${W}" height="${H}" fill="url(#b)"/>`,
    `<radialGradient id="v" cx="0.42" cy="0.38" r="0.8"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient>
     <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient>`,
  );
  let seed = 42;
  const noise = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = (seed >> 16) & 255;
    noise[i * 4] = noise[i * 4 + 1] = noise[i * 4 + 2] = v;
    noise[i * 4 + 3] = 16;
  }

  return sharp(background)
    .composite([
      { input: him },
      { input: rimSoft, blend: 'screen' },
      { input: shade },
      { input: noise, raw: { width: W, height: H, channels: 4 } },
    ])
    .png()
    .toBuffer();
};

const save = async (image, name, crop) => {
  const file = path.join(OUT, name);
  await sharp(image).extract(crop).webp({ quality: 80, effort: 6 }).toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`  ${name.padEnd(28)} ${meta.width}×${meta.height}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};

const image = await build();
console.log('Coach photo → public/images/coach/');
// Hero: the full height, 4:5, as close to centred on him as the photo allows.
await save(image, 'mohamed-nasser-hero.webp', { left: 0, top: 0, width: 768, height: 960 });
// Portrait: tighter, head to waist.
await save(image, 'mohamed-nasser-portrait.webp', { left: 21, top: 40, width: 600, height: 750 });
