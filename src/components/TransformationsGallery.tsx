'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { booking, transformations } from '@/lib/config';
import { formatNumber } from '@/lib/format';
import StoryCard from './StoryCard';

const matches = (goal: string, story: (typeof transformations)[number]) => goal === 'all' || story.goal === goal || story.tags?.includes(goal);

/** Filter chips (by goal) over the grid of stories. Goals with no story are not offered. */
export default function TransformationsGallery({ lang }: { lang: Locale }) {
  const t = dict(lang).transformations;
  const [goal, setGoal] = useState('all');
  const goals = booking.goals.filter((g) => transformations.some((s) => matches(g.id, s)));
  const shown = transformations.filter((s) => matches(goal, s));
  const chips = [{ id: 'all', label: t.all }, ...goals.map((g) => ({ id: g.id, label: g.label[lang] }))];
  return (
    <>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line/60 bg-bg/85 px-5 py-3 backdrop-blur-lg md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <div role="group" aria-label={t.filterLabel} className="no-scrollbar -my-1 flex flex-1 gap-2 overflow-x-auto py-1">
            {chips.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={goal === c.id} onClick={() => setGoal(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="hidden shrink-0 text-sm font-semibold text-muted sm:block" aria-hidden="true">
            {fill(t.count, { n: formatNumber(lang, shown.length) })}
          </p>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {fill(t.count, { n: shown.length })}
      </p>
      {shown.length ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((story, i) => (
            <li key={story.id}>
              <StoryCard story={story} lang={lang} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" priority={i === 0} hint={i === 0} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-muted">{t.empty}</p>
      )}
    </>
  );
}
