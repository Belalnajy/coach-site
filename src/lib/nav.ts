import type { IconName } from '../components/Icon';
import { show } from './config.ts';
import type { RouteKey } from './routes.ts';

type NavKey = Exclude<RouteKey, 'book'>;

const ALL: { key: NavKey; icon: IconName }[] = [
  { key: 'home', icon: 'home' },
  { key: 'transformations', icon: 'results' },
  { key: 'programs', icon: 'dumbbell' },
  { key: 'calculators', icon: 'calculator' },
  { key: 'blog', icon: 'article' },
  { key: 'about', icon: 'user' },
];

/** Pages that exist right now: results only with stories, the blog only when switched on. */
export const pageVisible = (key: RouteKey): boolean => (key === 'transformations' ? show.transformations : key === 'blog' ? show.blog : true);

/** The menu: every page that is shown. */
export const NAV = ALL.filter(({ key }) => pageVisible(key));

/**
 * The phone tab bar: four destinations around the raised Book button. With
 * no results page, About takes its place.
 */
export const TAB_KEYS: [NavKey, NavKey, NavKey, NavKey] = show.transformations
  ? ['home', 'transformations', 'programs', 'calculators']
  : ['home', 'programs', 'calculators', 'about'];

export const iconOf = (key: NavKey): IconName => ALL.find((n) => n.key === key)!.icon;
