import { notFound } from 'next/navigation';
import ArticlePage from '@/components/pages/ArticlePage';
import { articleMetadata } from '@/lib/article-meta';
import { getPost, getPosts } from '@/lib/posts';

export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));
export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => articleMetadata('ar', (await params).slug);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <ArticlePage lang="ar" post={post} />;
}
