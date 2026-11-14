'use client';

import { useState } from 'react';
import { fill } from '@/lib/fill';
import Icon, { type IconName } from './Icon';

export interface ShareLabels {
  share: string;
  /** "Share on {network}" */
  shareOn: string;
  copyLink: string;
  copied: string;
  newTab: string;
  whatsapp: string;
  x: string;
  facebook: string;
}

/** Share an article: WhatsApp, X, Facebook; copy the link, or the phone's own share sheet when there is one. */
export default function ShareLinks({ labels: l, url, title }: { labels: ShareLabels; url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const networks: { name: string; icon: IconName; href: string }[] = [
    { name: l.whatsapp, icon: 'whatsapp', href: `https://wa.me/?text=${text}` },
    { name: l.x, icon: 'x', href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: l.facebook, icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];
  const btn = 'grid size-11 place-items-center rounded-full border border-line bg-surface transition hover:border-accent hover:bg-accent hover:text-on-accent';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="me-1 text-sm font-bold text-muted">{l.share}</p>
      {networks.map((n) => (
        <a key={n.name} href={n.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${fill(l.shareOn, { network: n.name })} ${l.newTab}`}>
          <Icon name={n.icon} size={19} />
        </a>
      ))}
      <button
        type="button"
        className={btn}
        aria-label={copied ? l.copied : l.copyLink}
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
        {copied ? l.copied : ''}
      </span>
    </div>
  );
}
