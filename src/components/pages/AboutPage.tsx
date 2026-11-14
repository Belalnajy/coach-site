import Image from 'next/image';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach } from '@/lib/config';
import { formatNumber } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';
import BookLink from '../BookLink';
import Icon from '../Icon';
import Socials from '../Socials';

export default function AboutPage({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const loc = coach.location;
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-[-10%] size-[30rem] rounded-full bg-hot/15 blur-3xl" />
        <div className="container-x relative grid gap-8 py-10 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-[2rem] sm:max-w-sm border border-line lg:max-w-none">
            <Image src={coach.images.portrait.src} alt={coach.images.portrait.alt[lang]} fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow rise mb-4">{t.about.eyebrow}</p>
            <h1 className="display rise text-[3rem] sm:text-7xl">{coach.name[lang]}</h1>
            <p className="rise mt-3 text-xl font-bold text-accent-text">{coach.role[lang]}</p>
            <dl className="mt-8 grid grid-cols-3 gap-2">
              {[
                [coach.stats.yearsExperience, t.home.proof.years],
                [coach.stats.clients, t.home.proof.clients],
                [coach.stats.transformations, t.home.proof.transformations],
              ].map(([value, label]) => (
                <div key={label} className="card flex flex-col-reverse p-4 text-center">
                  <dt className="text-xs font-semibold text-muted">{label}</dt>
                  <dd className="num text-4xl">
                    {formatNumber(lang, value as number)}
                    <span className="text-accent-text">+</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookLink lang={lang} className="btn btn-primary btn-lg flex-1 sm:flex-none">
                <Icon name="whatsapp" size={22} />
                {t.common.bookNow}
              </BookLink>
              <Socials lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-14 py-14 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <section aria-labelledby="story-title">
          <h2 id="story-title" className="display mb-6 text-4xl sm:text-5xl">
            {t.about.storyTitle}
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-pretty">
            {coach.story[lang].map((p, i) => (
              <p key={i} className={i === 0 ? 'text-xl font-semibold' : 'text-muted'}>
                {p}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="certs-title">
          <h2 id="certs-title" className="display mb-6 text-4xl sm:text-5xl">
            {t.about.certificationsTitle}
          </h2>
          <ul className="space-y-3">
            {coach.certifications.map((c) => (
              <li key={c.name.en} className="card flex items-center gap-4 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent-text">
                  <Icon name="award" size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="leading-snug font-bold">{c.name[lang]}</h3>
                  <p className="text-sm text-muted">{c.issuer[lang]}</p>
                </div>
                <span className="num text-xl text-muted">{c.year}</span>
              </li>
            ))}
          </ul>
          {coach.sample && <p className="mt-3 text-sm text-muted">{t.about.sampleCerts}</p>}
        </section>
      </div>

      <section className="border-y border-line bg-surface/40 py-14 md:py-20" aria-labelledby="principles-title">
        <div className="container-x">
          <h2 id="principles-title" className="display mb-8 text-4xl sm:text-5xl">
            {t.about.principlesTitle}
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {coach.principles.map((p, i) => (
              <li key={p.title.en} className="card p-6" data-reveal>
                <span className="num text-5xl text-accent-text">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-black">{p.title[lang]}</h3>
                <p className="mt-2 text-muted">{p.text[lang]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-14 md:py-20" aria-labelledby="location-title">
        <h2 id="location-title" className="display mb-8 text-4xl sm:text-5xl">
          {t.about.locationTitle}
        </h2>
        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-surface lg:grid-cols-[1.3fr_1fr]">
          <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-80">
            <Image src={coach.images.map.src} alt={coach.images.map.alt[lang]} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute start-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-on-accent shadow-lg">
              <Icon name="pin" size={16} />
              {t.about.openMap}
              <span className="sr-only">{t.common.newTab}</span>
            </span>
          </a>
          <div className="space-y-6 p-6 md:p-8">
            <div>
              <h3 className="text-2xl font-black">{loc.gym[lang]}</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex gap-3">
                <Icon name="pin" size={20} className="mt-1 shrink-0 text-accent-text" />
                <div>
                  <dt className="text-sm font-bold text-muted">{t.about.address}</dt>
                  <dd className="font-semibold">
                    {loc.address[lang]}
                    {lang === 'ar' ? '، ' : ', '}
                    {loc.city[lang]}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Icon name="clock" size={20} className="mt-1 shrink-0 text-accent-text" />
                <div>
                  <dt className="text-sm font-bold text-muted">{t.about.hours}</dt>
                  <dd className="font-semibold">{loc.hours[lang]}</dd>
                </div>
              </div>
            </dl>
            <div className="border-t border-line pt-6">
              <h3 className="mb-3 text-sm font-bold text-muted">{t.about.contactTitle}</h3>
              <div className="flex flex-wrap gap-2">
                <a href={whatsappUrl(coach.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Icon name="whatsapp" size={20} />
                  {t.common.whatsapp}
                  <span className="sr-only">{t.common.newTab}</span>
                </a>
                {coach.email && (
                  <a href={`mailto:${coach.email}`} className="btn btn-ghost">
                    <Icon name="mail" size={20} />
                    {t.common.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
