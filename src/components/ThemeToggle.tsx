'use client';

import { useSyncExternalStore } from 'react';
import Icon from './Icon';

type Mode = 'dark' | 'light';

const read = (): Mode => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};

/**
 * Switches dark/light and remembers the choice on this device. Strings come
 * in as props so this always-loaded component does not pull the whole
 * config and both dictionaries into the browser bundle.
 */
export default function ThemeToggle({ labels, defaultMode, className = '' }: { labels: { toDark: string; toLight: string }; defaultMode: Mode; className?: string }) {
  const mode = useSyncExternalStore(subscribe, read, () => defaultMode);
  const next: Mode = mode === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className={`grid size-11 place-items-center rounded-full text-ink transition hover:bg-surface-2 ${className}`}
      aria-label={next === 'light' ? labels.toLight : labels.toDark}
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
