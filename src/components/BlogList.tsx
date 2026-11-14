'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { blogCategories } from '@/lib/config';
import PostCard, { type PostSummary } from './PostCard';

/** Category chips over the article grid. Categories with no article are not offered. */
export default function BlogList({ lang, posts }: { lang: Locale; posts: PostSummary[] }) {
  const t = dict(lang).blog;
  const [category, setCategory] = useState('all');
  const used = blogCategories.filter((c) => posts.some((p) => p.category === c.id));
  const shown = category === 'all' ? posts : posts.filter((p) => p.category === category);
  return (
    <>
      <div role="group" aria-label={t.filterLabel} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1 md:mx-0 md:px-0">
        {[{ id: 'all', label: { ar: t.all, en: t.all } }, ...used].map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label[lang]}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} lang={lang} headingLevel={2} />
          </li>
        ))}
      </ul>
    </>
  );
}
