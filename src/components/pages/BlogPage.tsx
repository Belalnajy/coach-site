import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { blogCategories } from '@/lib/config';
import { getPosts } from '@/lib/posts';
import BlogList from '../BlogList';
import PageHeader from '../PageHeader';
import PostCard from '../PostCard';

export default function BlogPage({ lang }: { lang: Locale }) {
  const t = dict(lang).blog;
  const posts = getPosts();
  // Only categories that have articles become filters.
  const chips = blogCategories.filter((c) => posts.some((p) => p.category === c.id)).map((c) => ({ id: c.id, label: c.label[lang] }));
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="container-x py-8 md:py-12">
        <BlogList
          chips={chips}
          labels={{ all: t.all, filterLabel: t.filterLabel }}
          posts={posts.map((p) => ({ slug: p.slug, category: p.category, card: <PostCard post={p} lang={lang} headingLevel={2} /> }))}
        />
      </div>
    </>
  );
}
