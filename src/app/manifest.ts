import type { MetadataRoute } from 'next';
import { coach, theme } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: coach.name.ar,
    short_name: coach.shortName.ar,
    description: coach.intro.ar,
    start_url: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'ar',
    background_color: theme.dark.bg,
    theme_color: theme.dark.bg,
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
