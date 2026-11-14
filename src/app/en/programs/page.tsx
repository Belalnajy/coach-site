import ProgramsPage from '@/components/pages/ProgramsPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('en', 'programs');

export default function Page() {
  return <ProgramsPage lang="en" />;
}
