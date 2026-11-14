'use client';

import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { BookingData } from '@/lib/booking-data';
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

export function MessagePreview({ text, rtl }: { text: string; rtl: boolean }) {
  return (
    <div className="rounded-2xl bg-[#0B141A] p-3 light:bg-[#EFEAE2]" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="ms-auto max-w-[92%] rounded-2xl rounded-se-sm bg-[#005C4B] px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-[#E9EDEF] shadow-sm light:bg-[#D9FDD3] light:text-[#111B21]">
        <WhatsAppText text={text} />
        <span className="mt-1 flex items-center justify-end gap-1 text-[0.7rem] opacity-70" aria-hidden="true">
          <Icon name="check" size={13} />
        </span>
      </div>
    </div>
  );
}

const Group = ({ legend, children }: { legend: string; children: ReactNode }) => (
  <fieldset className="min-w-0">
    <legend className="field-label">{legend}</legend>
    {children}
  </fieldset>
);

/**
 * The booking form: package, day, time, goal, name, optional note. Sending
 * opens WhatsApp with the message ready (wa.me link); nothing is stored and
 * nothing leaves the browser except that link. All data and words arrive
 * prepared by the server (lib/booking-data.ts).
 *
 * In the sheet the form is a flex column: the fields scroll in their own
 * area and the Send button sits in a footer that never scrolls away.
 */
export default function BookingForm({ data, preset = {}, variant }: { data: BookingData; preset?: BookingPreset; variant: 'sheet' | 'page' }) {
  const { t, lang } = data;
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [pkg, setPkg] = useState(preset.packageId && data.packages.some((p) => p.id === preset.packageId) ? preset.packageId : ANY);
  const [day, setDay] = useState(ANY);
  const [slot, setSlot] = useState(ANY);
  const [goal, setGoal] = useState(preset.goal && data.goals.some((g) => g.id === preset.goal) ? preset.goal : '');
  const [name, setName] = useState('');
  const [note, setNote] = useState(preset.note ?? '');
  const [error, setError] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const chosen = data.packages.find((p) => p.id === pkg);
  const message = useMemo(
    () =>
      buildBookingMessage({
        strings: t.message,
        coachName: data.coachName,
        name: name || '…',
        packageName: chosen?.name,
        packagePrice: chosen?.messagePrice,
        goal: data.goals.find((g) => g.id === goal)?.label,
        day: data.days.find((d) => d.id === day)?.label,
        slot: data.slots.find((s) => s.id === slot)?.label,
        note,
      }),
    [t, data, name, chosen, goal, day, slot, note],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      nameRef.current?.focus();
      return;
    }
    const url = whatsappUrl(data.whatsapp, message);
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    setSentUrl(url);
  };

  const radio = (group: string, value: string, current: string, set: (v: string) => void, label: ReactNode) => (
    <label key={value} className="relative">
      <input type="radio" name={`${id}-${group}`} value={value} checked={current === value} onChange={() => set(value)} className="peer sr-only" />
      <span className="chip w-full">{label}</span>
    </label>
  );

  const groups = (['online', 'in-person'] as const).map((kind) => ({ kind, items: data.packages.filter((p) => p.kind === kind) }));

  const fields = (
    <>
      <Group legend={t.book.package}>
        <div className="space-y-4">
          {groups.map(({ kind, items }) =>
            items.length ? (
              <div key={kind}>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted uppercase" aria-hidden="true">
                  <Icon name={kind === 'online' ? 'globe' : 'dumbbell'} size={15} />
                  {kind === 'online' ? t.online : t.inPerson}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((p) => (
                    <label key={p.id} className="relative block">
                      <input type="radio" name={`${id}-package`} value={p.id} checked={pkg === p.id} onChange={() => setPkg(p.id)} className="peer sr-only" />
                      <span className="flex h-full min-h-[4.25rem] cursor-pointer flex-col justify-between gap-1 rounded-2xl border-2 border-line bg-surface-2 p-3 pe-8 transition peer-checked:border-selected peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
                        <span className="text-[0.9rem] leading-snug font-bold">{p.name}</span>
                        <span className="text-xs font-semibold text-muted">{p.price}</span>
                      </span>
                      {/* The check mark: an empty ring, filled when chosen. */}
                      <span className="pointer-events-none absolute end-2 top-2 grid size-5 place-items-center rounded-full border-2 border-line text-transparent peer-checked:border-selected peer-checked:bg-selected peer-checked:text-on-selected" aria-hidden="true">
                        <Icon name="check" size={12} strokeWidth={3.5} />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null,
          )}
          <div className="flex">{radio('package', ANY, pkg, setPkg, t.book.packageUndecided)}</div>
        </div>
      </Group>

      <Group legend={t.book.day}>
        <div className="rail !gap-2">
          {radio('day', ANY, day, setDay, t.book.anyDay)}
          {data.days.map((d) => radio('day', d.id, day, setDay, d.label))}
        </div>
      </Group>

      <Group legend={t.book.slot}>
        <div className="flex flex-wrap gap-2">
          {radio('slot', ANY, slot, setSlot, t.book.anySlot)}
          {data.slots.map((s) => radio('slot', s.id, slot, setSlot, s.label))}
        </div>
      </Group>

      <Group legend={t.book.goal}>
        <div className="flex flex-wrap gap-2">{data.goals.map((g) => radio('goal', g.id, goal, setGoal, g.label))}</div>
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
          <p id={`${id}-name-error`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-hot-text" role="alert">
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
    </>
  );

  const sent = sentUrl && (
    <p className="mt-2 text-center text-sm font-semibold" role="status">
      {t.book.opened}{' '}
      <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-4">
        {t.book.openAgain}
      </a>
    </p>
  );

  const send = (
    <button type="submit" className="btn btn-primary btn-lg w-full" data-send>
      <Icon name="whatsapp" size={22} />
      {t.book.submit}
    </button>
  );

  if (variant === 'sheet')
    return (
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 pt-2 pb-6" data-scroll-area>
          {fields}
          <details className="group rounded-2xl border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 font-bold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Icon name="whatsapp" size={18} />
                {t.book.preview}
              </span>
              <Icon name="chevron" size={18} className="rotate-90 transition group-open:-rotate-90" />
            </summary>
            <div className="px-3 pb-3">
              <MessagePreview text={message} rtl={lang === 'ar'} />
            </div>
          </details>
          <p className="text-center text-xs text-muted">{t.book.privacy}</p>
        </div>
        {/* Never scrolls away: the sheet's one action stays in reach. */}
        <div className="shrink-0 border-t border-line bg-surface px-5 pt-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] shadow-[0_-12px_24px_-16px_rgb(0_0_0/0.5)]">
          {send}
          {sent}
        </div>
      </form>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="min-w-0 space-y-8">{fields}</div>
      <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
        <div className="card p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Icon name="whatsapp" size={18} />
            {t.book.preview}
          </p>
          <MessagePreview text={message} rtl={lang === 'ar'} />
        </div>
        {send}
        <p className="text-center text-xs text-muted">{t.book.privacy}</p>
        {sent}
      </div>
    </form>
  );
}
