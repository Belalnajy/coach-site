import type { Locale } from '@/lib/i18n';
import { dict } from '@/lib/i18n';
import { getPosts } from '@/lib/posts';
import BlogList from '../BlogList';
import PageHeader from '../PageHeader';

export default function BlogPage({ lang }: { lang: Locale }) {
  const t = dict(lang).blog;
  const posts = getPosts().map(({ slug, date, category, cover, title, excerpt, minutes }) => ({ slug, date, category, cover, title, excerpt, minutes }));
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="container-x py-8 md:py-12">
        <BlogList lang={lang} posts={posts} />
      </div>
    </>
  );
}
