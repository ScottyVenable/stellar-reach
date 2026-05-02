import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../state/store';
import { allStations, currentStation, currentSystem } from '../../engine/game';
import { estimateRoute } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { GOODS_BY_ID } from '../../data/goods';
import { GalaxyMap } from '../components/GalaxyMap';
import { SystemMap } from '../components/SystemMap';
import { PanelHeader } from '../components/PanelHeader';

type SafetyChoice = 'safe' | 'fast';

/** Fraction below galactic base price that qualifies as a buy opportunity. */
const BUY_OPPORTUNITY_THRESHOLD = 0.1;
/** Maximum number of trade hints shown for a destination. */
const MAX_TRADE_HINTS = 4;

const ROUTE_OPTIONS: { id: SafetyChoice; label: string }[] = [
  { id: 'safe', label: 'Safe Route' },
  { id: 'fast', label: 'Fast Route' },
];

export function HelmScreen() {
  const game = useGameStore((s) => s.game)!;
  const beginTrip = useGameStore((s) => s.beginTrip);
  const galaxyMapEnabled = useGameStore((s) => s.flags.galaxyMap);

  const [selected, setSelected] = useState<string | null>(null);
  const [safety, setSafety] = useState<SafetyChoice>('safe');
  const [detailOpen, setDetailOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const station = currentStation(game);
  const system = currentSystem(game);

  const stations = useMemo(() => allStations(game.galaxy).filter((s) => s.id !== station?.id), [game.galaxy, station?.id]);

  const target = stations.find((s) => s.id === selected);
  const targetSys = target ? game.galaxy.systems.find((sys) => sys.stations.some((st) => st.id === target.id)) : undefined;
  const route = useMemo(() => (target ? estimateRoute(game, target.id, safety) : null), [game, target, safety]);
  const canTravel = !!route && game.player.ship.fuel >= route.fuelCost;

  useEffect(() => {
    if (!detailOpen) return;
    closeButtonRef.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [detailOpen]);

  // Top trade opportunities: goods in hold that sell higher at target, or cheap buys at target
  const tradeHints = useMemo(() => {
    if (!target || !station) return [];

    const hints: { name: string; delta: number; action: string }[] = [];

    // Goods we hold that the destination wants at a higher price
    for (const [gid, units] of Object.entries(game.player.ship.hold)) {
      if (units <= 0) continue;
      const hereEntry = station.market.find((m) => m.goodId === gid);
      const thereEntry = target.market.find((m) => m.goodId === gid);
      if (!hereEntry || !thereEntry || thereEntry.demand <= 0) continue;
      const delta = thereEntry.price - hereEntry.price;
      if (delta > 0) {
        const good = GOODS_BY_ID[gid];
        hints.push({ name: good?.name ?? gid, delta, action: 'sell' });
      }
    }

    // Goods available at destination that are cheap vs galactic base (buy opportunity)
    for (const thereEntry of target.market) {
      if (thereEntry.supply <= 0) continue;
      const good = GOODS_BY_ID[thereEntry.goodId];
      if (!good) continue;
      const delta = good.basePrice - thereEntry.price;
      if (delta > good.basePrice * BUY_OPPORTUNITY_THRESHOLD) {
        hints.push({ name: good.name, delta, action: 'buy' });
      }
    }

    return hints.sort((a, b) => b.delta - a.delta).slice(0, MAX_TRADE_HINTS);
  }, [target, station, game.player.ship.hold]);

  function openDestination(stationId: string | null | undefined) {
    if (!stationId) return;
    setSelected(stationId);
    setDetailOpen(true);
  }

  function engageDrive() {
    if (!target || !canTravel) return;
    setDetailOpen(false);
    beginTrip(target.id, safety);
  }

  return (
    <div className="helm-screen">
      <div className="helm-layout">
      <div className="card helm-map-card">
        <PanelHeader tag="STARMAP" code="FN04" status="ok" rightSlot={`${game.galaxy.systems.length} SYS`} />
        <div className="helm-map-stack">
          {galaxyMapEnabled ? (
            <>
            <GalaxyMap
              galaxy={game.galaxy}
              currentSystemId={system?.id}
              selectedSystemId={targetSys?.id}
              onSelectSystem={(sys) => openDestination(sys.stations[0]?.id)}
            />
            {targetSys && (
              <div className="helm-system-preview">
                <SystemMap
                  system={targetSys}
                  currentStationId={station?.id}
                  selectedStationId={selected ?? undefined}
                  onSelectStation={(st) => openDestination(st.id)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="starmap">
            <svg viewBox="0 0 1000 1000">
            {game.galaxy.systems.map((sys) => {
              const isCurrent = sys.id === system?.id;
              const isSelected = target && targetSys?.id === sys.id;
              return (
                <g
                  key={sys.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open destinations in ${sys.name}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openDestination(sys.stations[0]?.id);
                    }
                  }}
                >
                  <circle
                    className={`system ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                    cx={sys.x}
                    cy={sys.y}
                    r={isCurrent ? 18 : 12}
                    fill={isCurrent ? 'rgba(34,211,238,0.3)' : 'rgba(167,139,250,0.18)'}
                    stroke={isCurrent ? 'var(--accent-cyan)' : isSelected ? 'var(--accent-amber)' : 'var(--line-2)'}
                    strokeWidth={2}
                    onClick={() => {
                      // Pick the first station of the selected system by default.
                      openDestination(sys.stations[0]?.id);
                    }}
                  />
                  <text
                    x={sys.x}
                    y={sys.y - 22}
                    textAnchor="middle"
                    fontSize={20}
                    fill="var(--fg-1)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {sys.name}
                  </text>
                </g>
              );
            })}
          </svg>
          </div>
        )}
        </div>
      </div>

      <div className="card helm-destinations-card">
        <PanelHeader tag="DESTINATIONS" code="FN04A" status="ok" />
        <div className="helm-ship-summary" aria-label="Current vessel travel summary">
          <span>{station?.name ?? 'Unknown'}</span>
          <span>Fuel {game.player.ship.fuel}/{game.player.ship.fuelMax}</span>
          <span>Cargo {game.player.ship.cargo}/{game.player.ship.cargoMax}</span>
        </div>
        <div className="list helm-destination-list">
          {stations.map((s) => {
            const sys = game.galaxy.systems.find((y) => y.stations.some((st) => st.id === s.id));
            const race = RACES_BY_ID[s.raceId];
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                className={`row spread helm-destination ${isSel ? 'primary' : 'muted'}`}
                onClick={() => openDestination(s.id)}
                aria-haspopup="dialog"
              >
                <div>
                  <div>{s.name}</div>
                  <div className="tiny">
                    {sys?.name} | {sys?.region} | {s.kind} | {race?.adjective}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {detailOpen && target && route && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailOpen(false);
          }}
        >
        <div
          className="modal helm-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="helm-detail-title"
        >
          <div className="modal-title-row">
            <div>
              <div className="tiny">PLOT / FN04B</div>
              <h2 id="helm-detail-title">{target.name}</h2>
            </div>
            <button
              type="button"
              className="ghost icon-only"
              onClick={() => setDetailOpen(false)}
              aria-label="Close destination details"
              ref={closeButtonRef}
            >
              X
            </button>
          </div>
          <div className="tiny" style={{ marginBottom: 10 }}>
            {targetSys?.name} | {targetSys?.region} | {target.kind} | {RACES_BY_ID[target.raceId]?.adjective}
          </div>
          <div className="row" style={{ marginBottom: 8 }}>
            {ROUTE_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`chip ${safety === option.id ? 'active' : ''}`}
                onClick={() => setSafety(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="kv">
            <span className="k">Distance</span>
            <span className="v">{route.distance}</span>
            <span className="k">Days</span>
            <span className="v">{route.days}</span>
            <span className="k">Fuel</span>
            <span className="v">{route.fuelCost} / {game.player.ship.fuel}</span>
            <span className="k">Events</span>
            <span className="v">{route.eventCount}</span>
            <span className="k">Hold</span>
            <span className="v">{game.player.ship.cargo}/{game.player.ship.cargoMax}</span>
          </div>
          {tradeHints.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="tiny" style={{ marginBottom: 4 }}>TRADE OPPORTUNITIES</div>
              {tradeHints.map((h, i) => (
                <div key={i} className="tiny row spread" style={{ padding: '2px 0' }}>
                  <span>{h.name}</span>
                  <span className={h.action === 'sell' ? 'amber' : 'cyan'}>
                    {h.action === 'sell' ? `sell +${h.delta}cr/u` : `buy −${h.delta}cr vs avg`}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!canTravel && <div className="notice bad" style={{ marginTop: 10 }}>Insufficient fuel for this route.</div>}
          <button
            className="primary"
            style={{ marginTop: 10, width: '100%' }}
            disabled={!canTravel}
            onClick={engageDrive}
          >
            Engage Drive
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
