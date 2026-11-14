import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { coach, packages } from '@/lib/config';
import { offersJsonLd } from '@/lib/jsonld';
import { whatsappUrl } from '@/lib/whatsapp';
import Icon from '../Icon';
import JsonLd from '../JsonLd';
import PackageCard from '../PackageCard';
import PageHeader from '../PageHeader';

export default function ProgramsPage({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const sections = [
    { kind: 'online' as const, title: t.programs.online, text: t.programs.onlineText, icon: 'globe' as const },
    { kind: 'in-person' as const, title: t.programs.inPerson, text: fill(t.programs.inPersonText, { gym: coach.location.gym[lang] }), icon: 'dumbbell' as const },
  ];
  const question = lang === 'ar' ? `مرحباً ${coach.shortName.ar}، محتار بين باقتين وأريد اقتراحك.` : `Hi ${coach.shortName.en}, I can’t decide between two programs and would like your advice.`;
  return (
    <>
      <JsonLd data={offersJsonLd(lang)} />
      <PageHeader eyebrow={t.programs.eyebrow} title={t.programs.title} intro={t.programs.intro}>
        <nav aria-label={t.programs.eyebrow} className="mt-6 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a key={s.kind} href={`#${s.kind}`} className="chip">
              <Icon name={s.icon} size={17} />
              {s.title}
            </a>
          ))}
        </nav>
      </PageHeader>
      <div className="container-x space-y-16 py-12 md:space-y-24 md:py-20">
        {sections.map((s) => {
          const list = packages.filter((p) => p.kind === s.kind);
          if (!list.length) return null;
          return (
            <section key={s.kind} id={s.kind} aria-labelledby={`${s.kind}-title`} className="scroll-mt-24">
              <div className="mb-8 flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
                  <Icon name={s.icon} size={26} />
                </span>
                <div>
                  <h2 id={`${s.kind}-title`} className="display text-4xl sm:text-5xl">
                    {s.title}
                  </h2>
                  <p className="text-muted">{s.text}</p>
                </div>
              </div>
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <li key={p.id} data-reveal>
                    <PackageCard pkg={p} lang={lang} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card flex gap-4 p-6 md:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent-text">
              <Icon name="shield" size={24} />
            </span>
            <div>
              <h2 className="text-xl font-black">{t.programs.guaranteeTitle}</h2>
              <p className="mt-1 text-muted">{t.programs.guaranteeText}</p>
            </div>
          </div>
          <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center md:p-8">
            <div className="flex-1">
              <h2 className="text-xl font-black">{t.programs.notSure}</h2>
              <p className="mt-1 text-muted">{t.programs.notSureText}</p>
            </div>
            <a href={whatsappUrl(coach.whatsapp, question)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost shrink-0">
              <Icon name="whatsapp" size={20} />
              {t.programs.notSureCta}
              <span className="sr-only">{t.common.newTab}</span>
            </a>
          </div>
        </div>
        <p className="text-center text-sm text-muted">{fill(t.programs.pricesIn, { currency: coach.currency.label[lang] })}</p>
      </div>
    </>
  );
}
