import type { PackageConfig } from '../../site.config/types';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { formatNumber } from '@/lib/format';
import { coach } from '@/lib/config';
import BookLink from './BookLink';
import Icon from './Icon';

export default function PackageCard({ pkg, lang, headingLevel = 3, compactFeatures = false }: { pkg: PackageConfig; lang: Locale; headingLevel?: 2 | 3; compactFeatures?: boolean }) {
  const t = dict(lang);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const features = compactFeatures ? pkg.features.slice(0, 3) : pkg.features;
  return (
    <article
      className={`relative flex h-full flex-col rounded-[1.75rem] border p-6 transition ${
        pkg.popular ? 'border-accent bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_14%,var(--surface))_0%,var(--surface)_55%)] shadow-[0_20px_60px_-30px_var(--accent)]' : 'border-line bg-surface'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted">
          <Icon name={pkg.kind === 'online' ? 'globe' : 'dumbbell'} size={14} />
          {pkg.kind === 'online' ? t.common.online : t.common.inPerson}
        </span>
        {pkg.popular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-hot px-3 py-1 text-xs font-extrabold text-on-hot">
            <Icon name="star" size={13} fill="currentColor" />
            {t.common.popular}
          </span>
        )}
      </div>
      <Heading className="text-2xl leading-tight font-black">{pkg.name[lang]}</Heading>
      <p className="mt-2 text-pretty text-muted">{pkg.summary[lang]}</p>
      <p className="mt-5 flex items-baseline gap-2">
        {pkg.price === 'on-request' ? (
          <span className="text-2xl font-black">{t.common.onRequest}</span>
        ) : (
          <>
            <span className="num text-5xl leading-none">{formatNumber(lang, pkg.price)}</span>
            <span className="font-bold">{coach.currency.label[lang]}</span>
          </>
        )}
        <span className="text-sm text-muted">· {pkg.per[lang]}</span>
      </p>
      <ul className="mt-5 mb-6 space-y-2.5" aria-label={t.programs.included}>
        {features.map((f) => (
          <li key={f.en} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-text">
              <Icon name="check" size={13} strokeWidth={3} />
            </span>
            <span className="text-[0.95rem]">{f[lang]}</span>
          </li>
        ))}
      </ul>
      <BookLink lang={lang} preset={{ packageId: pkg.id }} className={`btn mt-auto w-full ${pkg.popular ? 'btn-primary' : 'btn-ghost'}`}>
        {pkg.price === 'on-request' ? t.programs.askPrice : t.programs.bookThis}
        <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
      </BookLink>
    </article>
  );
}
