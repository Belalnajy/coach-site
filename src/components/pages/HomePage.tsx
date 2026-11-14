import Image from 'next/image';
import { Suspense } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { coach, packages, testimonials, transformations } from '@/lib/config';
import { formatNumber, quote } from '@/lib/format';
import { faqJsonLd } from '@/lib/jsonld';
import { route } from '@/lib/routes';
import BookLink from '../BookLink';
import Faq from '../Faq';
import Icon, { type IconName } from '../Icon';
import JsonLd from '../JsonLd';
import PackageCard from '../PackageCard';
import SectionHeading from '../SectionHeading';
import StoryCard from '../StoryCard';

function Hero({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const [first, ...rest] = coach.headline[lang].split('\n');
  return (
    <section className="force-dark relative isolate overflow-hidden light:mx-2 light:mt-1 light:rounded-[2rem] lg:light:mx-4" aria-labelledby="hero-title">
      {/* Glow and grid behind everything. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 start-1/2 -z-10 size-[42rem] -translate-x-1/2 glow-accent lg:start-auto lg:end-0 lg:translate-x-0 rtl:translate-x-1/2 lg:rtl:translate-x-0" />
      <div className="container-x relative grid min-h-[calc(100svh-4rem)] items-end lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:py-10">
        {/* Phones: the picture fills the screen behind the text (a poster);
            wide screens: it sits in its own column. */}
        <div className="absolute inset-x-0 top-0 h-[74%] lg:relative lg:inset-auto lg:order-last lg:h-[min(78svh,46rem)]">
          <div className="absolute inset-0 overflow-hidden lg:rounded-[2.25rem] lg:border lg:border-line">
            <Image
              src={coach.images.hero.src}
              alt={coach.images.hero.alt[lang]}
              fill
              preload
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              quality={60}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[50%_8%] lg:object-[50%_20%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg)_0%,var(--bg)_10%,color-mix(in_srgb,var(--bg)_75%,transparent)_38%,transparent_70%)] lg:hidden" />
          </div>
          {/* Floating proof chips (desktop). */}
          <div className="absolute start-[-2rem] bottom-16 hidden items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3 pe-5 shadow-2xl backdrop-blur lg:flex">
            <span className="num grid size-12 place-items-center rounded-xl bg-accent text-2xl text-on-accent">{coach.stats.yearsExperience}</span>
            <span className="text-sm leading-tight font-bold">{t.home.proof.years}</span>
          </div>
          <div className="absolute end-6 top-8 hidden items-center gap-2 rounded-full border border-line bg-surface/90 px-4 py-2.5 text-sm font-bold shadow-2xl backdrop-blur lg:flex">
            <span className="size-2.5 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_30%,transparent)]" />
            {t.home.heroNote}
          </div>
        </div>

        <div className="relative z-10 pt-[30svh] pb-28 lg:p-0">
          <p className="eyebrow mb-4">{fill(t.home.eyebrow, { role: coach.role[lang] })}</p>
          <h1 id="hero-title" className="display text-[2.6rem] min-[400px]:text-[2.9rem] sm:text-7xl lg:text-[4.4rem] xl:text-[5rem] rtl:text-[2.35rem] sm:rtl:text-6xl lg:rtl:text-[3.6rem] xl:rtl:text-[4.2rem]">
            <span className="block">{first}</span>
            {rest.map((line) => (
              <span key={line} className="block text-accent-text">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] text-pretty text-muted md:text-xl">{coach.intro[lang]}</p>
          <div className="mt-6 flex gap-2.5 sm:gap-3 lg:mt-8">
            <BookLink lang={lang} className="btn btn-primary btn-lg flex-1 sm:flex-none">
              <Icon name="whatsapp" size={22} />
              {t.home.primaryCta}
            </BookLink>
            <Link href={`${route(lang, 'calculators')}#calories`} className="btn btn-ghost btn-lg !px-4 sm:!px-6" aria-label={t.home.secondaryCta}>
              <Icon name="calculator" size={20} />
              <span className="hidden sm:inline">{t.home.secondaryCta}</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function Marquee({ lang }: { lang: Locale }) {
  const words = dict(lang).home.marquee;
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <li key={w} className="flex items-center">
          <span className="display px-6 text-3xl md:text-4xl">{w}</span>
          <Icon name="bolt" size={22} fill="currentColor" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative z-10 overflow-hidden py-4">
      <div className="-mx-4 -rotate-2 border-y-2 border-on-accent/20 bg-accent py-3 text-on-accent">
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

function Proof({ lang }: { lang: Locale }) {
  const t = dict(lang).home.proof;
  const stats: { value: number; label: string; icon: IconName }[] = [
    { value: coach.stats.yearsExperience, label: t.years, icon: 'award' },
    { value: coach.stats.clients, label: t.clients, icon: 'user' },
    { value: coach.stats.transformations, label: t.transformations, icon: 'results' },
  ];
  return (
    <section aria-label={t.label} className="container-x pt-14 md:pt-20">
      <dl className="grid grid-cols-3 gap-2 md:gap-4" data-reveal>
        {stats.map((s) => (
          <div key={s.label} className="card flex flex-col items-center gap-1 px-2 py-5 text-center md:items-start md:px-7 md:py-7 md:text-start">
            <dt className="flex items-center gap-2 text-xs leading-tight font-semibold text-muted md:text-base">
              <Icon name={s.icon} size={20} className="hidden text-accent-text md:block" />
              {s.label}
            </dt>
            <dd className="num order-first text-[2.6rem] leading-none md:text-6xl">
              {formatNumber(lang, s.value)}
              <span className="text-accent-text">+</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Featured({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const stories = transformations.filter((s) => s.featured).slice(0, 3);
  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="featured-title">
      <SectionHeading
        id="featured-title"
        eyebrow={t.home.featured.eyebrow}
        title={t.home.featured.title}
        text={t.home.featured.text}
        action={
          <Link href={route(lang, 'transformations')} className="btn btn-ghost hidden md:inline-flex">
            {t.home.featured.cta}
            <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
          </Link>
        }
      />
      <ul className="rail md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:p-0 md:m-0" data-reveal>
        {stories.map((story, i) => (
          <li key={story.id} className="w-[84%] max-w-sm md:w-auto md:max-w-none">
            <StoryCard story={story} lang={lang} sizes="(min-width: 768px) 30vw, 84vw" hint={i === 0} />
          </li>
        ))}
      </ul>
      {coach.sample && (
        <p className="mt-5 flex items-start gap-2 text-sm text-muted">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          {t.transformations.sampleNote}
        </p>
      )}
      <Link href={route(lang, 'transformations')} className="btn btn-ghost mt-6 w-full md:hidden">
        {t.home.featured.cta}
        <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
      </Link>
    </section>
  );
}

function Services({ lang }: { lang: Locale }) {
  const t = dict(lang);
  // One popular package of each kind, then the next one, so both ways of
  // training are visible at a glance.
  const picks = [
    ...packages.filter((p) => p.popular),
    ...packages.filter((p) => !p.popular),
  ].slice(0, 3);
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/40 py-16 md:py-24" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeading
          id="services-title"
          eyebrow={t.home.services.eyebrow}
          title={t.home.services.title}
          text={t.home.services.text}
          action={
            <Link href={route(lang, 'programs')} className="btn btn-ghost hidden md:inline-flex">
              {t.home.services.cta}
              <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
            </Link>
          }
        />
        <ul className="rail md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:p-0 md:m-0" data-reveal>
          {picks.map((p) => (
            <li key={p.id} className="w-[84%] max-w-sm md:w-auto md:max-w-none">
              <PackageCard pkg={p} lang={lang} compactFeatures />
            </li>
          ))}
        </ul>
        <Link href={route(lang, 'programs')} className="btn btn-ghost mt-6 w-full md:hidden">
          {t.home.services.cta}
          <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}

function Steps({ lang }: { lang: Locale }) {
  const t = dict(lang).home.steps;
  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="steps-title">
      <SectionHeading id="steps-title" eyebrow={t.eyebrow} title={t.title} />
      <ol className="grid gap-3 md:grid-cols-4 md:gap-5" data-reveal>
        {t.items.map((step, i) => (
          <li key={step.title} className="card relative flex gap-4 overflow-hidden p-5 md:flex-col md:p-7">
            <span aria-hidden="true" className="num pointer-events-none absolute -end-2 -bottom-6 text-[7rem] leading-none text-ink/[0.05]">
              {i + 1}
            </span>
            <span className="num grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-2xl text-on-accent">{i + 1}</span>
            <div>
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="mt-1 text-pretty text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Tools({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const tiles: { id: string; label: string; icon: IconName; text: string }[] = [
    { id: 'calories', label: t.calculators.tabs.calories, icon: 'bolt', text: t.calculators.blurbs.calories },
    { id: 'protein', label: t.calculators.tabs.protein, icon: 'dumbbell', text: t.calculators.blurbs.protein },
    { id: 'bmi', label: t.calculators.tabs.bmi, icon: 'results', text: t.calculators.blurbs.bmi },
    { id: 'bodyfat', label: t.calculators.tabs.bodyfat, icon: 'calculator', text: t.calculators.blurbs.bodyfat },
  ];
  return (
    <section className="container-x pb-16 md:pb-24" aria-labelledby="tools-title">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 md:p-12" data-reveal>
        <div aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 size-80 glow-accent" />
        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">{t.home.tools.eyebrow}</p>
            <h2 id="tools-title" className="display text-[2.4rem] text-balance sm:text-5xl">
              {t.home.tools.title}
            </h2>
            <p className="mt-4 text-lg text-muted">{t.home.tools.text}</p>
            <Link href={route(lang, 'calculators')} className="btn btn-primary mt-6 hidden lg:inline-flex">
              {t.home.tools.cta}
              <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <li key={tile.id}>
                <Link href={`${route(lang, 'calculators')}#${tile.id}`} className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4 transition hover:-translate-y-0.5 hover:border-accent md:p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-bg text-accent-text transition group-hover:bg-accent group-hover:text-on-accent">
                    <Icon name={tile.icon} size={22} />
                  </span>
                  <span className="font-black">{tile.label}</span>
                  <span className="hidden text-sm text-muted sm:block">{tile.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={route(lang, 'calculators')} className="btn btn-primary w-full lg:hidden">
            {t.home.tools.cta}
            <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** First letter of the last word: "Sample review – M." → "M". */
const initial = (name: string) => name.replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).pop()?.[0] ?? '';

function Reviews({ lang }: { lang: Locale }) {
  const t = dict(lang);
  if (!testimonials.length) return null;
  return (
    <section className="overflow-hidden border-y border-line bg-surface/40 py-16 md:py-24" aria-labelledby="reviews-title">
      <div className="container-x">
        <SectionHeading id="reviews-title" eyebrow={t.home.testimonials.eyebrow} title={t.home.testimonials.title} />
        <ul className="rail md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:p-0 md:m-0 lg:grid-cols-4" data-reveal>
          {testimonials.map((r) => (
            <li key={r.id} className="w-[84%] max-w-sm md:w-auto md:max-w-none">
              <figure className="card flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex gap-0.5 text-accent-text" role="img" aria-label={`${r.rating}/5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon key={i} name="star" size={18} fill={i < r.rating ? 'currentColor' : 'none'} />
                    ))}
                  </span>
                  {r.sample && <span className="badge-sample">{t.common.sampleReview}</span>}
                </div>
                <blockquote className="flex-1 text-pretty text-[1.02rem] leading-relaxed">{quote(r.quote[lang], lang)}</blockquote>
                <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                  <span className="num grid size-11 place-items-center rounded-full bg-surface-2 text-lg text-accent-text" aria-hidden="true">
                    {initial(r.name[lang])}
                  </span>
                  <span>
                    <span className="block font-bold">{r.name[lang]}</span>
                    <span className="block text-sm text-muted">{r.context[lang]}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta({ lang }: { lang: Locale }) {
  const t = dict(lang).home.final;
  return (
    <section className="container-x pt-16 pb-16 md:pt-24 md:pb-24" aria-labelledby="final-title">
      <div className="relative overflow-hidden rounded-[2rem] bg-accent px-6 py-12 text-on-accent md:px-14 md:py-16" data-reveal>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_28px,rgb(0_0_0/0.06)_28px_44px)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="final-title" className="display text-[2.5rem] text-balance sm:text-5xl lg:text-6xl">
              {t.title}
            </h2>
            <p className="mt-3 text-lg font-semibold opacity-80">{t.text}</p>
          </div>
          <BookLink lang={lang} className="btn btn-lg w-full bg-on-accent text-accent shadow-xl md:w-auto">
            <Icon name="whatsapp" size={22} />
            {t.button}
          </BookLink>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ lang }: { lang: Locale }) {
  const t = dict(lang);
  return (
    <>
      <JsonLd data={faqJsonLd(lang)} />
      <Hero lang={lang} />
      {/* Each section below the first screen is its own Suspense boundary, so
          React hydrates them as separate small tasks instead of one long one
          (keeps the main thread free on slow phones). Nothing here suspends. */}
      <Suspense>
        <Marquee lang={lang} />
        <Proof lang={lang} />
      </Suspense>
      <Suspense>
        <Featured lang={lang} />
      </Suspense>
      <Suspense>
        <Services lang={lang} />
      </Suspense>
      <Suspense>
        <Steps lang={lang} />
        <Tools lang={lang} />
      </Suspense>
      <Suspense>
        <Reviews lang={lang} />
      </Suspense>
      <Suspense>
        <section className="container-x pt-16 md:pt-24" aria-labelledby="faq-title">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading id="faq-title" eyebrow={t.home.faq.eyebrow} title={t.home.faq.title} />
            <Faq lang={lang} />
          </div>
        </section>
        <FinalCta lang={lang} />
      </Suspense>
    </>
  );
}
