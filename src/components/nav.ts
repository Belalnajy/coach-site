import type { IconName } from './Icon';
import type { RouteKey } from '@/lib/routes';

export const NAV: { key: Exclude<RouteKey, 'book'>; icon: IconName }[] = [
  { key: 'home', icon: 'home' },
  { key: 'transformations', icon: 'results' },
  { key: 'programs', icon: 'dumbbell' },
  { key: 'calculators', icon: 'calculator' },
  { key: 'blog', icon: 'article' },
  { key: 'about', icon: 'user' },
];

/** Is `pathname` this page or inside it? Home only matches itself. */
export const isActive = (pathname: string, target: string): boolean =>
  target === '/' || target === '/en' ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
