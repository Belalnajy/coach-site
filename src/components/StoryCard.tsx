import type { TransformationConfig } from '../../site.config/types';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { goalLabel } from '@/lib/config';
import BeforeAfter from './BeforeAfter';
import BookLink from './BookLink';
import Icon from './Icon';
import Numeric from './Numeric';

/**
 * One client's transformation: the slider (with angle buttons when there are
 * several views) and the facts from the coach's post: result, figures,
 * duration, goal, badges and the caption. No names, no invented quotes.
 */
export default function StoryCard({
  story,
  lang,
  sizes,
  priority = false,
  hint = false,
  headingLevel = 3,
  cta = false,
}: {
  story: TransformationConfig;
  lang: Locale;
  sizes: string;
  priority?: boolean;
  hint?: boolean;
  headingLevel?: 2 | 3;
  /** Show "I want a result like this", booking with this story's goal. */
  cta?: boolean;
}) {
  const t = dict(lang);
  const tt = t.transformations;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="card flex h-full flex-col overflow-hidden p-2.5">
      <BeforeAfter
        views={story.views}
        lang={lang}
        name={story.title[lang]}
        sizes={sizes}
        priority={priority}
        hint={hint}
        labels={{ before: tt.before, after: tt.after, slider: tt.slider, sliderValue: tt.sliderValue, angles: tt.angles, anglesLabel: tt.anglesLabel }}
      />
      <div className="flex flex-1 flex-col gap-4 p-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Heading className="text-lg font-black">
            <Numeric text={story.title[lang]} />
          </Heading>
          {story.sample && <span className="badge-sample">{t.common.sampleStory}</span>}
        </div>
        <dl className="grid grid-cols-2 gap-2">
          {/* The result tile only when the coach's caption gives a number. */}
          {story.result && (
            <div className="col-span-2 flex items-end justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
              <dt className="sr-only">{tt.result}</dt>
              <dd>
                <span className="block text-xs font-semibold text-muted" aria-hidden="true">
                  {tt.result}
                </span>
                <span className="num mt-1 block text-[2rem] leading-none text-accent-text">
                  <Numeric text={story.result[lang]} />
                </span>
              </dd>
              {story.detail && (
                <dd className="flex items-center gap-1.5 pb-0.5 text-end text-sm font-semibold text-muted">
                  <Icon name="bolt" size={15} className="shrink-0 text-accent-text" />
                  <Numeric text={story.detail[lang]} />
                </dd>
              )}
            </div>
          )}
          <div className={`rounded-2xl bg-surface-2 px-4 py-3 ${story.duration ? '' : 'col-span-2'}`}>
            <dt className="text-xs font-semibold text-muted">{tt.goal}</dt>
            <dd className="mt-0.5 font-black">{goalLabel(story.goal, lang)}</dd>
          </div>
          {story.duration && (
            <div className="rounded-2xl bg-surface-2 px-4 py-3">
              <dt className="text-xs font-semibold text-muted">{tt.duration}</dt>
              <dd className="mt-0.5 font-black">
                <Numeric text={story.duration[lang]} />
              </dd>
            </div>
          )}
        </dl>
        {story.stages && story.stages.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">{tt.stages}</p>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
              {story.stages.map((st, i) => (
                <li key={st.en} className="flex items-center gap-1.5">
                  {i > 0 && <Icon name="arrow" size={14} className="text-muted rtl:-scale-x-100" />}
                  <span className="rounded-lg bg-surface-2 px-2 py-1">
                    <Numeric text={st[lang]} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {story.badges && story.badges.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {story.badges.map((b) => (
              <li key={b} className="rounded-full border border-accent-text/50 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent-text">
                {tt.badges[b]}
              </li>
            ))}
          </ul>
        )}
        <p className="text-pretty text-[0.95rem] leading-relaxed text-muted">
          <Numeric text={story.caption[lang]} />
        </p>
        {cta && (
          <BookLink lang={lang} preset={{ goal: story.goal }} className="btn btn-ghost mt-auto w-full !min-h-11 text-sm">
            <Icon name="whatsapp" size={18} />
            {tt.cta}
          </BookLink>
        )}
      </div>
    </article>
  );
}
