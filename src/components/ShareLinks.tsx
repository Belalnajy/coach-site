'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import Icon, { type IconName } from './Icon';

/** Share an article: WhatsApp, X, Facebook, LinkedIn-free; copy link; the phone's own share sheet when there is one. */
export default function ShareLinks({ lang, url, title }: { lang: Locale; url: string; title: string }) {
  const t = dict(lang);
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const networks: { name: string; icon: IconName; href: string }[] = [
    { name: t.common.whatsapp, icon: 'whatsapp', href: `https://wa.me/?text=${text}` },
    { name: t.common.x, icon: 'x', href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: t.common.facebook, icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];
  const btn = 'grid size-11 place-items-center rounded-full border border-line bg-surface transition hover:border-accent hover:bg-accent hover:text-on-accent';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="me-1 text-sm font-bold text-muted">{t.blog.share}</p>
      {networks.map((n) => (
        <a key={n.name} href={n.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${fill(t.blog.shareOn, { network: n.name })} ${t.common.newTab}`}>
          <Icon name={n.icon} size={19} />
        </a>
      ))}
      <button
        type="button"
        className={btn}
        aria-label={copied ? t.blog.copied : t.blog.copyLink}
        onClick={async () => {
          try {
            if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
              await navigator.share({ title, url });
              return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* dismissed */
          }
        }}
      >
        <Icon name={copied ? 'check' : 'link'} size={19} />
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? t.blog.copied : ''}
      </span>
    </div>
  );
}
