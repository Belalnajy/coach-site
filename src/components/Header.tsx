'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach } from '@/lib/config';
import { route } from '@/lib/routes';
import BookLink from './BookLink';
import Icon from './Icon';
import LanguageLink from './LanguageLink';
import Logo from './Logo';
import { NAV, isActive } from './nav';
import Socials from './Socials';
import ThemeToggle from './ThemeToggle';

export default function Header({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const pathname = usePathname() ?? '/';
  const menu = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the phone menu when a link inside it navigates.
  useEffect(() => {
    if (menu.current?.open) menu.current.close();
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${scrolled ? 'glass border-b border-line/70' : 'border-b border-transparent'}`}>
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <Logo lang={lang} />

        <nav aria-label={t.nav.main} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map(({ key }) => {
              const target = route(lang, key);
              const active = isActive(pathname, target);
              return (
                <li key={key}>
                  <Link
                    href={target}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.95rem] font-bold transition hover:text-ink ${active ? 'text-ink' : 'text-muted'}`}
                  >
                    {t.nav[key]}
                    {active && <span className="absolute inset-x-3.5 bottom-1.5 h-[3px] rounded-full bg-accent" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5">
          <LanguageLink lang={lang} className="hidden sm:inline-flex" />
          <ThemeToggle lang={lang} />
          <BookLink lang={lang} className="btn btn-primary ms-2 hidden !min-h-11 !px-5 md:inline-flex">
            {t.common.bookNow}
          </BookLink>
          <button type="button" className="grid size-11 place-items-center rounded-full transition hover:bg-surface-2 lg:hidden" aria-label={t.nav.openMenu} aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        className="sheet"
        aria-label={t.nav.menu}
        onClick={(e) => {
          if (e.target === e.currentTarget) menu.current?.close();
        }}
      >
        <div className="flex max-h-[inherit] flex-col overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <div className="mb-2 flex items-center justify-between">
            <p className="text-lg font-black">{coach.name[lang]}</p>
            <button type="button" onClick={() => menu.current?.close()} className="grid size-11 place-items-center rounded-full bg-surface-2" aria-label={t.nav.close}>
              <Icon name="close" size={20} />
            </button>
          </div>
          <nav aria-label={t.nav.main}>
            <ul className="grid grid-cols-2 gap-2">
              {NAV.map(({ key, icon }) => {
                const target = route(lang, key);
                const active = isActive(pathname, target);
                return (
                  <li key={key}>
                    <Link
                      href={target}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => menu.current?.close()}
                      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 font-bold transition ${active ? 'border-accent bg-accent/10' : 'border-line bg-surface-2'}`}
                    >
                      <Icon name={icon} size={20} className={active ? 'text-accent-text' : 'text-muted'} />
                      {t.nav[key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-surface-2 p-2">
            <LanguageLink lang={lang} />
            <Socials lang={lang} size="sm" />
          </div>
        </div>
      </dialog>
    </header>
  );
}
