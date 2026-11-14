import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import BookingProvider from './BookingProvider';
import Footer from './Footer';
import Header from './Header';
import MobileTabBar from './MobileTabBar';
import { route } from '@/lib/routes';
import { TAB_KEYS, iconOf } from '@/lib/nav';
import { bookingData } from '@/lib/booking-data';
import RevealObserver from './RevealObserver';

/** Header, page, footer, phone tab bar and the booking sheet, around every page. */
export default function SiteShell({ lang, children }: { lang: Locale; children: ReactNode }) {
  const t = dict(lang);
  return (
    <BookingProvider data={bookingData(lang)}>
      <a href="#main" className="sr-only z-50 rounded-full bg-accent px-5 py-3 font-bold text-on-accent focus:not-sr-only focus:fixed focus:start-4 focus:top-3">
        {t.nav.skip}
      </a>
      <Header lang={lang} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer lang={lang} />
      <MobileTabBar
        lang={lang}
        label={t.nav.mobile}
        items={[
          ...TAB_KEYS.slice(0, 2).map((key) => ({ href: route(lang, key), label: t.nav[key], icon: iconOf(key) })),
          { href: route(lang, 'book'), label: t.nav.book, icon: 'whatsapp' as const, book: true },
          ...TAB_KEYS.slice(2).map((key) => ({ href: route(lang, key), label: t.nav[key], icon: iconOf(key) })),
        ]}
      />
      <RevealObserver />
    </BookingProvider>
  );
}
