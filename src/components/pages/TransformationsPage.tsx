import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach } from '@/lib/config';
import BookLink from '../BookLink';
import Icon from '../Icon';
import PageHeader from '../PageHeader';
import TransformationsGallery from '../TransformationsGallery';

export default function TransformationsPage({ lang }: { lang: Locale }) {
  const t = dict(lang).transformations;
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
          <TransformationsGallery lang={lang} />
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted">{t.resultsVary}</p>
          <BookLink lang={lang} className="btn btn-primary btn-lg w-full sm:w-auto">
            <Icon name="whatsapp" size={22} />
            {t.cta}
          </BookLink>
        </div>
      </div>
    </>
  );
}
