'use client';

import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { booking, coach, packages } from '@/lib/config';
import { formatPrice } from '@/lib/format';
import { buildBookingMessage, whatsappUrl } from '@/lib/whatsapp';
import type { BookingPreset } from './BookingProvider';
import Icon from './Icon';

const ANY = 'any';

/** Renders WhatsApp's *bold* the way the app will show it. */
const WhatsAppText = ({ text }: { text: string }) => (
  <>
    {text.split('\n').map((line, i) => (
      <span key={i} className="block min-h-[1em]">
        {line.split(/(\*[^*\n]+\*)/g).map((part, j) => (part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <strong key={j}>{part.slice(1, -1)}</strong> : part))}
      </span>
    ))}
  </>
);

export function MessagePreview({ text, lang }: { text: string; lang: Locale }) {
  return (
    <div className="rounded-2xl bg-[#0B141A] p-3 light:bg-[#EFEAE2]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="ms-auto max-w-[92%] rounded-2xl rounded-se-sm bg-[#005C4B] px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-[#E9EDEF] shadow-sm light:bg-[#D9FDD3] light:text-[#111B21]">
        <WhatsAppText text={text} />
        <span className="mt-1 flex items-center justify-end gap-1 text-[0.7rem] opacity-70" aria-hidden="true">
          <Icon name="check" size={13} />
        </span>
      </div>
    </div>
  );
}

const Group = ({ legend, children, hint }: { legend: string; children: ReactNode; hint?: string }) => (
  <fieldset className="min-w-0">
    <legend className="field-label">{legend}</legend>
    {hint && <p className="-mt-1 mb-2 text-sm text-muted">{hint}</p>}
    {children}
  </fieldset>
);

/**
 * The booking form: package, day, time, goal, name, optional note. Sending
 * opens WhatsApp with the message ready (wa.me link); nothing is stored and
 * nothing leaves the browser except that link.
 */
export default function BookingForm({
  lang,
  preset = {},
  variant,
  footerClassName = '',
}: {
  lang: Locale;
  preset?: BookingPreset;
  variant: 'sheet' | 'page';
  footerClassName?: string;
}) {
  const t = dict(lang);
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [pkg, setPkg] = useState(preset.packageId && packages.some((p) => p.id === preset.packageId) ? preset.packageId : ANY);
  const [day, setDay] = useState(ANY);
  const [slot, setSlot] = useState(ANY);
  const [goal, setGoal] = useState(preset.goal && booking.goals.some((g) => g.id === preset.goal) ? preset.goal : '');
  const [name, setName] = useState('');
  const [note, setNote] = useState(preset.note ?? '');
  const [error, setError] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const chosen = packages.find((p) => p.id === pkg);
  const message = useMemo(
    () =>
      buildBookingMessage({
        lang,
        coachName: coach.shortName[lang],
        name: name || '…',
        packageName: chosen?.name[lang],
        packagePrice: chosen ? (chosen.price === 'on-request' ? t.message.onRequest : `${formatPrice(lang, chosen.price)} ${chosen.per[lang]}`) : undefined,
        goal: booking.goals.find((g) => g.id === goal)?.label[lang],
        day: day === ANY ? undefined : t.days[Number(day)],
        slot: booking.slots.find((s) => s.id === slot)?.label[lang],
        note,
      }),
    [lang, name, chosen, goal, day, slot, note, t],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      nameRef.current?.focus();
      return;
    }
    const url = whatsappUrl(coach.whatsapp, message);
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    setSentUrl(url);
  };

  const radio = (group: string, value: string, current: string, set: (v: string) => void, label: ReactNode, extra = '') => (
    <label key={value} className={`relative ${extra}`}>
      <input type="radio" name={`${id}-${group}`} value={value} checked={current === value} onChange={() => set(value)} className="peer sr-only" />
      <span className="chip w-full peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
        {label}
      </span>
    </label>
  );

  const groups = (['online', 'in-person'] as const).map((kind) => ({ kind, items: packages.filter((p) => p.kind === kind) }));
  const sheet = variant === 'sheet';

  return (
    <form onSubmit={submit} noValidate className={sheet ? 'flex min-h-0 flex-1 flex-col' : 'grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start'}>
      <div className={sheet ? 'min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 pt-2 pb-6' : 'space-y-8'}>
        <Group legend={t.book.package}>
          <div className="space-y-4">
            {groups.map(({ kind, items }) => (
              <div key={kind}>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted uppercase" aria-hidden="true">
                  <Icon name={kind === 'online' ? 'globe' : 'dumbbell'} size={15} />
                  {kind === 'online' ? t.common.online : t.common.inPerson}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((p) => (
                    <label key={p.id} className="relative block">
                      <input type="radio" name={`${id}-package`} value={p.id} checked={pkg === p.id} onChange={() => setPkg(p.id)} className="peer sr-only" />
                      <span className="flex h-full min-h-[4.25rem] cursor-pointer flex-col justify-between gap-1 rounded-2xl border border-line bg-surface-2 p-3 transition peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:shadow-[inset_0_0_0_1px_var(--accent)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
                        <span className="text-[0.9rem] leading-snug font-bold">{p.name[lang]}</span>
                        <span className="text-xs font-semibold text-muted">
                          {p.price === 'on-request' ? t.common.onRequest : formatPrice(lang, p.price)}
                        </span>
                      </span>
                      <span className="pointer-events-none absolute end-2 top-2 hidden size-5 items-center justify-center rounded-full bg-accent text-on-accent peer-checked:flex" aria-hidden="true">
                        <Icon name="check" size={13} strokeWidth={3} />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex">{radio('package', ANY, pkg, setPkg, t.book.packageUndecided)}</div>
          </div>
        </Group>

        <Group legend={t.book.day}>
          <div className="rail !gap-2">
            {radio('day', ANY, day, setDay, t.book.anyDay)}
            {booking.days.map((d) => radio('day', String(d), day, setDay, t.days[d]))}
          </div>
        </Group>

        <Group legend={t.book.slot}>
          <div className="flex flex-wrap gap-2">
            {radio('slot', ANY, slot, setSlot, t.book.anySlot)}
            {booking.slots.map((s) => radio('slot', s.id, slot, setSlot, s.label[lang]))}
          </div>
        </Group>

        <Group legend={t.book.goal}>
          <div className="flex flex-wrap gap-2">{booking.goals.map((g) => radio('goal', g.id, goal, setGoal, g.label[lang]))}</div>
        </Group>

        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            {t.book.name}
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            name="name"
            className="input"
            autoComplete="given-name"
            enterKeyHint="next"
            maxLength={60}
            required
            aria-required="true"
            aria-invalid={error}
            aria-describedby={error ? `${id}-name-error` : undefined}
            placeholder={t.book.namePlaceholder}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setError(false);
            }}
          />
          {error && (
            <p id={`${id}-name-error`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-hot" role="alert">
              <Icon name="info" size={16} />
              {t.book.nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-note`} className="field-label">
            {t.book.note}
          </label>
          <textarea id={`${id}-note`} name="note" rows={2} maxLength={500} className="input resize-y" placeholder={t.book.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {sheet && (
          <details className="group rounded-2xl border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 font-bold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Icon name="whatsapp" size={18} />
                {t.book.preview}
              </span>
              <Icon name="chevron" size={18} className="rotate-90 transition group-open:-rotate-90" />
            </summary>
            <div className="px-3 pb-3">
              <MessagePreview text={message} lang={lang} />
            </div>
          </details>
        )}
      </div>

      <div className={sheet ? `border-t border-line bg-surface px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] ${footerClassName}` : 'space-y-4 lg:sticky lg:top-24'}>
        {!sheet && (
          <div className="card p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Icon name="whatsapp" size={18} />
              {t.book.preview}
            </p>
            <MessagePreview text={message} lang={lang} />
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-lg w-full">
          <Icon name="whatsapp" size={22} />
          {t.book.submit}
        </button>
        <p className="mt-2 text-center text-xs text-muted">{t.book.privacy}</p>
        {sentUrl && (
          <p className="mt-2 text-center text-sm font-semibold" role="status">
            {t.book.opened}{' '}
            <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-4">
              {t.book.openAgain}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
