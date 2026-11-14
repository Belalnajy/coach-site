'use client';

import { useState, type ReactNode } from 'react';
import type { Locale } from '../../site.config/types';
import { fill } from '@/lib/fill';
import BookLink from './BookLink';
import Icon from './Icon';

export interface GalleryStory {
  id: string;
  /** The story's goal and extra tags, for the filters. */
  goals: string[];
  /** The rendered card (built on the server). */
  card: ReactNode;
}

/**
 * Filter chips (by goal) over the grid of stories. The cards are rendered
 * on the server and only shown or hidden here, so this ships no config.
 * The closing button books with the goal currently filtered, if any.
 */
export default function TransformationsGallery({
  lang,
  stories,
  chips,
  labels,
}: {
  lang: Locale;
  stories: GalleryStory[];
  chips: { id: string; label: string }[];
  labels: { all: string; filterLabel: string; count: string; empty: string; cta: string };
}) {
  const [goal, setGoal] = useState('all');
  const shown = stories.filter((s) => goal === 'all' || s.goals.includes(goal));
  const count = fill(labels.count, { n: shown.length });
  return (
    <>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line/60 bg-bg/85 px-5 py-3 backdrop-blur-lg md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <div role="group" aria-label={labels.filterLabel} className="no-scrollbar -my-1 flex flex-1 gap-2 overflow-x-auto py-1">
            {[{ id: 'all', label: labels.all }, ...chips].map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={goal === c.id} onClick={() => setGoal(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="hidden shrink-0 text-sm font-semibold text-muted sm:block" aria-hidden="true">
            {count}
          </p>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {count}
      </p>
      {shown.length ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <li key={s.id} hidden={!shown.includes(s)}>
              {s.card}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-muted">{labels.empty}</p>
      )}
      <div className="mt-12 flex justify-center">
        <BookLink lang={lang} preset={goal === 'all' ? undefined : { goal }} className="btn btn-primary btn-lg w-full sm:w-auto">
          <Icon name="whatsapp" size={22} />
          {labels.cta}
        </BookLink>
      </div>
    </>
  );
}
