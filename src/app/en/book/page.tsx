import BookPage from '@/components/pages/BookPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'book');

export default function Page() {
  return <BookPage lang="en" />;
}
