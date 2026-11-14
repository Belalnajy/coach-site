import type { Locale } from '@/lib/i18n';
import { faq } from '@/lib/config';
import Icon from './Icon';

/** Questions and answers as native disclosure widgets: no JavaScript needed. */
export default function Faq({ lang }: { lang: Locale }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[1.75rem] border border-line bg-surface">
      {faq.map((item, i) => (
        <details key={i} className="group" open={i === 0}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start text-[1.05rem] font-bold md:px-7 [&::-webkit-details-marker]:hidden">
            <h3>{item.question[lang]}</h3>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 transition group-open:rotate-45 group-open:bg-accent group-open:text-on-accent" aria-hidden="true">
              <Icon name="plus" size={18} strokeWidth={2.6} />
            </span>
          </summary>
          <p className="px-5 pb-6 text-pretty text-muted md:px-7">{item.answer[lang]}</p>
        </details>
      ))}
    </div>
  );
}
