import { coach } from '@/lib/config';
import { OG_CONTENT_TYPE, OG_SIZE, ogResponse, routeOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = coach.name.ar;

export default function Image() {
  return ogResponse(routeOg('ar', 'home'));
}
