import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { route } from '@/lib/routes';
import Icon, { type IconName } from '../Icon';

export default function NotFoundPage({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const links: { key: 'home' | 'transformations' | 'programs' | 'calculators' | 'blog'; icon: IconName }[] = [
    { key: 'home', icon: 'home' },
    { key: 'programs', icon: 'dumbbell' },
    { key: 'transformations', icon: 'results' },
    { key: 'calculators', icon: 'calculator' },
    { key: 'blog', icon: 'article' },
  ];
  return (
    <section className="container-x flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
      <p className="num relative text-[9rem] leading-none text-accent-text sm:text-[13rem]" aria-hidden="true">
        {t.notFound.code}
        <span className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 -skew-y-6 bg-bg/60" />
      </p>
      <h1 className="display mt-4 max-w-2xl text-balance text-4xl sm:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-muted">{t.notFound.text}</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {links.map(({ key, icon }) => (
          <li key={key}>
            <Link href={route(lang, key)} className={key === 'home' ? 'btn btn-primary' : 'btn btn-ghost'}>
              <Icon name={icon} size={18} />
              {key === 'home' ? t.notFound.home : t.nav[key]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
