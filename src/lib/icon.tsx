import { ImageResponse } from 'next/og';
import { theme } from './config';

/** The site icon: the theme's accent with the bolt mark. No text, so it suits any coach. */
export const iconImage = (size: number, radius: number) =>
  new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.accent, borderRadius: radius }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
          <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" fill={theme.onAccent} />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
