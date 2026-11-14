'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import type { Locale } from '../../site.config/types';
import type { Dict } from '@/locales/ar';
import { fill } from '@/lib/fill';
import { formatNum } from '@/lib/num';
import {
  ACTIVITY_FACTORS,
  BMI_BANDS,
  BODY_FAT_BANDS,
  LIMITS,
  bodyFatNavy,
  calories,
  idealWeight,
  protein,
  type ActivityLevel,
  type CalorieGoal,
  type ProteinGoal,
  type Sex,
} from '@/lib/calculators';
import BookLink from './BookLink';
import Icon, { type IconName } from './Icon';

const TABS = ['calories', 'protein', 'bmi', 'bodyfat'] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS: Record<Tab, IconName> = { calories: 'bolt', protein: 'dumbbell', bmi: 'results', bodyfat: 'calculator' };

// The open tab lives in the URL hash (#protein), so tabs can be linked to.
const readHash = (): Tab => {
  const hash = window.location.hash.slice(1);
  return (TABS as readonly string[]).includes(hash) ? (hash as Tab) : 'calories';
};
const subscribeHash = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
};

type T = Dict['calculators'];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts smoothly to a new value (instantly with reduced motion). */
function AnimatedNumber({ value, locale, decimals = 0 }: { value: number; locale: string; decimals?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    if (reducedMotion()) {
      from.current = value;
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - began) / 450);
      const eased = 1 - (1 - p) ** 3;
      const current = start + (value - start) * eased;
      from.current = current;
      setShown(current);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{formatNum(locale, Number(shown.toFixed(decimals)), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

/**
 * A number with a slider: type it, or drag it. A typed value outside the
 * range the formulas are valid for is not used: the field says so (and is
 * marked invalid) while you type, and snaps to the nearest allowed value,
 * with a note, when you leave it.
 */
function NumberField({
  label,
  value,
  onChange,
  limits,
  unit,
  step = 1,
  hint,
  t,
  locale,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  limits: readonly [number, number];
  unit: string;
  step?: number;
  hint?: string;
  t: T['fields'];
  locale: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [min, max] = limits;
  const pct = ((value - min) / (max - min)) * 100;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const nudge = (d: number) => {
    setNote(null);
    onChange(clamp(Math.round((value + d) * 10) / 10));
  };
  const typed = draft === null ? null : Number(draft);
  const invalid = draft !== null && (draft.trim() === '' || !Number.isFinite(typed) || typed! < min || typed! > max);
  const messageId = `${id}-msg`;
  const message = invalid ? fill(t.range, { min: formatNum(locale, min), max: formatNum(locale, max), unit }) : note;
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label htmlFor={id} className="font-bold">
            {label}
          </label>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink transition active:scale-90" onClick={() => nudge(-step)} aria-label={fill(t.decrease, { field: label })}>
            <Icon name="minus" size={18} strokeWidth={2.6} />
          </button>
          <div className="flex items-baseline gap-1 rounded-xl px-1">
            <input
              id={id}
              type="number"
              inputMode="decimal"
              min={min}
              max={max}
              step={step}
              aria-invalid={invalid || undefined}
              aria-describedby={message ? messageId : undefined}
              className={`num w-[3.6ch] rounded-md bg-transparent text-center text-3xl leading-none outline-none [appearance:textfield] focus:text-accent-text [&::-webkit-inner-spin-button]:appearance-none ${invalid ? 'text-hot-text ring-2 ring-hot-text focus:text-hot-text' : ''}`}
              value={draft ?? String(value)}
              onChange={(e) => {
                setDraft(e.target.value);
                setNote(null);
                const n = Number(e.target.value);
                if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= max) onChange(n);
              }}
              onBlur={() => {
                if (invalid && draft !== null && draft.trim() !== '' && Number.isFinite(typed)) {
                  const fixed = clamp(typed!);
                  onChange(fixed);
                  setNote(fill(t.clamped, { value: formatNum(locale, fixed), unit }));
                }
                setDraft(null);
              }}
            />
            <span className="text-sm font-semibold text-muted">{unit}</span>
          </div>
          <button type="button" className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink transition active:scale-90" onClick={() => nudge(step)} aria-label={fill(t.increase, { field: label })}>
            <Icon name="plus" size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${formatNum(locale, value)} ${unit}`}
        className="range mt-3 w-full"
        style={{ ['--fill' as string]: `${pct}%` }}
        onInput={() => setNote(null)}
      />
      {message && (
        <p id={messageId} className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${invalid ? 'text-hot-text' : 'text-muted'}`} role={invalid ? 'alert' : 'status'}>
          <Icon name="info" size={15} />
          {message}
        </p>
      )}
    </div>
  );
}

