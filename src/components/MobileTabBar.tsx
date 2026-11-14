'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '../../site.config/types';
import BookLink from './BookLink';
import Icon, { type IconName } from './Icon';
import { isActive } from './nav';

export interface TabItem {
  href: string;
  label: string;
  icon: IconName;
  /** The middle "Book" button, which opens the booking sheet. */
  book?: boolean;
}

/**
 * Phone navigation in the thumb zone: four destinations and, in the middle,
 * the raised "Book" button that opens the booking sheet from any page.
 * Labels and addresses come in as props (built by SiteShell on the server),
 * so this always-loaded component ships without the config.
 */
export default function MobileTabBar({ lang, label, items }: { lang: Locale; label: string; items: TabItem[] }) {
  const pathname = usePathname() ?? '/';
  // While a page's own big Book button ([data-hero-cta], the home hero) is on
  // screen, the tab bar's Book stays a plain tab, so the first screen has one
  // call to action, not two. It rises once that button scrolls away. The
  // starting value comes from the page itself, so the server HTML is right.
  const hasHeroCta = pathname === '/' || pathname === '/en';
  const [heroSeen, setHeroSeen] = useState<{ path: string; visible: boolean } | null>(null);
  const calm = heroSeen && heroSeen.path === pathname ? heroSeen.visible : hasHeroCta;
  useEffect(() => {
    const cta = document.querySelector('[data-hero-cta]');
    if (!cta) {
      const id = requestAnimationFrame(() => setHeroSeen({ path: pathname, visible: false }));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(([entry]) => setHeroSeen({ path: pathname, visible: entry.isIntersecting }), { rootMargin: '0px 0px -80px 0px' });
    observer.observe(cta);
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden">
      <ul className="solid-bar mx-auto flex h-[4.25rem] max-w-md items-stretch justify-between rounded-[1.6rem] border border-line/80 px-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.55)]">
        {items.map(({ href, label: text, icon, book }) => {
          if (book)
            return (
              <li key={href} className="flex flex-1 justify-center">
                <BookLink lang={lang} className={`flex flex-col items-center gap-1 text-[0.7rem] font-extrabold transition-[margin] duration-300 ${calm ? 'mt-0 justify-center text-muted' : '-mt-5'}`}>
                  <span
                    className={`grid place-items-center rounded-full transition-all duration-300 ${
                      calm ? 'size-7 bg-transparent text-muted' : 'pulse-ring size-14 bg-accent text-on-accent shadow-[0_10px_24px_-6px_var(--accent)] ring-4 ring-bg'
                    }`}
                  >
                    <Icon name={icon} size={calm ? 22 : 26} />
                  </span>
                  {text}
                </BookLink>
              </li>
            );
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl text-[0.7rem] font-bold transition ${active ? 'text-accent-text' : 'text-muted'}`}
              >
                <Icon name={icon} size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="leading-none">{text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
