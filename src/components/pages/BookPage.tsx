import { Suspense } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { coach } from '@/lib/config';
import { whatsappUrl } from '@/lib/whatsapp';
import { bookingData } from '@/lib/booking-data';
import BookingForm from '../BookingForm';
import BookingPageForm from '../BookingPageForm';
import Icon from '../Icon';
import PageHeader from '../PageHeader';

export default function BookPage({ lang }: { lang: Locale }) {
  const t = dict(lang);
  const data = bookingData(lang);
  return (
    <>
      <PageHeader eyebrow={t.book.eyebrow} title={t.book.title} intro={t.book.intro} />
      <div className="container-x py-10 md:py-14">
        <Suspense fallback={<BookingForm data={data} variant="page" />}>
          <BookingPageForm data={data} />
        </Suspense>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <section className="card p-6 md:p-8" aria-labelledby="next-title">
            <h2 id="next-title" className="text-xl font-black">
              {t.book.stepsTitle}
            </h2>
            <ol className="mt-4 space-y-3">
              {t.book.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">{i + 1}</span>
                  <span className="pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-6 md:p-8" aria-labelledby="direct-title">
            <h2 id="direct-title" className="text-xl font-black">
              {t.book.otherWays}
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={whatsappUrl(coach.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-accent-text">
                  <Icon name="whatsapp" size={20} />
                  <span dir="ltr">+{coach.whatsapp}</span>
                  <span className="sr-only">{t.common.newTab}</span>
                </a>
              </li>
              {coach.email && (
                <li>
                  <a href={`mailto:${coach.email}`} className="inline-flex min-h-11 items-center gap-2 font-semibold break-all hover:text-accent-text">
                    <Icon name="mail" size={20} />
                    {coach.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2 pt-1 text-muted">
                <Icon name="clock" size={20} className="mt-0.5 shrink-0" />
                {coach.location.hours[lang]}
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
