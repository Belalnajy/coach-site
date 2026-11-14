import { notFound } from 'next/navigation';
import BlogPage from '@/components/pages/BlogPage';
import { pageVisible } from '@/lib/nav';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'blog');

export default function Page() {
  // Hidden while there is nothing to show (no stories yet / blog switched off).
  if (!pageVisible('blog')) notFound();
  return <BlogPage lang="en" />;
}
