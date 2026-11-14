'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon, { type IconName } from './Icon';
import { isActive } from './nav';

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/**
 * The interactive part of the header: active-page marks, the background
 * that appears once the page scrolls, and the phone menu sheet (a native
 * <dialog>). Everything language- or coach-specific arrives as props or
 * ready-made elements from the server-rendered Header.
 */
export default function HeaderBar({
  items,
  labels,
  coachName,
  logo,
  actions,
  menuExtras,
}: {
  items: NavItem[];
  labels: { main: string; openMenu: string; menu: string; close: string };
  coachName: string;
  logo: ReactNode;
  /** Language link, theme toggle and Book button, in that order. */
  actions: ReactNode;
  /** Language link and social links at the bottom of the phone menu. */
  menuExtras: ReactNode;
}) {
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
        {logo}

        <nav aria-label={labels.main} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.95rem] font-bold transition hover:text-ink ${active ? 'text-ink' : 'text-muted'}`}
                  >
                    {label}
                    {active && <span className="absolute inset-x-3.5 bottom-1.5 h-[3px] rounded-full bg-selected" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5">
          {actions}
          <button type="button" className="grid size-11 place-items-center rounded-full transition hover:bg-surface-2 lg:hidden" aria-label={labels.openMenu} aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        className="sheet"
        aria-label={labels.menu}
        onClick={(e) => {
          if (e.target === e.currentTarget) menu.current?.close();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <div className="mb-2 flex items-center justify-between">
            <p className="text-lg font-black">{coachName}</p>
            <button type="button" onClick={() => menu.current?.close()} className="grid size-11 place-items-center rounded-full bg-surface-2" aria-label={labels.close}>
              <Icon name="close" size={20} />
            </button>
          </div>
          <nav aria-label={labels.main}>
            <ul className="grid grid-cols-2 gap-2">
              {items.map(({ href, label, icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => menu.current?.close()}
                      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 font-bold transition ${active ? 'border-selected bg-selected/10' : 'border-line bg-surface-2'}`}
                    >
                      <Icon name={icon} size={20} className={active ? 'text-accent-text' : 'text-muted'} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-surface-2 p-2">{menuExtras}</div>
        </div>
      </dialog>
    </header>
  );
}
