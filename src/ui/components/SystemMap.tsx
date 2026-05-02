import type { StarSystem, Station } from '../../engine/types';

// ---------------------------------------------------------------------------
// SystemMap — SVG renderer for a single star system.
//
// Status: scaffold. Tracked as a sub-issue of parent feature #91.
//
// Notes:
//   - Stations carry `(x, y)` already laid out by the galaxy generator on a
//     0..500 system-local coordinate space.
//   - Station kinds will resolve to distinct angular SVG glyphs in the full
//     pass; the scaffold uses simple shape primitives so the integration
//     point is stable.
// ---------------------------------------------------------------------------

const SYSTEM_BOUNDS = 500;

interface Props {
  system: StarSystem;
  /** Id of the station the player currently occupies. */
  currentStationId?: string;
  /** Id of the station the player has selected as the next destination. */
  selectedStationId?: string;
  /** Click / tap handler for a station marker. */
  onSelectStation?: (station: Station) => void;
}

function glyphForStationKind(station: Station): JSX.Element {
  // Distinct shape per station kind. Stays inside a 12px bounding box so all
  // kinds share visual weight on the system map.
  const cx = station.x;
  const cy = station.y;
  switch (station.kind) {
    case 'Trade Hub':
    case 'Industrial':
    case 'Refinery':
      return <rect x={cx - 6} y={cy - 6} width={12} height={12} />;
    case 'Military':
      return (
        <polygon
          points={`${cx},${cy - 7} ${cx + 7},${cy + 5} ${cx - 7},${cy + 5}`}
        />
      );
    case 'Black Market':
      return (
        <polygon
          points={`${cx - 6},${cy - 6} ${cx + 6},${cy - 6} ${cx + 6},${cy + 6} ${cx - 6},${cy + 6}`}
          transform={`rotate(45 ${cx} ${cy})`}
        />
      );
    case 'Pleasure Resort':
    case 'Agricultural':
      return <circle cx={cx} cy={cy} r={6} />;
    default:
      return <rect x={cx - 5} y={cy - 5} width={10} height={10} />;
  }
}

export function SystemMap({
  system,
  currentStationId,
  selectedStationId,
  onSelectStation,
}: Props) {
  const titleId = `system-map-title-${system.id}`;
  return (
    <div className="system-map" data-scaffold="true">
      <svg
        viewBox={`0 0 ${SYSTEM_BOUNDS} ${SYSTEM_BOUNDS}`}
        aria-labelledby={titleId}
      >
        <title id={titleId}>{`${system.name} system map`}</title>
        {/* Central star — decorative anchor point. */}
        <circle
          cx={SYSTEM_BOUNDS / 2}
          cy={SYSTEM_BOUNDS / 2}
          r={14}
          fill="var(--accent-amber)"
          fillOpacity={0.25}
          stroke="var(--accent-amber)"
          strokeWidth={1}
        />

        {system.stations.map((station) => {
          const isCurrent = station.id === currentStationId;
          const isSelected = station.id === selectedStationId;
          const interactive = !!onSelectStation;
          return (
            <g
              key={station.id}
              onClick={() => onSelectStation?.(station)}
              onKeyDown={(e) => {
                if (!interactive) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStation?.(station);
                }
              }}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'button' : undefined}
              aria-label={`Select station ${station.name} (${station.kind})`}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              fill={isCurrent ? 'var(--accent-ok)' : isSelected ? 'var(--accent-amber)' : 'var(--bg-3)'}
              stroke={isCurrent ? 'var(--accent-ok)' : isSelected ? 'var(--accent-amber)' : 'var(--line-2)'}
              strokeWidth={isCurrent ? 2 : 1}
            >
              <title>{`${station.name} — ${station.kind}`}</title>
              {glyphForStationKind(station)}
              <text
                x={station.x}
                y={station.y - 12}
                textAnchor="middle"
                fontSize={11}
                fill="var(--fg-1)"
                stroke="none"
                style={{ pointerEvents: 'none' }}
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
