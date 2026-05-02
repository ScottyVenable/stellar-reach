import { useMemo, useState } from 'react';
import { useGameStore } from '../../state/store';
import { allStations, currentStation, currentSystem } from '../../engine/game';
import { estimateRoute } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { GOODS_BY_ID } from '../../data/goods';
import { PanelHeader } from '../components/PanelHeader';

type SafetyChoice = 'safe' | 'fast';

/** Fraction below galactic base price that qualifies as a buy opportunity. */
const BUY_OPPORTUNITY_THRESHOLD = 0.1;
/** Maximum number of trade hints shown for a destination. */
const MAX_TRADE_HINTS = 4;

export function HelmScreen() {
  const game = useGameStore((s) => s.game)!;
  const beginTrip = useGameStore((s) => s.beginTrip);

  const [selected, setSelected] = useState<string | null>(null);
  const [safety, setSafety] = useState<SafetyChoice>('safe');

  const station = currentStation(game);
  const system = currentSystem(game);

  const stations = useMemo(() => allStations(game.galaxy).filter((s) => s.id !== station?.id), [game.galaxy, station?.id]);

  const target = stations.find((s) => s.id === selected);
  const targetSys = target ? game.galaxy.systems.find((sys) => sys.stations.some((st) => st.id === target.id)) : undefined;
  const route = useMemo(() => (target ? estimateRoute(game, target.id, safety) : null), [game, target, safety]);
  const canTravel = !!route && game.player.ship.fuel >= route.fuelCost;

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

  return (
    <div>
      <div className="card">
        <PanelHeader tag="STARMAP" code="FN04" status="ok" rightSlot={`${game.galaxy.systems.length} SYS`} />
        <div className="starmap">
          <svg viewBox="0 0 1000 1000">
            {game.galaxy.systems.map((sys) => {
              const isCurrent = sys.id === system?.id;
              const isSelected = target && targetSys?.id === sys.id;
              return (
                <g key={sys.id}>
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
                      setSelected(sys.stations[0]?.id ?? null);
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
      </div>

      <div className="card">
        <PanelHeader tag="DESTINATIONS" code="FN04A" status="ok" />
        <div className="list">
          {stations.map((s) => {
            const sys = game.galaxy.systems.find((y) => y.stations.some((st) => st.id === s.id));
            const race = RACES_BY_ID[s.raceId];
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                className={`row spread ${isSel ? 'primary' : 'muted'}`}
                onClick={() => setSelected(s.id)}
                style={{ textAlign: 'left' }}
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

      {target && route && (
        <div className="card">
          <PanelHeader tag="PLOT" code="FN04B" status={canTravel ? 'ok' : 'warn'} />
          <div className="row" style={{ marginBottom: 8 }}>
            <button className={`chip ${safety === 'safe' ? 'active' : ''}`} onClick={() => setSafety('safe')}>
              Safe Route
            </button>
            <button className={`chip ${safety === 'fast' ? 'active' : ''}`} onClick={() => setSafety('fast')}>
              Fast Route
            </button>
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
            onClick={() => beginTrip(target.id, safety)}
          >
            Engage Drive
          </button>
        </div>
      )}
    </div>
  );
}
