import BlogPage from '@/components/pages/BlogPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'blog');

export default function Page() {
  return <BlogPage lang="en" />;
}
