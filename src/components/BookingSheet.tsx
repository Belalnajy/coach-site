'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import type { BookingData } from '@/lib/booking-data';
import BookingForm from './BookingForm';
import type { BookingPreset } from './BookingProvider';
import Icon from './Icon';

/**
 * The booking form in a sheet: rises from the bottom on phones, a centred
 * dialog on wider screens. A native <dialog>, so focus stays inside, Escape
 * closes it and the page behind is inert for screen readers.
 *
 * Layout: the dialog is a flex column capped at the screen height; the
 * header stays put, the fields scroll in their own area, and the footer with
 * the Send button is always visible.
 *
 * On phones the header can be dragged down to close. The pointer is only
 * captured once it has actually moved, and never from the close button, so
 * taps and clicks on the header keep working.
 */
export default function BookingSheet({
  data,
  open,
  preset,
  formKey,
  onClose,
}: {
  data: BookingData;
  open: boolean;
  preset: BookingPreset;
  formKey: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ y: number; dy: number; id: number; captured: boolean } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    drag.current = { y: e.clientY, dy: 0, id: e.pointerId, captured: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dy = Math.max(0, e.clientY - d.y);
    if (!d.captured) {
      if (d.dy < 6) return;
      d.captured = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      ref.current?.classList.add('dragging');
    }
    ref.current?.style.setProperty('--drag', `${d.dy}px`);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.captured) return;
    ref.current?.classList.remove('dragging');
    ref.current?.style.removeProperty('--drag');
    if (d.dy > 110) onClose();
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
      <div className="shrink-0 touch-none px-5 pt-2 pb-3 select-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="booking-sheet-title" className="text-xl font-black">
              {data.t.book.sheetTitle}
            </h2>
            <p className="text-sm text-muted">{data.t.book.sheetText}</p>
          </div>
          <button type="button" onClick={onClose} className="-me-2 grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 transition hover:bg-line" aria-label={data.t.close}>
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
      <BookingForm key={formKey} data={data} preset={preset} variant="sheet" />
    </dialog>
  );
}
