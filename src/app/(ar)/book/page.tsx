import BookPage from '@/components/pages/BookPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'book');

export default function Page() {
  return <BookPage lang="ar" />;
}
