'use client';

import { useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { theme } from '@/lib/config';
import Icon from './Icon';

type Mode = 'dark' | 'light';

const read = (): Mode => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};

/** Switches dark/light and remembers the choice on this device. */
export default function ThemeToggle({ lang, className = '' }: { lang: Locale; className?: string }) {
  const mode = useSyncExternalStore(subscribe, read, () => theme.defaultMode);
  const t = dict(lang).nav;
  const next: Mode = mode === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className={`grid size-11 place-items-center rounded-full text-ink transition hover:bg-surface-2 ${className}`}
      aria-label={next === 'light' ? t.themeToLight : t.themeToDark}
      onClick={() => {
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
        } catch {
          /* private mode: the choice lasts for this page only */
        }
      }}
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={20} />
    </button>
  );
}
