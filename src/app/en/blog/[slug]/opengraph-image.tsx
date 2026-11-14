import { blogCategories, coach } from '@/lib/config';
import { OG_CONTENT_TYPE, OG_SIZE, ogResponse, renderOg } from '@/lib/og';
import { getPost, getPosts } from '@/lib/posts';
import { features } from '@/lib/config';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = coach.name.en;
export const dynamicParams = false;
// No article pages while the blog is switched off.
export const generateStaticParams = () => (features.blog ? getPosts().map((p) => ({ slug: p.slug })) : []);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)!;
  const category = blogCategories.find((c) => c.id === post.category)?.label.en ?? '';
  return ogResponse(renderOg({ lang: 'en', eyebrow: category, title: post.title.en }));
}
