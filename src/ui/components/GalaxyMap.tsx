import { useMemo, useState } from 'react';
import type { GalaxyState, StarSystem } from '../../engine/types';

// ---------------------------------------------------------------------------
// GalaxyMap — SVG renderer for the entire galaxy.
//
// Status: scaffold. The real implementation is tracked as a sub-issue of
// parent feature #91. This file establishes the component shape and the
// viewport math so subsequent passes (full pan/zoom, station markers,
// route preview) drop into a known surface.
//
// Architecture notes (see PR description for parent #91 design pass):
//   - Galaxy data comes from `state.galaxy` already laid out on a 1000x1000
//     coordinate space by the seeded generator in `src/engine/galaxy.ts`.
//   - Pan/zoom is driven by a `viewBox` on the root <svg>; all DOM math is
//     SVG-native, no canvas, no transform-on-children.
//   - Pointer interaction will be unified across mouse + touch via
//     PointerEvent — no separate touch handlers, no UA sniffing.
//   - The currently-rendered viewBox lives in component state so React
//     re-renders are cheap (one number tuple) and the renderer remains
//     deterministic against props.
// ---------------------------------------------------------------------------

const GALAXY_BOUNDS = 1000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

interface Props {
  galaxy: GalaxyState;
  /** Id of the system the player currently occupies. */
  currentSystemId?: string;
  /** Id of the system the player has currently selected (target). */
  selectedSystemId?: string;
  /** Faction colour resolver. Falls back to a neutral line colour. */
  factionColour?: (system: StarSystem) => string;
  /** Click / tap handler for a system marker. */
  onSelectSystem?: (system: StarSystem) => void;
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_VIEW: ViewBox = { x: 0, y: 0, w: GALAXY_BOUNDS, h: GALAXY_BOUNDS };

function clampZoom(z: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

export function GalaxyMap({
  galaxy,
  currentSystemId,
  selectedSystemId,
  factionColour,
  onSelectSystem,
}: Props) {
  const [view, setView] = useState<ViewBox>(INITIAL_VIEW);

  const viewBoxStr = `${view.x} ${view.y} ${view.w} ${view.h}`;

  const systems = galaxy.systems;
  const colourOf = useMemo(
    () => (sys: StarSystem) => (factionColour ? factionColour(sys) : 'var(--line-2)'),
    [factionColour],
  );

  // Reset is exposed via a button overlay so the player can recover from a
  // disorienting zoom. Pan/zoom gestures themselves arrive in a follow-up
  // sub-task; the scaffold leaves the view static at the default bounds.
  function resetView() {
    setView(INITIAL_VIEW);
  }

  // Reserved for the pan/zoom sub-task; suppresses unused-warning for
  // clampZoom while the scaffold is in place.
  void clampZoom;

  return (
    <div className="galaxy-map" data-scaffold="true">
      <svg viewBox={viewBoxStr} role="img" aria-label="Galaxy map">
        {systems.map((sys) => {
          const isCurrent = sys.id === currentSystemId;
          const isSelected = sys.id === selectedSystemId;
          return (
            <g key={sys.id}>
              <circle
                cx={sys.x}
                cy={sys.y}
                r={isCurrent ? 14 : 10}
                fill={colourOf(sys)}
                fillOpacity={0.25}
                stroke={isCurrent ? 'var(--accent-ok)' : isSelected ? 'var(--accent-amber)' : colourOf(sys)}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                onClick={() => onSelectSystem?.(sys)}
                style={{ cursor: onSelectSystem ? 'pointer' : 'default' }}
              />
              <text
                x={sys.x}
                y={sys.y - 18}
                textAnchor="middle"
                fontSize={18}
                fill="var(--fg-1)"
                style={{ pointerEvents: 'none' }}
              >
                {sys.name}
              </text>
            </g>
          );
        })}
      </svg>
      <button
        type="button"
        className="muted galaxy-map-reset"
        onClick={resetView}
        aria-label="Reset map view"
      >
        Reset View
      </button>
    </div>
  );
}
