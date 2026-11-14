import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { blogCategories, coach } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import type { Block, Inline } from '@/lib/markdown';
import { getPosts, type Post } from '@/lib/posts';
import { href, route } from '@/lib/routes';
import { absolute } from '@/lib/seo';
import BookLink from '../BookLink';
import Icon from '../Icon';
import JsonLd from '../JsonLd';
import PostCard, { readingTime } from '../PostCard';
import ShareLinks from '../ShareLinks';

const inline = (parts: Inline[]): ReactNode =>
  parts.map((p, i) => {
    if (p.type === 'strong') return <strong key={i}>{p.text}</strong>;
    if (p.type === 'em') return <em key={i}>{p.text}</em>;
    if (p.type === 'link') {
      const external = /^https?:\/\//.test(p.href);
      return (
        <a key={i} href={p.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {p.text}
        </a>
      );
    }
    return p.text;
  });

const block = (b: Block, i: number): ReactNode => {
  switch (b.type) {
    case 'h2':
      return <h2 key={i}>{inline(b.content)}</h2>;
    case 'h3':
      return <h3 key={i}>{inline(b.content)}</h3>;
    case 'quote':
      return <blockquote key={i}>{inline(b.content)}</blockquote>;
    case 'ul':
    case 'ol': {
      const List = b.type;
      return (
        <List key={i}>
          {b.items.map((item, j) => (
            <li key={j}>{inline(item)}</li>
          ))}
        </List>
      );
    }
    default:
      return <p key={i}>{inline(b.content)}</p>;
  }
};

export default function ArticlePage({ lang, post }: { lang: Locale; post: Post }) {
  const t = dict(lang);
  const category = blogCategories.find((c) => c.id === post.category)?.label[lang];
  const related = getPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 2);
  const url = absolute(lang, `/blog/${post.slug}`);
  return (
    <article>
      <JsonLd data={articleJsonLd(lang, post)} />
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          { name: t.nav.home, path: '/' },
          { name: t.nav.blog, path: '/blog' },
          { name: post.title[lang], path: `/blog/${post.slug}` },
        ])}
      />
      <header className="container-x max-w-3xl pt-8 md:pt-14">
        <Link href={route(lang, 'blog')} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
          <Icon name="arrow" size={16} className="rotate-180 rtl:rotate-0" />
          {t.blog.back}
        </Link>
        <p className="eyebrow mt-4 mb-3">{category}</p>
        <h1 className="text-[2.1rem] leading-tight font-black text-balance sm:text-5xl">{post.title[lang]}</h1>
        <p className="mt-4 text-lg text-pretty text-muted">{post.excerpt[lang]}</p>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="font-bold text-ink">{coach.name[lang]}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(lang, post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(lang, post.minutes[lang])}</span>
        </p>
      </header>
      <div className="container-x mt-8 max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-line bg-surface-2">
          <Image src={post.cover} alt="" fill priority sizes="(min-width: 900px) 860px, 100vw" className="object-cover" />
        </div>
      </div>
      <div className="container-x max-w-3xl py-10">
        <div className="prose-coach">{post.body[lang].map(block)}</div>
        <div className="mt-10 border-t border-line pt-6">
          <ShareLinks lang={lang} url={url} title={post.title[lang]} />
        </div>
        <aside className="mt-10 flex flex-col gap-4 rounded-[1.75rem] bg-accent p-6 text-on-accent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black">{t.blog.ctaTitle}</p>
            <p className="mt-1 text-sm font-semibold opacity-80">{t.blog.ctaText}</p>
          </div>
          <BookLink lang={lang} className="btn shrink-0 bg-on-accent text-accent">
            <Icon name="whatsapp" size={20} />
            {t.common.bookNow}
          </BookLink>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="border-t border-line bg-surface/40 py-12" aria-labelledby="related-title">
          <div className="container-x">
            <h2 id="related-title" className="display mb-6 text-4xl">
              {t.blog.related}
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} lang={lang} />
                </li>
              ))}
            </ul>
            <Link href={href(lang, '/blog')} className="btn btn-ghost mt-6">
              {t.blog.back}
              <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
