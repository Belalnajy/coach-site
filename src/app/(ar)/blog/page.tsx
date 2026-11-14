import BlogPage from '@/components/pages/BlogPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'blog');

export default function Page() {
  return <BlogPage lang="ar" />;
}
