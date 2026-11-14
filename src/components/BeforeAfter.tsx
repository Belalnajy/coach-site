'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale, Picture } from '../../site.config/types';
import { fill } from '@/lib/fill';

export interface BeforeAfterLabels {
  before: string;
  after: string;
  /** "Before and after comparison: {name}" */
  slider: string;
  /** "Before {before}%, after {after}%" */
  sliderValue: string;
}

/**
 * Before/after comparison. "Before" sits on the reading-start side (left in
 * English, right in Arabic). Drag anywhere on the picture, tap to jump, or
 * focus the handle and use the arrow keys, Home/End and Page Up/Down.
 *
 * While dragging, the position is written straight to a CSS variable (no
 * React render per frame), so it stays smooth on slow phones. A horizontal
 * drag moves the divider; a vertical one still scrolls the page.
 */
export default function BeforeAfter({
  before,
  after,
  lang,
  name,
  sizes,
  priority = false,
  hint = false,
  labels: t,
}: {
  before: Picture;
  after: Picture;
  lang: Locale;
  name: string;
  sizes: string;
  priority?: boolean;
  /** Play a short left-right nudge the first time it scrolls into view. */
  hint?: boolean;
  /** Strings from the page's dictionary (passed in so the slider ships without them). */
  labels: BeforeAfterLabels;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const gesture = useRef<{ x: number; y: number; id: number; dragging: boolean } | null>(null);
  const [value, setValue] = useState(50);
  const rtl = lang === 'ar';

  const apply = (next: number, commit = true) => {
    const clamped = Math.min(100, Math.max(0, next));
    pos.current = clamped;
    root.current?.style.setProperty('--pos', `${clamped}%`);
    if (commit) setValue(Math.round(clamped));
  };

  const fromPointer = (clientX: number) => {
    const rect = root.current!.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return (rtl ? 1 - ratio : ratio) * 100;
  };

  useEffect(() => {
    const el = root.current;
    if (!hint || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (gesture.current || pos.current !== 50) return;
        el.animate([{ '--pos': '50%' }, { '--pos': '32%' }, { '--pos': '66%' }, { '--pos': '50%' }], { duration: 1500, delay: 300, easing: 'cubic-bezier(.45,0,.25,1)' });
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hint]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, dragging: e.pointerType === 'mouse' };
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId);
      apply(fromPointer(e.clientX), false);
    }
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.dragging) {
      const dx = Math.abs(e.clientX - g.x);
      const dy = Math.abs(e.clientY - g.y);
      if (dx < 6 && dy < 6) return;
      if (dy > dx) {
        gesture.current = null; // a scroll, not a drag
        return;
      }
      g.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    apply(fromPointer(e.clientX), false);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    // A tap (no drag) jumps the divider to where the finger landed.
    apply(g.dragging ? pos.current : fromPointer(e.clientX));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const step = e.shiftKey ? 10 : 5;
    const moves: Record<string, number> = {
      [forward]: pos.current + step,
      ArrowUp: pos.current + step,
      [back]: pos.current - step,
      ArrowDown: pos.current - step,
      PageUp: pos.current + 20,
      PageDown: pos.current - 20,
      Home: 0,
      End: 100,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    apply(moves[e.key]);
  };

  return (
    <div
      ref={root}
      className="relative aspect-[4/5] cursor-ew-resize touch-pan-y overflow-hidden rounded-[1.5rem] bg-surface-2 select-none"
      style={{ ['--pos' as string]: '50%' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (gesture.current = null)}
    >
      <Image src={after.src} alt={after.alt[lang]} fill sizes={sizes} preload={priority} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} className="pointer-events-none object-cover" draggable={false} />
      <div className="ba-before absolute inset-0">
        <Image src={before.src} alt={before.alt[lang]} fill sizes={sizes} preload={priority} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} className="pointer-events-none object-cover" draggable={false} />
      </div>
      <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-extrabold tracking-wide text-white backdrop-blur" aria-hidden="true">
        {t.before}
      </span>
      <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-extrabold tracking-wide text-on-accent" aria-hidden="true">
        {t.after}
      </span>
      <div className="ba-divider pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.5)] rtl:translate-x-1/2">
        <div
          role="slider"
          tabIndex={0}
          aria-label={fill(t.slider, { name })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={fill(t.sliderValue, { before: value, after: 100 - value })}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-white text-black shadow-[0_6px_24px_rgb(0_0_0/0.45)] outline-offset-4 active:cursor-grabbing"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
