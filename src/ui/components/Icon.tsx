import type { SVGProps } from 'react';

/*
 * Inline SVG icon set for the bridge-console UI. Icons are drawn in a
 * single style: 24x24 viewBox, 1.6px strokes, sharp corners, no fill.
 * They take their colour from `currentColor` so the active-state glow
 * applied by the parent CSS class flows through.
 *
 * Keep this set small and purpose-built. New tab destinations should add
 * a glyph here rather than pulling in a generic icon library.
 */

type IconName =
  | 'market'
  | 'ship'
  | 'crew'
  | 'helm'
  | 'news'
  | 'jobs'
  | 'log'
  | 'settings'
  | 'close';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

const COMMON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...COMMON_PROPS}
      {...rest}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

const ICON_PATHS: Record<IconName, JSX.Element> = {
  market: (
    <>
      <path d="M3 8h18l-2 11H5L3 8z" />
      <path d="M8 8V5a4 4 0 0 1 8 0v3" />
      <path d="M9 13h6" />
    </>
  ),
  ship: (
    <>
      <path d="M12 3l5 6v6l-5 3-5-3V9l5-6z" />
      <path d="M12 3v18" />
      <path d="M7 9l5 3 5-3" />
    </>
  ),
  crew: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.2" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M14.5 19c.2-2 1.6-3.5 4-3.5 1.6 0 2.5.6 3 1.5" />
    </>
  ),
  helm: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8l5 3" />
      <path d="M4 12h2" />
      <path d="M18 12h2" />
      <path d="M12 20v-2" />
    </>
  ),
  news: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M7 9h10" />
      <path d="M7 13h7" />
      <path d="M7 17h5" />
    </>
  ),
  jobs: (
    <>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  log: (
    <>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M16 4v3h3" />
      <path d="M8 11h8" />
      <path d="M8 15h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2l-.4-2.4h-4l-.4 2.4a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.4h4l.4-2.4a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c0-.4.1-.8.1-1.2z" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
};
