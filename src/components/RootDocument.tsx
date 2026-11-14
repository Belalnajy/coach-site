import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { theme } from '@/lib/config';
import { siteJsonLd } from '@/lib/jsonld';
import type { Palette } from '../../site.config/types';
import JsonLd from './JsonLd';
import SiteShell from './SiteShell';

const vars = (p: Palette) =>
  `--bg:${p.bg};--surface:${p.surface};--surface2:${p.surface2};--line:${p.line};--text:${p.text};--muted:${p.muted};--accent-text:${p.accentText};`;

/**
 * The theme from site.config/theme.ts as CSS variables. Without JavaScript
 * the default mode applies; with it, the visitor's saved choice is stamped
 * on <html data-theme> before the first paint (THEME_INIT below).
 */
const THEME_CSS = `:root{${vars(theme[theme.defaultMode])}--accent:${theme.accent};--on-accent:${theme.onAccent};--hot:${theme.hot};--on-hot:${theme.onHot};color-scheme:${theme.defaultMode}}
:root[data-theme=dark]{${vars(theme.dark)}color-scheme:dark}
:root[data-theme=light]{${vars(theme.light)}color-scheme:light}
.force-dark{${vars(theme.dark)}color-scheme:dark;background:var(--bg);color:var(--text)}`;

// Runs before anything paints: marks that JS is on (for scroll reveals) and
// applies the saved theme, so a light-mode visitor never sees a dark flash.
const THEME_INIT = `(function(d){d.classList.add('js');try{var m=localStorage.getItem('theme');d.setAttribute('data-theme',m==='light'||m==='dark'?m:'${theme.defaultMode}')}catch(e){d.setAttribute('data-theme','${theme.defaultMode}')}})(document.documentElement)`;

/**
 * The <html> document shared by both language trees. Each tree has its own
 * root layout (src/app/(ar)/layout.tsx, src/app/en/layout.tsx), so the
 * server HTML already carries the right lang and dir.
 */
export default function RootDocument({ lang, fontClasses, children }: { lang: Locale; fontClasses: string; children: ReactNode }) {
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-theme={theme.defaultMode} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      </head>
      <body className={`${fontClasses} antialiased`}>
        {siteJsonLd(lang).map((data, i) => (
          <JsonLd key={i} data={data} />
        ))}
        <SiteShell lang={lang}>{children}</SiteShell>
      </body>
    </html>
  );
}
