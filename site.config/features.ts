import type { FeaturesConfig } from './types.ts';

/** Parts of the site that can be switched off as a whole. */
export const features: FeaturesConfig = {
  // Off until the coach has approved articles under his name.
  blog: false,
  // The site builder's credit in the footer.
  credit: {
    name: { ar: 'بلال ناجي', en: 'Belal Nagy' },
    url: { ar: 'https://www.belalnagy.com/ar', en: 'https://www.belalnagy.com' },
  },
};
