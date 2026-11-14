'use client';

import { useSearchParams } from 'next/navigation';
import type { BookingData } from '@/lib/booking-data';
import BookingForm from './BookingForm';

/** The booking form on /book, pre-filled from ?package=…&goal=… links. */
export default function BookingPageForm({ data }: { data: BookingData }) {
  const params = useSearchParams();
  const preset = { packageId: params.get('package') ?? undefined, goal: params.get('goal') ?? undefined };
  return <BookingForm key={`${preset.packageId}-${preset.goal}`} data={data} preset={preset} variant="page" />;
}
