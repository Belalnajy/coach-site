import type { NextConfig } from 'next';

/**
 * Every page is prerendered to static HTML at build time; the only server
 * work left is next/image resizing and the generated share images, both of
 * which run on Vercel's free tier.
 *
 * The security headers below are deliberately not a nonce-based CSP: a
 * nonce needs a per-request render, which would give up static pages. Inline
 * scripts (the theme bootstrap and JSON-LD) stay allowed; everything else is
 * limited to this origin. WhatsApp is reached by navigation, not by fetch,
 * so it needs no entry here.
 */
const isProduction = process.env.NODE_ENV === 'production';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // One static 404 document for every unknown address, in either language
  // (src/app/global-not-found.tsx): needed because each language has its
  // own root layout.
  experimental: { globalNotFound: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isProduction ? [{ key: 'Content-Security-Policy', value: CSP }] : []),
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};

export default nextConfig;
