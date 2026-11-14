'use client';

import { useState, type ReactNode } from 'react';

/**
 * Category chips over the article grid. The cards are rendered on the
 * server; this only shows or hides them, so it ships no config.
 */
export default function BlogList({
  posts,
  chips,
  labels,
}: {
  posts: { slug: string; category: string; card: ReactNode }[];
  chips: { id: string; label: string }[];
  labels: { all: string; filterLabel: string };
}) {
  const [category, setCategory] = useState('all');
  return (
    <>
      <div role="group" aria-label={labels.filterLabel} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1 md:mx-0 md:px-0">
        {[{ id: 'all', label: labels.all }, ...chips].map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug} hidden={category !== 'all' && post.category !== category}>
            {post.card}
          </li>
        ))}
      </ul>
    </>
  );
}
