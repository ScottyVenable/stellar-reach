import type { GalaxyState } from '../../engine/types';

// ---------------------------------------------------------------------------
// MiniMap — desktop-only compact galaxy preview for the right rail.
//
// Status: scaffold. The full Helm integration (click-to-jump-viewport,
// coordinated highlighting) is tracked as a sub-issue of parent #91.
// ---------------------------------------------------------------------------

interface Props {
  galaxy: GalaxyState;
  currentSystemId?: string;
}

export function MiniMap({ galaxy, currentSystemId }: Props) {
  const titleId = 'minimap-title';
  return (
    <div className="minimap">
      <svg viewBox="0 0 1000 1000" role="img" aria-labelledby={titleId}>
        <title id={titleId}>Galaxy mini-map</title>
        {galaxy.systems.map((sys) => {
          const isCurrent = sys.id === currentSystemId;
          return (
            <circle
              key={sys.id}
              cx={sys.x}
              cy={sys.y}
              r={isCurrent ? 22 : 14}
              fill={isCurrent ? 'var(--accent-ok)' : 'var(--line-2)'}
              fillOpacity={isCurrent ? 0.6 : 0.45}
              stroke={isCurrent ? 'var(--accent-ok)' : 'transparent'}
              strokeWidth={2}
            />
          );
        })}
      </svg>
    </div>
  );
}
