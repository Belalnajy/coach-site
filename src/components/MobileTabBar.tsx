'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { route, type RouteKey } from '@/lib/routes';
import BookLink from './BookLink';
import Icon, { type IconName } from './Icon';
import { isActive } from './nav';

const ITEMS: { key: RouteKey; icon: IconName }[] = [
  { key: 'home', icon: 'home' },
  { key: 'transformations', icon: 'results' },
  { key: 'book', icon: 'whatsapp' },
  { key: 'programs', icon: 'dumbbell' },
  { key: 'calculators', icon: 'calculator' },
];

/**
 * Phone navigation in the thumb zone: four destinations and, in the middle,
 * the raised "Book" button that opens the booking sheet from any page.
 */
export default function MobileTabBar({ lang }: { lang: Locale }) {
  const t = dict(lang).nav;
  const pathname = usePathname() ?? '/';
  return (
    <nav aria-label={t.mobile} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden">
      <ul className="glass mx-auto flex h-[4.25rem] max-w-md items-stretch justify-between rounded-[1.6rem] border border-line/80 px-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.55)]">
        {ITEMS.map(({ key, icon }) => {
          if (key === 'book')
            return (
              <li key={key} className="flex flex-1 justify-center">
                <BookLink lang={lang} className="-mt-5 flex flex-col items-center gap-1 text-[0.7rem] font-extrabold">
                  <span className="grid size-14 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_24px_-6px_var(--accent)] ring-4 ring-bg pulse-ring">
                    <Icon name="whatsapp" size={26} />
                  </span>
                  {t.book}
                </BookLink>
              </li>
            );
          const target = route(lang, key);
          const active = isActive(pathname, target);
          return (
            <li key={key} className="flex flex-1">
              <Link
                href={target}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl text-[0.7rem] font-bold transition ${active ? 'text-accent-text' : 'text-muted'}`}
              >
                <Icon name={icon} size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="leading-none">{t[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
