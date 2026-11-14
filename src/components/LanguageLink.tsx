'use client';

import { usePathname } from 'next/navigation';
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
  return (
    <a
      href={twinPath(pathname, other)}
      hrefLang={other}
      lang={other}
      className={`${className.includes('hidden') ? '' : 'inline-flex'} min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition hover:bg-surface-2 ${className}`}
      aria-label={switchLabel}
      onClick={() => {
        try {
          localStorage.setItem('lang', other);
        } catch {
          /* ignore */
        }
      }}
    >
      {withIcon && <Icon name="globe" size={18} />}
      <span>{label}</span>
    </a>
  );
}
