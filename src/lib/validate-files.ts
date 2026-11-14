import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Picture } from '../../site.config/types.ts';
import type { SiteConfig } from './validate.ts';

/**
 * File checks that need the disk (so they run at build time and in tests,
 * never in the browser): every picture named in the config exists under
 * /public and really has the width and height the config says, so the page
 * reserves the right space and nothing jumps while it loads.
 */
export const checkFiles = async (config: SiteConfig, publicDir = path.join(process.cwd(), 'public')): Promise<string[]> => {
  const errors: string[] = [];
  const pictures: [string, string, Picture][] = [
    ['coach.ts', 'images.hero', config.coach.images.hero],
    ['coach.ts', 'images.portrait', config.coach.images.portrait],
    ['coach.ts', 'images.map', config.coach.images.map],
    ...config.transformations.flatMap((t, i): [string, string, Picture][] => [
      ['transformations.ts', `transformations[${i}].before`, t.before],
      ['transformations.ts', `transformations[${i}].after`, t.after],
    ]),
  ];
  for (const [file, at, pic] of pictures) {
    const full = path.join(publicDir, pic.src);
    if (!fs.existsSync(full)) {
      errors.push(`site.config/${file} → ${at}.src: no file at public${pic.src}`);
      continue;
    }
    const { width, height } = await sharp(full).metadata();
    if (width !== pic.width || height !== pic.height)
      errors.push(`site.config/${file} → ${at}: the file is ${width}×${height} px but the config says ${pic.width}×${pic.height}; update width/height or resize the picture`);
  }
  return errors;
};
