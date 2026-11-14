import { notFound } from 'next/navigation';
import ArticlePage from '@/components/pages/ArticlePage';
import { articleMetadata } from '@/lib/article-meta';
import { getPost, getPosts } from '@/lib/posts';
import { features } from '@/lib/config';

export const dynamicParams = false;
// No article pages while the blog is switched off.
export const generateStaticParams = () => (features.blog ? getPosts().map((p) => ({ slug: p.slug })) : []);
export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => articleMetadata('en', (await params).slug);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <ArticlePage lang="en" post={post} />;
}
