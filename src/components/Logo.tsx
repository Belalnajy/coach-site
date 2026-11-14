import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { coach } from '@/lib/config';
import { route } from '@/lib/routes';
import Icon from './Icon';

/** Wordmark built from the config: an accent badge and the coach's name. */
export default function Logo({ lang }: { lang: Locale }) {
  return (
    <Link href={route(lang, 'home')} className="group flex min-h-11 items-center gap-2.5" aria-label={fill(dict(lang).nav.homeLink, { coach: coach.name[lang] })}>
      <span className="grid size-9 -skew-x-6 place-items-center rounded-xl bg-accent text-on-accent shadow-[0_6px_20px_-6px_var(--accent)] transition group-hover:rotate-[-4deg]">
        <Icon name="bolt" size={20} strokeWidth={2.2} fill="currentColor" />
      </span>
      <span className="display text-[1.35rem] leading-none whitespace-nowrap">{coach.name[lang]}</span>
    </Link>
  );
}
