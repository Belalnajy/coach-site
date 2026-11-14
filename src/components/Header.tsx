import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach, theme } from '@/lib/config';
import { route } from '@/lib/routes';
import BookLink from './BookLink';
import HeaderBar from './HeaderBar';
import LanguageLink from './LanguageLink';
import Logo from './Logo';
import { NAV } from './nav';
import Socials from './Socials';
import ThemeToggle from './ThemeToggle';

/** Builds the header on the server and hands the interactive bar only what it needs. */
export default function Header({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const language = { label: t.otherLanguage, switchLabel: t.nav.switchLanguage };
  return (
    <HeaderBar
      items={NAV.map(({ key, icon }) => ({ href: route(lang, key), label: t.nav[key], icon }))}
      labels={{ main: t.nav.main, openMenu: t.nav.openMenu, menu: t.nav.menu, close: t.nav.close }}
      coachName={coach.name[lang]}
      logo={<Logo lang={lang} />}
      actions={
        <>
          <LanguageLink lang={lang} {...language} className="hidden sm:inline-flex" />
          <ThemeToggle labels={{ toDark: t.nav.themeToDark, toLight: t.nav.themeToLight }} defaultMode={theme.defaultMode} />
          <BookLink lang={lang} className="btn btn-primary ms-2 hidden !min-h-11 !px-5 md:inline-flex">
            {t.common.bookNow}
          </BookLink>
        </>
      }
      menuExtras={
        <>
          <LanguageLink lang={lang} {...language} />
          <Socials lang={lang} size="sm" />
        </>
      }
    />
  );
}
