import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach } from '@/lib/config';
import Icon from './Icon';

const ORDER = ['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const;

/** The coach's social profiles from the config, as icon links. */
export default function Socials({ lang, size = 'md' }: { lang: Locale; size?: 'sm' | 'md' }) {
  const t = dict(lang).common;
  const socials = coach.socials ?? {};
  const links = ORDER.filter((key) => socials[key]);
  if (!links.length) return null;
  return (
    <ul className="flex items-center gap-1">
      {links.map((key) => (
        <li key={key}>
          <a
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`grid place-items-center rounded-full text-ink transition hover:bg-accent hover:text-on-accent ${size === 'sm' ? 'size-11' : 'size-12 border border-line'}`}
            aria-label={`${t[key]} ${t.newTab}`}
          >
            <Icon name={key} size={size === 'sm' ? 19 : 21} />
          </a>
        </li>
      ))}
    </ul>
  );
}
