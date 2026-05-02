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
// sol: zoom bounds (MIN_ZOOM / MAX_ZOOM) and the matching `clampZoom`
// helper land with the pan/zoom gesture handlers in #94 — intentionally
// omitted from the scaffold to keep the surface lint-clean.

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

  // Reset is exposed via an absolutely-positioned overlay button (see
  // `.galaxy-map-reset` in global.css) so the player can recover from a
  // disorienting zoom without scrolling. Pan/zoom gestures themselves
  // arrive in a follow-up sub-task; the scaffold leaves the view static
  // at the default bounds.
  function resetView() {
    setView(INITIAL_VIEW);
  }

  function activate(sys: StarSystem) {
    onSelectSystem?.(sys);
  }

  return (
    <div className="galaxy-map" data-scaffold="true">
      <svg viewBox={viewBoxStr} aria-label="Galaxy map">
        {systems.map((sys) => {
          const isCurrent = sys.id === currentSystemId;
          const isSelected = sys.id === selectedSystemId;
          const interactive = !!onSelectSystem;
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
                onClick={() => activate(sys)}
                onKeyDown={(e) => {
                  if (!interactive) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(sys);
                  }
                }}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? 'button' : undefined}
                aria-label={`Select system ${sys.name}`}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              >
                <title>{sys.name}</title>
              </circle>
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
