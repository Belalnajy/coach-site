import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { booking, coach, transformations } from '@/lib/config';
import PageHeader from '../PageHeader';
import StoryCard from '../StoryCard';
import TransformationsGallery from '../TransformationsGallery';

export default function TransformationsPage({ lang }: { lang: Locale }) {
  const t = dict(lang).transformations;
  // Filters: the goals that have stories, then two badges worth filtering by.
  const goalsOf = (s: (typeof transformations)[number]) => [s.goal, ...(s.tags ?? []), ...(s.badges ?? [])];
  const FILTER_BADGES = ['posture', 'online'] as const;
  const chips = [
    ...booking.goals.map((g) => ({ id: g.id, label: g.label[lang] })),
    ...FILTER_BADGES.map((b) => ({ id: b, label: t.badges[b] })),
  ].filter((c) => transformations.some((s) => goalsOf(s).includes(c.id)));
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="container-x pb-16 md:pb-24">
        {coach.sample && (
          <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-hot/40 bg-hot/10 p-4 text-sm font-semibold">
            <span className="badge-sample shrink-0">{dict(lang).common.sample}</span>
            {t.sampleNote}
          </p>
        )}
        <div className="mt-4">
          <TransformationsGallery
            lang={lang}
            chips={chips}
            labels={{ all: t.all, filterLabel: t.filterLabel, count: t.count, empty: t.empty, cta: t.cta, showMore: t.showMore }}
            stories={transformations.map((s, i) => ({
              id: s.id,
              goals: goalsOf(s),
              card: <StoryCard story={s} lang={lang} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" priority={i === 0} hint={i === 0} headingLevel={2} cta />,
            }))}
          />
        </div>
        <p className="mt-6 text-center text-sm text-muted">{t.resultsVary}</p>
      </div>
    </>
  );
}
