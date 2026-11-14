import type { Localized } from './types.ts';

/**
 * BLOG CATEGORIES. Every post's `category:` (in posts/*.md) must be one of
 * these ids. Articles themselves live in posts/: one Markdown file per
 * article, holding both languages (see posts/protein-how-much.md).
 */
export const blogCategories: { id: string; label: Localized }[] = [
  { id: 'nutrition', label: { ar: 'تغذية', en: 'Nutrition' } },
  { id: 'training', label: { ar: 'تمرين', en: 'Training' } },
  { id: 'recovery', label: { ar: 'استشفاء', en: 'Recovery' } },
  { id: 'mindset', label: { ar: 'عقلية', en: 'Mindset' } },
];
