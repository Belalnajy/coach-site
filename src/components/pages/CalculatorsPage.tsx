import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import Calculators from '../Calculators';
import PageHeader from '../PageHeader';

export default function CalculatorsPage({ lang }: { lang: Locale }) {
  const t = dict(lang).calculators;
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="container-x pb-20 md:pb-28">
        <Calculators lang={lang} />
      </div>
    </>
  );
}
