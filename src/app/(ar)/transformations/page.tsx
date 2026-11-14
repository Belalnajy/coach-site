import TransformationsPage from '@/components/pages/TransformationsPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'transformations');

export default function Page() {
  return <TransformationsPage lang="ar" />;
}
