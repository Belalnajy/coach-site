import type { Picture, TransformationConfig } from './types.ts';

/**
 * BEFORE / AFTER RESULTS.
 *
 * Real clients' results only, each with the client's written consent, and
 * `sample: false` on each. While this list is empty the results page, its
 * menu entry and the home page's results block are hidden.
 *
 * Pictures: 1000 × 1250 px (4:5), WebP or JPG, before and after taken from
 * the same spot, distance and pose so the slider lines up. Put them in
 * public/images/transformations/.
 */

const pair = (id: string, alt: { ar: string; en: string }): { before: Picture; after: Picture } => ({
  before: {
    src: `/images/transformations/${id}-before.webp`,
    width: 1000,
    height: 1250,
    alt: { ar: `قبل: ${alt.ar}`, en: `Before: ${alt.en}` },
  },
  after: {
    src: `/images/transformations/${id}-after.webp`,
    width: 1000,
    height: 1250,
    alt: { ar: `بعد: ${alt.ar}`, en: `After: ${alt.en}` },
  },
});

export const transformations: TransformationConfig[] = [];

// Kept for when the first stories arrive: builds the before/after picture pair.
export { pair };
