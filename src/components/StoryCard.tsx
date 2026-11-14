import type { TransformationConfig } from '../../site.config/types';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { goalLabel } from '@/lib/config';
import BeforeAfter from './BeforeAfter';
import Icon from './Icon';
import Numeric from './Numeric';
import { quote } from '@/lib/format';

/** One client's transformation: the slider and the story in numbers. */
export default function StoryCard({ story, lang, sizes, priority = false, hint = false, headingLevel = 3 }: { story: TransformationConfig; lang: Locale; sizes: string; priority?: boolean; hint?: boolean; headingLevel?: 2 | 3 }) {
  const t = dict(lang);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="card flex h-full flex-col overflow-hidden p-2.5">
      <BeforeAfter before={story.before} after={story.after} lang={lang} name={story.client[lang]} sizes={sizes} priority={priority} hint={hint} labels={{ before: t.transformations.before, after: t.transformations.after, slider: t.transformations.slider, sliderValue: t.transformations.sliderValue }} />
      <div className="flex flex-1 flex-col gap-4 p-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Heading className="text-lg font-black">{story.client[lang]}</Heading>
          {story.sample && <span className="badge-sample">{t.common.sampleStory}</span>}
        </div>
        <dl className="grid grid-cols-2 gap-2">
          <div className="col-span-2 flex items-end justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
            <dt className="sr-only">{t.transformations.result}</dt>
            <dd>
              <span className="block text-xs font-semibold text-muted" aria-hidden="true">
                {t.transformations.result}
              </span>
              <span className="num mt-1 block text-[2rem] leading-none text-accent-text">
                <Numeric text={story.result[lang]} />
              </span>
            </dd>
            {story.detail && (
              <dd className="flex items-center gap-1.5 pb-0.5 text-sm font-semibold text-muted">
                <Icon name="bolt" size={15} className="text-accent-text" />
                <Numeric text={story.detail[lang]} />
              </dd>
            )}
          </div>
          <div className="rounded-2xl bg-surface-2 px-4 py-3">
            <dt className="text-xs font-semibold text-muted">{t.transformations.duration}</dt>
            <dd className="mt-0.5 font-black">{story.duration[lang]}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-4 py-3">
            <dt className="text-xs font-semibold text-muted">{t.transformations.goal}</dt>
            <dd className="mt-0.5 font-black">{goalLabel(story.goal, lang)}</dd>
          </div>
        </dl>
        <blockquote className="border-s-2 border-accent ps-3 text-pretty text-[0.95rem] leading-relaxed">{quote(story.quote[lang], lang)}</blockquote>
      </div>
    </article>
  );
}
