import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { coach, features } from '@/lib/config';
import { route } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import EmailText from './EmailText';
import Icon from './Icon';
import Logo from './Logo';
import { NAV } from '@/lib/nav';
import Socials from './Socials';

export default function Footer({ lang }: { lang: Locale }) {
  const t = dict(lang);
  return (
    <footer className="cv-auto border-t border-line bg-surface pt-14 pb-32 lg:pb-12">
      <div className="container-x grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo lang={lang} />
          <p className="max-w-sm text-muted">{coach.role[lang]}</p>
          <Socials lang={lang} />
        </div>
        <nav aria-label={t.footer.pages}>
          <h2 className="mb-3 text-sm font-black tracking-wide text-muted uppercase">{t.footer.pages}</h2>
          <ul className="grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {NAV.map(({ key }) => (
              <li key={key}>
                <Link href={route(lang, key)} className="inline-flex min-h-11 items-center font-semibold hover:text-accent-text">
                  {t.nav[key]}
                </Link>
              </li>
            ))}
            <li>
              <Link href={route(lang, 'book')} className="inline-flex min-h-11 items-center font-semibold hover:text-accent-text">
                {t.book.title}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 text-sm font-black tracking-wide text-muted uppercase">{t.footer.contact}</h2>
          <ul className="space-y-1">
            <li>
              <a href={whatsappUrl(coach.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-accent-text">
                <Icon name="whatsapp" size={18} />
                <span dir="ltr">+{coach.whatsapp}</span>
                <span className="sr-only">{t.common.newTab}</span>
              </a>
            </li>
            {coach.email && (
              <li>
                <a href={`mailto:${coach.email}`} className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-accent-text">
                  <Icon name="mail" size={18} />
                  <EmailText email={coach.email} />
                </a>
              </li>
            )}
            {coach.location && (
              <li className="flex items-start gap-2 pt-2 text-muted">
                <Icon name="pin" size={18} className="mt-1 shrink-0" />
                <span>{[coach.location.gym[lang], coach.location.address?.[lang], coach.location.city?.[lang]].filter(Boolean).join(lang === 'ar' ? '، ' : ', ')}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container-x mt-12 space-y-3 border-t border-line pt-6 text-sm text-muted">
        {coach.sample && (
          <p className="flex items-start gap-2">
            <span className="badge-sample mt-0.5 shrink-0">{t.common.sample}</span>
            <span>{t.footer.sample}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p>{fill(t.footer.rights, { year: new Date().getFullYear(), coach: coach.name[lang] })}</p>
          {features.credit && (
            <p>
              {t.footer.madeBy}{' '}
              <a
                href={features.credit.url[lang]}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-accent-text decoration-2 underline-offset-4 hover:text-accent-text"
              >
                {features.credit.name[lang]}
                <span className="sr-only"> {t.common.newTab}</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
