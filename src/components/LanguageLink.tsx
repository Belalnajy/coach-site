'use client';

import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { dict, otherLocale } from '@/lib/i18n';
import { twinPath } from '@/lib/routes';
import Icon from './Icon';

/** Goes to the same page in the other language. */
export default function LanguageLink({ lang, className = '', withIcon = true }: { lang: Locale; className?: string; withIcon?: boolean }) {
  const pathname = usePathname() ?? '/';
  const other = otherLocale(lang);
  const t = dict(lang);
  return (
    <a
      href={twinPath(pathname, other)}
      hrefLang={other}
      lang={other}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition hover:bg-surface-2 ${className}`}
      aria-label={t.nav.switchLanguage}
      onClick={() => {
        try {
          localStorage.setItem('lang', other);
        } catch {
          /* ignore */
        }
      }}
    >
      {withIcon && <Icon name="globe" size={18} />}
      <span>{t.otherLanguage}</span>
    </a>
  );
}
