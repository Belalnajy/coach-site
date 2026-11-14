import type { TransformationConfig } from '../../site.config/types';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { goalLabel } from '@/lib/config';
import BeforeAfter from './BeforeAfter';
import Icon from './Icon';

/** One client's transformation: the slider and the story in numbers. */
export default function StoryCard({ story, lang, sizes, priority = false, hint = false, headingLevel = 3 }: { story: TransformationConfig; lang: Locale; sizes: string; priority?: boolean; hint?: boolean; headingLevel?: 2 | 3 }) {
  const t = dict(lang);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="card flex h-full flex-col overflow-hidden p-2.5">
      <BeforeAfter before={story.before} after={story.after} lang={lang} name={story.client[lang]} sizes={sizes} priority={priority} hint={hint} />
      <div className="flex flex-1 flex-col gap-4 p-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Heading className="text-lg font-black">{story.client[lang]}</Heading>
          {story.sample && <span className="badge-sample">{t.common.sampleStory}</span>}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-surface-2 px-2 py-3">
            <dt className="text-xs font-semibold text-muted">{t.transformations.result}</dt>
            <dd className="num mt-1 text-xl leading-tight text-accent-text">{story.result[lang]}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-2 py-3">
            <dt className="text-xs font-semibold text-muted">{t.transformations.duration}</dt>
            <dd className="num mt-1 text-xl leading-tight">{story.duration[lang]}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-2 py-3">
            <dt className="text-xs font-semibold text-muted">{t.transformations.goal}</dt>
            <dd className="mt-1 text-sm leading-tight font-bold">{goalLabel(story.goal, lang)}</dd>
          </div>
        </dl>
        {story.detail && (
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Icon name="bolt" size={16} className="text-accent-text" />
            {story.detail[lang]}
          </p>
        )}
        <blockquote className="mt-auto border-s-2 border-accent ps-3 text-pretty text-[0.95rem] leading-relaxed">“{story.quote[lang]}”</blockquote>
      </div>
    </article>
  );
}
