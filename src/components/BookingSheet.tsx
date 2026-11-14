'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import BookingForm from './BookingForm';
import type { BookingPreset } from './BookingProvider';
import Icon from './Icon';

/**
 * The booking form in a sheet: rises from the bottom on phones (drag the
 * handle down to close), a centred dialog on wider screens. A native
 * <dialog>, so focus stays inside, Escape closes it and the page behind is
 * inert for screen readers.
 */
export default function BookingSheet({
  lang,
  open,
  preset,
  formKey,
  onClose,
}: {
  lang: Locale;
  open: boolean;
  preset: BookingPreset;
  formKey: number;
  onClose: () => void;
}) {
  const t = dict(lang);
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    drag.current = { y: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current?.classList.add('dragging');
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    ref.current?.style.setProperty('--drag', `${drag.current.dy}px`);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    const { dy } = drag.current;
    drag.current = null;
    ref.current?.classList.remove('dragging');
    ref.current?.style.removeProperty('--drag');
    if (dy > 110) onClose();
  };

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="booking-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop (outside the panel) closes the sheet.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="shrink-0 touch-none px-5 pt-2 pb-3 select-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="booking-sheet-title" className="text-xl font-black">
                {t.book.sheetTitle}
              </h2>
              <p className="text-sm text-muted">{t.book.sheetText}</p>
            </div>
            <button type="button" onClick={onClose} className="-me-2 grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 transition hover:bg-line" aria-label={t.nav.close}>
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>
        <BookingForm key={formKey} lang={lang} preset={preset} variant="sheet" />
      </div>
    </dialog>
  );
}
