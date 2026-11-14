'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { Locale } from '../../site.config/types';
import { twinPath } from '@/lib/routes';
import Icon from './Icon';

/** Goes to the same page in the other language. Labels come in as props (see ThemeToggle). */
export default function LanguageLink({
  lang,
  label,
  switchLabel,
  className = '',
  withIcon = true,
}: {
  lang: Locale;
  /** The other language's name, e.g. "English". */
  label: string;
  /** Accessible name, e.g. "Switch to English". */
  switchLabel: string;
  className?: string;
  withIcon?: boolean;
}) {
  const pathname = usePathname() ?? '/';
  const other: Locale = lang === 'ar' ? 'en' : 'ar';
  const ref = useRef<HTMLAnchorElement>(null);
  const base = twinPath(pathname, other);
  // Keep the query and the hash (?package=…, #bmi): the server cannot know
  // them, so the link is completed in the browser, and kept up to date.
  useEffect(() => {
    const update = () => {
      if (ref.current) ref.current.href = `${base}${window.location.search}${window.location.hash}`;
    };
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [base]);
  return (
    <a
      ref={ref}
      href={base}
      hrefLang={other}
      lang={other}
      className={`${className.includes('hidden') ? '' : 'inline-flex'} min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition hover:bg-surface-2 ${className}`}
      aria-label={switchLabel}
    >
      {withIcon && <Icon name="globe" size={18} />}
      <span>{label}</span>
    </a>
  );
}
