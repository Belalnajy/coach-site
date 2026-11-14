import { blogCategories, coach } from '@/lib/config';
import { OG_CONTENT_TYPE, OG_SIZE, ogResponse, renderOg } from '@/lib/og';
import { getPost, getPosts } from '@/lib/posts';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = coach.name.ar;
export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)!;
  const category = blogCategories.find((c) => c.id === post.category)?.label.ar ?? '';
  return ogResponse(renderOg({ lang: 'ar', eyebrow: category, title: post.title.ar }));
}
