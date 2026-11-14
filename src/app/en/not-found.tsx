import NotFoundPage from '@/components/pages/NotFoundPage';
import { notFoundMetadata } from '@/lib/page-meta';

export const metadata = notFoundMetadata('en');

export default function NotFound() {
  return <NotFoundPage lang="en" />;
}
