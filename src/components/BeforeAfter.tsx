'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale, TransformationView } from '../../site.config/types';
import { fill } from '@/lib/fill';

export interface BeforeAfterLabels {
  before: string;
  after: string;
  /** "Before and after comparison: {name}" */
  slider: string;
  /** "Before {before}%, after {after}%" */
  sliderValue: string;
  /** Names of the angles, and of the group of angle buttons. */
  angles?: Record<TransformationView['angle'], string>;
  anglesLabel?: string;
}

/**
 * Before/after comparison. "Before" sits on the reading-start side (left in
 * English, right in Arabic).
 *
 * The position is a percentage (0–100) and nothing else: the clip and the
 * divider are both drawn from it in CSS, so it is right whatever the card's
 * measured width, in a sideways rail, after a resize or a rotation, in LTR
 * and RTL. Widths are only read during a gesture, at that moment.
 *
 * - Touch (and pen): ONLY a drag that starts on the handle moves the divider
 *   (a 56px strip around the line, plus the round knob). The picture itself
 *   ignores fingers entirely, tap or swipe: scrolling the page or the rail
 *   with a finger on a photo can never move the divider.
 * - Mouse: press and drag anywhere on the picture.
 *
 * The frame takes the pair's own aspect ratio (whole photos, nothing cut).
 * - Keyboard: focus the handle; arrows, Home/End, Page Up/Down.
 *
 * With several views (front, side, back), buttons under the picture switch
 * between them; the divider stays where it is.
 */
export default function BeforeAfter({
  views,
  lang,
  name,
  sizes,
  priority = false,
  hint = false,
  labels: t,
}: {
  views: TransformationView[];
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
  const [value, setValue] = useState(50);
  const pos = useRef(50);
  const drag = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const { before, after } = views[current] ?? views[0];
  const aspect = `${before.width} / ${before.height}`;
  const rtl = lang === 'ar';

  /** Moves the divider. While dragging, only the CSS variable changes (no render per frame). */
  const apply = (next: number, commit = true) => {
    const clamped = Math.round(Math.min(100, Math.max(0, next)) * 10) / 10;
    pos.current = clamped;
    root.current?.style.setProperty('--pos', `${clamped}%`);
    if (commit) setValue(clamped);
  };

  /** Percentage from the reading-start edge, measured at the moment of the event. */
  const fromPointer = (clientX: number) => {
    const rect = root.current!.getBoundingClientRect();
    if (!rect.width) return pos.current;
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
        if (drag.current !== null || pos.current !== 50) return;
        el.animate([{ '--pos': '50%' }, { '--pos': '32%' }, { '--pos': '66%' }, { '--pos': '50%' }], { duration: 1500, delay: 300, easing: 'cubic-bezier(.45,0,.25,1)' });
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hint]);

  const startDrag = (e: PointerEvent<HTMLElement>) => {
    drag.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  // The handle strip: a drag from here moves the divider, for every pointer type.
  const onHandleDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    startDrag(e);
  };
  // The picture: only a mouse drags from here. Touch and pen are ignored.
  const onPictureDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    startDrag(e);
    apply(fromPointer(e.clientX), false);
  };
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (drag.current === e.pointerId) apply(fromPointer(e.clientX), false);
  };
  const onUp = (e: PointerEvent<HTMLElement>) => {
    if (drag.current !== e.pointerId) return;
    drag.current = null;
    apply(pos.current);
  };
  const onCancel = () => {
    if (drag.current !== null) apply(pos.current);
    drag.current = null;
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
    <div>
      <div
        ref={root}
        data-ba-frame
        className="relative cursor-ew-resize overflow-hidden rounded-[1.5rem] bg-surface-2 select-none [touch-action:pan-x_pan-y]"
        // Whole photos: the frame has the pair's own shape. A very tall pair is
        // narrowed (centred) so it never grows taller than 72% of the screen.
        style={{ ['--pos' as string]: `${value}%`, aspectRatio: aspect, width: `min(100%, calc(72svh * ${before.width} / ${before.height}))`, marginInline: 'auto' }}
        onPointerDown={onPictureDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <Image src={after.src} alt={after.alt[lang]} fill sizes={sizes} preload={priority} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} className="pointer-events-none object-contain" draggable={false} />
        <div className="ba-before absolute inset-0">
          <Image src={before.src} alt={before.alt[lang]} fill sizes={sizes} preload={priority} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} className="pointer-events-none object-contain" draggable={false} />
        </div>
        <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-extrabold tracking-wide text-white backdrop-blur" aria-hidden="true">
          {t.before}
        </span>
        <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-extrabold tracking-wide text-on-accent" aria-hidden="true">
          {t.after}
        </span>
        {/* The divider: a thin line, inside a 56px strip that takes the drag. */}
        <div className="ba-layer pointer-events-none absolute inset-0">
        <div
          data-ba-divider
          className="pointer-events-auto absolute inset-y-0 left-1/2 w-14 -translate-x-1/2 cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onHandleDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
        >
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.5)]" aria-hidden="true" />
          <div
            role="slider"
            tabIndex={0}
            aria-label={fill(t.slider, { name })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value)}
            aria-valuetext={fill(t.sliderValue, { before: Math.round(value), after: 100 - Math.round(value) })}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-[0_6px_24px_rgb(0_0_0/0.45)] outline-offset-4"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </div>
        </div>
        </div>
      </div>
      {views.length > 1 && t.angles && (
        <div role="group" aria-label={t.anglesLabel} className="mt-2 flex gap-1.5">
          {views.map((v, i) => (
            <button key={v.angle} type="button" className="chip !min-h-11 flex-1 !px-3 text-sm" aria-pressed={i === current} onClick={() => setCurrent(i)}>
              {t.angles![v.angle]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
