import CalculatorsPage from '@/components/pages/CalculatorsPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'calculators');

export default function Page() {
  return <CalculatorsPage lang="en" />;
}
