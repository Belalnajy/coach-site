'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Fades sections in as they scroll into view. One observer for the whole
 * page instead of one component per section; elements opt in with the
 * `data-reveal` attribute (`data-marquee` only gets the class, which starts
 * its animation). Re-scans after each client-side navigation.
 */
export default function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(':is([data-reveal], [data-marquee]):not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
