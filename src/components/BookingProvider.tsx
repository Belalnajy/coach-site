'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

/** What a "Book" button can pre-fill in the form. */
export interface BookingPreset {
  packageId?: string;
  goal?: string;
  note?: string;
}

interface BookingContextValue {
  openBooking: (preset?: BookingPreset) => void;
  preloadBooking: () => void;
}

const BookingContext = createContext<BookingContextValue>({ openBooking: () => {}, preloadBooking: () => {} });
export const useBooking = () => useContext(BookingContext);

const loadSheet = () => import('./BookingSheet');
// The sheet (and the form inside it) is only downloaded when a visitor is
// about to use it: on hover/touch of a Book button, or on the first open.
const BookingSheet = dynamic(loadSheet, { ssr: false });

/**
 * Lets every "Book" button on every page open the same booking sheet.
 * Without JavaScript the buttons are plain links to the /book page.
 */
export default function BookingProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; preset: BookingPreset; key: number } | null>(null);
  const openBooking = useCallback((preset: BookingPreset = {}) => setState((s) => ({ open: true, preset, key: (s?.key ?? 0) + 1 })), []);
  const close = useCallback(() => setState((s) => (s ? { ...s, open: false } : s)), []);
  const value = useMemo(() => ({ openBooking, preloadBooking: () => void loadSheet() }), [openBooking]);
  return (
    <BookingContext.Provider value={value}>
      {children}
      {state && <BookingSheet lang={lang} open={state.open} preset={state.preset} formKey={state.key} onClose={close} />}
    </BookingContext.Provider>
  );
}