/** Segmented choice (radio group) styled as pills. */
function Segmented<V extends string>({ legend, options, value, onChange, columns }: { legend: string; options: { id: V; label: string; hint?: string }[]; value: V; onChange: (v: V) => void; columns: string }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((o) => (
          <label key={o.id} className="relative">
            <input type="radio" name={name} className="peer sr-only" checked={value === o.id} onChange={() => onChange(o.id)} />
            <span className="seg flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-2xl border border-line bg-surface-2 px-5 py-2 text-center font-bold transition peer-checked:border-selected peer-checked:bg-selected peer-checked:text-on-selected peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
              <span className="text-[0.95rem] leading-tight">{o.label}</span>
              {o.hint && <span className="mt-0.5 text-[0.72rem] leading-tight font-semibold opacity-75">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A coloured scale with a marker: BMI bands, body-fat bands. */
function Scale({ bands, value, min, max, label, youLabel, highlight }: { bands: { label: string; from: number; to: number; color: string }[]; value: number; min: number; max: number; label: string; youLabel: string; highlight: number }) {
  const at = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div>
      <p className="mb-6 text-xs font-bold text-muted uppercase">{label}</p>
      <div className="relative" dir="ltr">
        <div className="flex h-3 overflow-hidden rounded-full">
          {bands.map((b, i) => (
            <span key={b.label} className="h-full transition-opacity" style={{ width: `${((Math.min(b.to, max) - Math.max(b.from, min)) / (max - min)) * 100}%`, background: b.color, opacity: i === highlight ? 1 : 0.35 }} />
          ))}
        </div>
        <span className="absolute -top-6 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[0.65rem] font-black text-bg transition-[left] duration-500" style={{ left: `${at}%` }}>
          {youLabel}
        </span>
        <span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-bg shadow transition-[left] duration-500" style={{ left: `${at}%` }} aria-hidden="true" />
      </div>
      <ul className="mt-3 flex justify-between gap-1 text-[0.68rem] font-semibold text-muted">
        {bands.map((b, i) => (
          <li key={b.label} className={i === highlight ? 'text-ink' : ''}>
            {b.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const SCALE_COLORS = ['#3DB2FF', '#7CE85A', '#FFC93D', '#FF6A3D', '#FF3D5A'];

/**
 * The four calculators. Words, the number locale and the booking goals come
 * in as props from the server page, so the browser bundle carries only the
 * formulas and this component, not the config or the dictionaries.
 */
export default function Calculators({ lang, t, estimate, locale, goalIds }: { lang: Locale; t: T; estimate: string; locale: string; goalIds: string[] }) {
  const tab = useSyncExternalStore(subscribeHash, readHash, () => 'calories' as Tab);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ calories: null, protein: null, bmi: null, bodyfat: null });
  const resultRef = useRef<HTMLDivElement>(null);
  const [resultVisible, setResultVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Shared body measurements, kept when switching calculators.
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(78);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [calGoal, setCalGoal] = useState<CalorieGoal>('lose');
  const [proteinGoal, setProteinGoal] = useState<ProteinGoal>('lose');
  const [meals, setMeals] = useState(4);
  const [neck, setNeck] = useState(38);
  const [waist, setWaist] = useState(88);
  const [hip, setHip] = useState(98);

  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    // "Visible" also once the card has been scrolled past: the compact result
    // in the sticky row is only for while the card is still below the screen.
    const observer = new IntersectionObserver(([entry]) => setResultVisible(entry.isIntersecting || entry.boundingClientRect.top < 0), { rootMargin: '0px 0px -90px 0px' });
    observer.observe(el);
    const onScroll = () => setScrolled(window.scrollY > 160);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const select = (next: Tab, focus = false) => {
    if (next !== tab) window.history.replaceState(null, '', `#${next}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (focus) tabRefs.current[next]?.focus();
  };
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    const forward = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight';
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft';
    const next = e.key === forward ? TABS[(i + 1) % TABS.length] : e.key === back ? TABS[(i + TABS.length - 1) % TABS.length] : e.key === 'Home' ? TABS[0] : e.key === 'End' ? TABS[TABS.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    select(next, true);
  };

  const cal = calories({ sex, age, heightCm: height, weightKg: weight, activity, goal: calGoal });
  const pro = protein({ weightKg: weight, heightCm: height, goal: proteinGoal, meals });
  const ideal = idealWeight({ sex, heightCm: height, weightKg: weight });
  const fat = bodyFatNavy({ sex, heightCm: height, neckCm: neck, waistCm: waist, hipCm: sex === 'female' ? hip : undefined, weightKg: weight });

  const num = (v: number, d = 0) => formatNum(locale, v, { maximumFractionDigits: d, minimumFractionDigits: d });
  const goalId = (id: string) => (goalIds.includes(id) ? id : undefined);
  const results: Record<Tab, { headline: ReactNode; unit: string; summary: string; spoken: string; note: string; goal?: string }> = {
    calories: {
      headline: <AnimatedNumber value={cal.target} locale={locale} />,
      unit: `${t.units.kcal} / ${t.units.perDay}`,
      summary: `${num(cal.target)} ${t.units.kcal}`,
      spoken: `${num(cal.target)} ${t.units.kcal} / ${t.units.perDay}`,
      note: fill(t.note.calories, { target: num(cal.target), goal: t.calorieGoals[calGoal] }),
      goal: goalId(calGoal === 'lose' ? 'fat-loss' : calGoal === 'gain' ? 'muscle-gain' : 'fitness'),
    },
    protein: {
      headline: <AnimatedNumber value={pro.targetG} locale={locale} />,
      unit: `${t.units.g} ${t.results.proteinDaily}`,
      summary: `${num(pro.targetG)} ${t.units.g}`,
      spoken: `${num(pro.targetG)} ${t.units.g} ${t.results.proteinDaily}`,
      note: fill(t.note.protein, { target: num(pro.targetG) }),
      goal: goalId(proteinGoal === 'lose' ? 'fat-loss' : proteinGoal === 'gain' ? 'muscle-gain' : 'fitness'),
    },
    bmi: {
      headline: <AnimatedNumber value={ideal.bmi} locale={locale} decimals={1} />,
      unit: t.bmiCategories[ideal.category],
      summary: `${t.results.bmi} ${num(ideal.bmi, 1)}`,
      spoken: `${t.results.bmi} ${num(ideal.bmi, 1)}, ${t.bmiCategories[ideal.category]}`,
      note: fill(t.note.bmi, { bmi: num(ideal.bmi, 1), category: t.bmiCategories[ideal.category] }),
    },
    bodyfat: {
      headline: fat.percent === null ? '—' : <AnimatedNumber value={fat.percent} locale={locale} decimals={1} />,
      unit: fat.category ? `% · ${t.bodyFatCategories[fat.category]}` : '%',
      summary: fat.percent === null ? '—' : `${num(fat.percent, 1)}%`,
      spoken: fat.percent === null ? t.results.invalid : `${num(fat.percent, 1)}%${fat.category ? `, ${t.bodyFatCategories[fat.category]}` : ''}`,
      note: fat.percent === null ? '' : fill(t.note.bodyfat, { percent: num(fat.percent, 1) }),
    },
  };
  const current = results[tab];
  const showMini = scrolled && !resultVisible;

  const sexField = (
    <Segmented
      legend={t.fields.sex}
      value={sex}
      onChange={setSex}
      options={[
        { id: 'male', label: t.fields.male },
        { id: 'female', label: t.fields.female },
      ]}
      columns="grid-cols-2"
    />
  );
  const heightField = <NumberField t={t.fields} locale={locale} label={t.fields.height} value={height} onChange={setHeight} limits={LIMITS.heightCm} unit={t.units.cm} />;
  const weightField = <NumberField t={t.fields} locale={locale} label={t.fields.weight} value={weight} onChange={setWeight} limits={LIMITS.weightKg} unit={t.units.kg} step={0.5} />;

  const panels: Record<Tab, ReactNode> = {
    calories: (
      <>
        {sexField}
        <NumberField t={t.fields} locale={locale} label={t.fields.age} value={age} onChange={setAge} limits={LIMITS.age} unit={t.units.years} />
        {heightField}
        {weightField}
        <Segmented
          legend={t.fields.activity}
          value={activity}
          onChange={setActivity}
          columns="grid-cols-2 sm:grid-cols-3"
          options={(Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((id) => ({ id, label: t.activity[id].label, hint: t.activity[id].hint }))}
        />
        <Segmented
          legend={t.fields.goal}
          value={calGoal}
          onChange={setCalGoal}
          columns="grid-cols-3"
          options={(['lose', 'maintain', 'gain'] as CalorieGoal[]).map((id) => ({ id, label: t.calorieGoals[id] }))}
        />
      </>
    ),
    protein: (
      <>
        {weightField}
        {heightField}
        <Segmented
          legend={t.fields.goal}
          value={proteinGoal}
          onChange={setProteinGoal}
          columns="grid-cols-2"
          options={(['health', 'fitness', 'lose', 'gain'] as ProteinGoal[]).map((id) => ({ id, label: t.proteinGoals[id] }))}
        />
        <NumberField t={t.fields} locale={locale} label={t.fields.meals} value={meals} onChange={setMeals} limits={[2, 6]} unit="×" />
      </>
    ),
    bmi: (
      <>
        {sexField}
        {heightField}
        {weightField}
      </>
    ),
    bodyfat: (
      <>
        {sexField}
        {heightField}
        <NumberField t={t.fields} locale={locale} label={t.fields.neck} hint={t.hints.neck} value={neck} onChange={setNeck} limits={LIMITS.neckCm} unit={t.units.cm} step={0.5} />
        <NumberField t={t.fields} locale={locale} label={t.fields.waist} hint={t.hints.waist} value={waist} onChange={setWaist} limits={LIMITS.waistCm} unit={t.units.cm} step={0.5} />
        {sex === 'female' && <NumberField t={t.fields} locale={locale} label={t.fields.hip} hint={t.hints.hip} value={hip} onChange={setHip} limits={LIMITS.hipCm} unit={t.units.cm} step={0.5} />}
        {weightField}
      </>
    ),
  };

  const details: Record<Tab, ReactNode> = {
    calories: (
      <>
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{t.results.bmr}</dt>
            <dd className="num text-2xl">
              {num(cal.bmr)} <span className="font-sans text-xs font-semibold not-italic text-muted">{t.units.kcal}</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{t.results.tdee}</dt>
            <dd className="num text-2xl">
              {num(cal.tdee)} <span className="font-sans text-xs font-semibold not-italic text-muted">{t.units.kcal}</span>
            </dd>
          </div>
        </dl>
        <div>
          <p className="mb-2 text-xs font-bold text-muted uppercase">{t.results.macros}</p>
          <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
            {[
              [cal.macros.proteinG * 4, 'bg-accent-text'],
              [cal.macros.carbsG * 4, 'bg-[#3DB2FF]'],
              [cal.macros.fatG * 9, 'bg-hot'],
            ].map(([kcal, color]) => (
              <span key={color} className={`${color} h-full transition-[width] duration-500`} style={{ width: `${((kcal as number) / (cal.macros.proteinG * 4 + cal.macros.carbsG * 4 + cal.macros.fatG * 9)) * 100}%` }} />
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [t.results.protein, cal.macros.proteinG, 'bg-accent-text'],
              [t.results.carbs, cal.macros.carbsG, 'bg-[#3DB2FF]'],
              [t.results.fat, cal.macros.fatG, 'bg-hot'],
            ].map(([label, grams, color]) => (
              <div key={label as string}>
                <dt className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
                  <span className={`size-2 rounded-full ${color}`} />
                  {label}
                </dt>
                <dd className="num text-xl">
                  {num(grams as number)}
                  <span className="font-sans text-xs not-italic"> {t.units.g}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {cal.floored && <p className="rounded-xl bg-hot/15 p-3 text-sm font-semibold">{t.results.floored}</p>}
      </>
    ),
    protein: (
      <>
        <p className="font-semibold">{fill(t.results.proteinRange, { min: num(pro.minG), max: num(pro.maxG) })}</p>
        {pro.adjusted && <p className="text-sm text-muted">{fill(t.results.proteinAdjusted, { kg: num(pro.referenceKg, 1) })}</p>}
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-xs font-semibold text-muted">{t.results.perMeal}</p>
          <div className="mt-2 flex items-end gap-2" aria-hidden="true">
            {Array.from({ length: meals }, (_, i) => (
              <span key={i} className="flex-1 rounded-lg bg-accent-text transition-all" style={{ height: `${Math.min(64, 18 + pro.perMealG)}px` }} />
            ))}
          </div>
          <p className="num mt-2 text-3xl">
            {num(pro.perMealG)} <span className="font-sans text-sm not-italic">{t.units.g}</span> <span className="font-sans text-sm text-muted not-italic">× {num(meals)}</span>
          </p>
        </div>
      </>
    ),
    bmi: (
      <>
        <Scale
          label={t.results.scale}
          youLabel={t.results.you}
          value={ideal.bmi}
          min={15}
          max={40}
          highlight={BMI_BANDS.findIndex((b) => b.category === ideal.category)}
          bands={BMI_BANDS.map((b, i) => ({ label: t.bmiCategories[b.category], from: b.from, to: b.to, color: SCALE_COLORS[i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 4] }))}
        />
        <dl className="grid grid-cols-2 gap-2">
          <div className="col-span-2 rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{t.results.healthyRange}</dt>
            <dd className="num text-2xl">
              {num(ideal.healthyMinKg, 1)}–{num(ideal.healthyMaxKg, 1)} <span className="font-sans text-xs not-italic">{t.units.kg}</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{t.results.devine}</dt>
            <dd className="num text-2xl">
              {num(ideal.devineKg, 1)} <span className="font-sans text-xs not-italic">{t.units.kg}</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{t.results.robinson}</dt>
            <dd className="num text-2xl">
              {num(ideal.robinsonKg, 1)} <span className="font-sans text-xs not-italic">{t.units.kg}</span>
            </dd>
          </div>
        </dl>
        <p className="text-sm text-muted">{t.results.bmiNote}</p>
      </>
    ),
    bodyfat:
      fat.percent === null ? (
        <p className="rounded-xl bg-hot/15 p-3 font-semibold">{t.results.invalid}</p>
      ) : (
        <>
          <Scale
            label={t.results.scale}
            youLabel={t.results.you}
            value={fat.percent}
            min={sex === 'male' ? 2 : 10}
            max={sex === 'male' ? 35 : 42}
            highlight={BODY_FAT_BANDS[sex].findIndex((b) => b.category === fat.category)}
            bands={BODY_FAT_BANDS[sex].map((b, i, all) => ({ label: t.bodyFatCategories[b.category], from: b.from, to: all[i + 1]?.from ?? 100, color: ['#3DB2FF', '#7CE85A', '#B8F03A', '#FFC93D', '#FF6A3D'][i] }))}
          />
          {fat.fatMassKg !== null && fat.leanMassKg !== null && (
            <dl className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-surface-2 p-3">
                <dt className="text-xs font-semibold text-muted">{t.results.fatMass}</dt>
                <dd className="num text-2xl">
                  {num(fat.fatMassKg, 1)} <span className="font-sans text-xs not-italic">{t.units.kg}</span>
                </dd>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3">
                <dt className="text-xs font-semibold text-muted">{t.results.leanMass}</dt>
                <dd className="num text-2xl">
                  {num(fat.leanMassKg, 1)} <span className="font-sans text-xs not-italic">{t.units.kg}</span>
                </dd>
              </div>
            </dl>
          )}
        </>
      ),
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line/60 bg-bg/85 px-5 py-3 backdrop-blur-lg md:-mx-8 md:px-8">
        <div role="tablist" aria-label={t.tabsLabel} className="no-scrollbar -my-1 flex gap-2 overflow-x-auto py-1">
          {TABS.map((id) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`tab-${id}`}
              role="tab"
              type="button"
              aria-selected={tab === id}
              aria-controls={tab === id ? `panel-${id}` : undefined}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={onTabKey}
              className="chip shrink-0"
            >
              <Icon name={TAB_ICONS[id]} size={17} />
              {t.tabs[id]}
            </button>
          ))}
        </div>
        {/* Phones, once scrolled into the inputs with the result card still
            below: the result, small, under the tabs (never over the inputs
            at the bottom). Positioned out of flow, so nothing shifts. */}
        {showMini && (
          <button
            type="button"
            onClick={() => resultRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })}
            className="absolute inset-x-5 top-full mt-2 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 px-3 py-1.5 shadow-lg backdrop-blur md:inset-x-8 lg:hidden"
          >
            <span className="text-xs font-bold text-muted">
              {t.results.showResult} · {t.tabs[tab]}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="num text-lg text-accent-text">{current.summary}</span>
              <Icon name="chevron" size={16} className="rotate-90" />
            </span>
          </button>
        )}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6 grid gap-6 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-4">
          <p className="text-muted">{t.blurbs[tab]}</p>
          {panels[tab]}
        </div>

        <div ref={resultRef} className="min-w-0 lg:sticky lg:top-36">
          <section aria-labelledby="result-title" className="relative overflow-hidden rounded-[1.75rem] border border-accent/50 bg-surface p-6 shadow-[0_30px_80px_-40px_var(--accent)]">
            <div aria-hidden="true" className="pointer-events-none absolute -end-20 -top-20 size-56 glow-accent" />
            <div className="relative space-y-5">
              <div>
                <h2 id="result-title" className="flex items-center justify-between gap-2 text-sm font-bold text-muted">
                  {tab === 'calories' ? t.results.yourTarget : tab === 'protein' ? t.tabs.protein : tab === 'bmi' ? t.results.bmi : t.results.bodyFat}
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.7rem] font-extrabold tracking-wide uppercase">{estimate}</span>
                </h2>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-2" aria-hidden="true">
                  <span className="num text-[4.25rem] leading-none text-accent-text">{current.headline}</span>
                  <span className="font-bold">{current.unit}</span>
                </p>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {current.spoken}
                </p>
              </div>
              {details[tab]}
              <p className="flex items-start gap-2 border-t border-line pt-4 text-xs text-muted">
                <Icon name="info" size={15} className="mt-0.5 shrink-0" />
                {t.disclaimer}
              </p>
            </div>
          </section>
          <div className="mt-4 rounded-[1.75rem] bg-accent p-5 text-on-accent">
            <p className="text-lg font-black">{t.ctaTitle}</p>
            <p className="mt-1 text-sm font-semibold opacity-80">{t.ctaText}</p>
            <BookLink lang={lang} preset={{ note: current.note, goal: current.goal }} className="btn mt-4 w-full bg-on-accent text-accent">
              <Icon name="whatsapp" size={20} />
              {t.cta}
            </BookLink>
          </div>
        </div>
      </div>

    </div>
  );
}
