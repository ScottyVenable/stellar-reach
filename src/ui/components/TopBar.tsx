import { useMemo } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';

export function TopBar() {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  if (!game) return null;
  const station = currentStation(game);
  const system = currentSystem(game);
  const race = station ? RACES_BY_ID[station.raceId] : undefined;

  // Net worth = credits + cargo market value
  const netWorth = useMemo(() => {
    let total = game.player.credits;
    if (station) {
      for (const [gid, units] of Object.entries(game.player.ship.hold)) {
        const e = station.market.find((m) => m.goodId === gid);
        if (e) total += e.price * units;
      }
    }
    return total;
  }, [game.player.credits, game.player.ship.hold, station]);

  return (
    <header className="topbar">
      <button className="muted" onClick={() => setScreen('log')} aria-label="Captain's log">
        LOG
      </button>
      <div className="station">
        <div className="name">{station?.name ?? 'Unknown'}</div>
        <div className="sub">
          {system?.name} <span className="muted">| {system?.region}</span>{' '}
          <span className="muted">| {station?.kind}</span>{' '}
          <span className="muted">| {race?.adjective}</span>
        </div>
      </div>
      <div>
        <div className="day">D{String(game.player.day).padStart(3, '0')}</div>
        <div className="credits">
          <span className="label">CR</span>
          {game.player.credits.toLocaleString()}
        </div>
        <div className="tiny muted" style={{ textAlign: 'right' }}>
          NET {netWorth.toLocaleString()}
        </div>
      </div>
    </header>
  );
}
