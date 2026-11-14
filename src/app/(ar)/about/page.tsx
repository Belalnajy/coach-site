import AboutPage from '@/components/pages/AboutPage';
import { routeMetadata } from '@/lib/page-meta';

export const metadata = routeMetadata('ar', 'about');

export default function Page() {
  return <AboutPage lang="ar" />;
}
