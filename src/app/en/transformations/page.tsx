import TransformationsPage from '@/components/pages/TransformationsPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'transformations');

export default function Page() {
  return <TransformationsPage lang="en" />;
}
