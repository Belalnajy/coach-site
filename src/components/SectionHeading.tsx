import type { ReactNode } from 'react';

export default function SectionHeading({ eyebrow, title, text, id, action, center = false }: { eyebrow: string; title: string; text?: string; id?: string; action?: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-8 flex flex-col gap-4 md:mb-12 ${center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={center ? 'max-w-2xl' : 'max-w-2xl'}>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 id={id} className="display text-balance text-[2.4rem] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {text && <p className="mt-4 max-w-xl text-pretty text-lg text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}
