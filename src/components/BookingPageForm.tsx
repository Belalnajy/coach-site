'use client';

import { useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import BookingForm from './BookingForm';

/** The booking form on /book, pre-filled from ?package=…&goal=… links. */
export default function BookingPageForm({ lang }: { lang: Locale }) {
  const params = useSearchParams();
  const preset = { packageId: params.get('package') ?? undefined, goal: params.get('goal') ?? undefined };
  return <BookingForm key={`${preset.packageId}-${preset.goal}`} lang={lang} preset={preset} variant="page" />;
}
