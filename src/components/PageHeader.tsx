import type { ReactNode } from 'react';

/** The top of an inner page: eyebrow, the page's only H1, an intro line. */
export default function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10%] size-[28rem] glow-accent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[size:48px_48px] opacity-40" />
      <div className="container-x relative pt-10 pb-10 md:pt-16 md:pb-14">
        <p className="eyebrow rise mb-4">{eyebrow}</p>
        <h1 className="display rise text-balance text-[2.75rem] sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && <p className="rise mt-5 max-w-2xl text-pretty text-lg text-muted [animation-delay:80ms]">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
