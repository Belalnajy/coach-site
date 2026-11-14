import { notFound } from 'next/navigation';
import TransformationsPage from '@/components/pages/TransformationsPage';
import { pageVisible } from '@/lib/nav';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'transformations');

export default function Page() {
  // Hidden while there is nothing to show (no stories yet / blog switched off).
  if (!pageVisible('transformations')) notFound();
  return <TransformationsPage lang="ar" />;
}
