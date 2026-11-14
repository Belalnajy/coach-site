'use client';

import type { MouseEvent, ReactNode } from 'react';
import type { Locale } from '../../site.config/types';
import { route } from '@/lib/routes';
import { useBooking, type BookingPreset } from './BookingProvider';

/**
 * A "Book" call to action. It is a real link to the booking page, so it
 * works without JavaScript and can be opened in a new tab; a plain click
 * opens the booking sheet over the current page instead.
 */
export default function BookLink({
  lang,
  preset,
  className,
  children,
  ariaLabel,
}: {
  lang: Locale;
  preset?: BookingPreset;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { openBooking, preloadBooking } = useBooking();
  const query = new URLSearchParams();
  if (preset?.packageId) query.set('package', preset.packageId);
  if (preset?.goal) query.set('goal', preset.goal);
  const target = `${route(lang, 'book')}${query.size ? `?${query}` : ''}`;
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openBooking(preset);
  };
  return (
    <a href={target} className={className} onClick={onClick} onPointerEnter={preloadBooking} onTouchStart={preloadBooking} onFocus={preloadBooking} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
