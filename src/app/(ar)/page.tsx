import HomePage from '@/components/pages/HomePage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'home');

export default function Page() {
  return <HomePage lang="ar" />;
}
