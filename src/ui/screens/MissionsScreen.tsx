import { useMemo, useState } from 'react';
import { useGameStore } from '../../state/store';
import { allStations, currentStation, estimateRoute } from '../../engine/game';
import { GOODS_BY_ID } from '../../data/goods';
import { PanelHeader } from '../components/PanelHeader';

export function MissionsScreen() {
  const game = useGameStore((s) => s.game)!;
  const hireCourier = useGameStore((s) => s.hireCourier);
  const clearMission = useGameStore((s) => s.clearMission);

  const station = currentStation(game);
  const otherStations = useMemo(() => allStations(game.galaxy).filter((s) => s.id !== station?.id), [game.galaxy, station?.id]);
  const heldGoods = Object.entries(game.player.ship.hold);

  const [goodId, setGoodId] = useState<string>(heldGoods[0]?.[0] ?? '');
  const [units, setUnits] = useState<number>(1);
  const [destId, setDestId] = useState<string>(otherStations[0]?.id ?? '');

  const have = goodId ? game.player.ship.hold[goodId] ?? 0 : 0;
  const route = useMemo(() => (destId ? estimateRoute(game, destId, 'safe') : null), [game, destId]);
  const dest = otherStations.find((s) => s.id === destId);
  const fee = 250 + units * 8;
  const canHire = !!route && have >= units && units > 0 && game.player.credits >= fee;

  return (
    <div>
      <div className="card">
        <PanelHeader tag="COURIER" code="FN06" status="ok" />
        <div className="muted" style={{ marginBottom: 8 }}>
          Pay an independent crew to ferry cargo while you stay in port. Their pay is calculated
          against the destination market price; expect ~92% of fair value on delivery.
        </div>
        {heldGoods.length === 0 && <div className="notice warn">Your hold is empty. Buy something to ferry first.</div>}
        {heldGoods.length > 0 && (
          <div className="list">
            <label className="tiny">Cargo</label>
            <select value={goodId} onChange={(e) => setGoodId(e.target.value)}>
              {heldGoods.map(([gid, u]) => {
                const g = GOODS_BY_ID[gid];
                if (!g) return null;
                return (
                  <option key={gid} value={gid}>{g.name} ({u} units)</option>
                );
              })}
            </select>
            <label className="tiny">Units</label>
            <input
              type="number"
              min={1}
              max={have}
              value={units}
              onChange={(e) => setUnits(Math.max(1, Math.min(have, Number(e.target.value) || 1)))}
              inputMode="numeric"
            />
            <label className="tiny">Destination</label>
            <select value={destId} onChange={(e) => setDestId(e.target.value)}>
              {otherStations.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.kind})</option>
              ))}
            </select>
            {route && dest && (
              <div className="kv">
                <span className="k">Days</span>
                <span className="v">{route.days + 1}</span>
                <span className="k">Hire Fee</span>
                <span className="v">{fee}cr</span>
              </div>
            )}
            <button className="primary" onClick={() => goodId && hireCourier(goodId, units, destId)} disabled={!canHire}>
              Dispatch Courier
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Active Jobs</h3>
        {game.missions.length === 0 && <div className="muted">No active courier missions.</div>}
        {game.missions.map((m) => {
          const good = GOODS_BY_ID[m.goodId];
          const dst = allStations(game.galaxy).find((s) => s.id === m.toStationId);
          return (
            <div key={m.id} className="card" style={{ background: 'var(--bg-2)' }}>
              <div className="row spread">
                <div>
                  <div>{good?.name ?? 'Unknown'} x{m.units}</div>
                  <div className="tiny">to {dst?.name} | due D{m.endDay}</div>
                </div>
                <div className={
                  m.status === 'In Transit' ? 'cyan' : m.status === 'Completed' ? 'green' : 'red'
                }>{m.status}</div>
              </div>
              {m.status !== 'In Transit' && (
                <button className="muted" style={{ marginTop: 8 }} onClick={() => clearMission(m.id)}>
                  Dismiss
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
