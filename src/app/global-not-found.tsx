import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { THEME_CSS, THEME_INIT } from '@/components/RootDocument';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { FONT_CLASSES_404 } from '@/lib/fonts-404';
import { route, type RouteKey } from '@/lib/routes';
import './globals.css';
import './(ar)/cairo.css';

/**
 * The 404 page for every unknown address. Each language has its own root
 * layout, so Next serves this single static document instead; it holds both
 * languages and shows the English one, left to right, before the first
 * paint when the address starts with /en (Arabic otherwise, and without
 * JavaScript).
 */
export const metadata: Metadata = {
  title: `${dict('ar').meta.notFound.title} · ${dict('en').meta.notFound.title}`,
  robots: { index: false, follow: true },
};

const LANGUAGE_SWITCH = `if(/^\\/en(\\/|$)/.test(location.pathname)){var d=document.documentElement;d.lang='en';d.dir='ltr'}`;

const LINKS: { key: RouteKey; icon: 'home' | 'dumbbell' | 'results' | 'calculator' | 'article' }[] = [
  { key: 'home', icon: 'home' },
  { key: 'programs', icon: 'dumbbell' },
  { key: 'transformations', icon: 'results' },
  { key: 'calculators', icon: 'calculator' },
  { key: 'blog', icon: 'article' },
];

function Version({ lang }: { lang: Locale }) {
  const t = dict(lang);
  return (
    <div className={`nf-${lang} ${FONT_CLASSES_404[lang]} font-sans`} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="container-x flex h-16 items-center">
        <Logo lang={lang} />
      </header>
      <main className="container-x flex min-h-[80svh] flex-col items-center justify-center py-16 text-center">
        <p className="num text-[9rem] leading-none text-accent-text sm:text-[13rem]" aria-hidden="true">
          {t.notFound.code}
        </p>
        <h1 className="display mt-4 max-w-2xl text-4xl text-balance sm:text-5xl">{t.notFound.title}</h1>
        <p className="mt-4 max-w-md text-muted">{t.notFound.text}</p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {LINKS.map(({ key, icon }) => (
            <li key={key}>
              <Link href={route(lang, key)} className={key === 'home' ? 'btn btn-primary' : 'btn btn-ghost'}>
                <Icon name={icon} size={18} />
                {key === 'home' ? t.notFound.home : t.nav[key as Exclude<RouteKey, 'home' | 'book'>]}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `${THEME_INIT};${LANGUAGE_SWITCH}` }} />
        <style dangerouslySetInnerHTML={{ __html: `${THEME_CSS}\nhtml[lang=en] .nf-ar,html[lang=ar] .nf-en{display:none}` }} />
      </head>
      <body className="antialiased">
        <Version lang="ar" />
        <Version lang="en" />
      </body>
    </html>
  );
}
