import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';

/**
 * Right-rail summary panel rendered on desktop layouts (>= 960px viewports).
 * Shows the same vital signs that the TopBar shows on mobile, in a denser
 * stacked form. The TopBar hides this content on desktop so the data is not
 * duplicated.
 */
export function RightRail() {
  const game = useGameStore((s) => s.game);
  if (!game) return null;
  const station = currentStation(game);
  const system = currentSystem(game);
  const race = station ? RACES_BY_ID[station.raceId] : undefined;
  const ship = game.player.ship;

  const hullPct = ship.hullMax > 0 ? Math.round((ship.hull / ship.hullMax) * 100) : 0;
  const fuelPct = ship.fuelMax > 0 ? Math.round((ship.fuel / ship.fuelMax) * 100) : 0;
  const cargoPct = ship.cargoMax > 0 ? Math.round((ship.cargo / ship.cargoMax) * 100) : 0;

  return (
    <aside className="rightrail" aria-label="Status summary">
      <div className="card">
        <h3>Status</h3>
        <div className="kv">
          <span className="k">Day</span>
          <span className="v">{String(game.player.day).padStart(3, '0')}</span>
          <span className="k">Credits</span>
          <span className="v amber">{game.player.credits.toLocaleString()}</span>
        </div>
      </div>

      <div className="card">
        <h3>Station</h3>
        <div className="rightrail-name cyan">{station?.name ?? 'Unknown'}</div>
        <div className="tiny" style={{ marginTop: 2 }}>
          {system?.name} | {system?.region}
        </div>
        <div className="tiny" style={{ marginTop: 2 }}>
          {station?.kind} | {race?.adjective}
        </div>
      </div>

      <div className="card">
        <h3>Ship</h3>
        <div className="kv">
          <span className="k">Hull</span>
          <span className="v">{ship.hull}/{ship.hullMax}</span>
        </div>
        <div className="bar" aria-label={`Hull ${hullPct}%`}>
          <div style={{ width: `${hullPct}%` }} />
        </div>
        <div className="kv" style={{ marginTop: 6 }}>
          <span className="k">Fuel</span>
          <span className="v">{ship.fuel}/{ship.fuelMax}</span>
        </div>
        <div className="bar" aria-label={`Fuel ${fuelPct}%`}>
          <div style={{ width: `${fuelPct}%` }} />
        </div>
        <div className="kv" style={{ marginTop: 6 }}>
          <span className="k">Cargo</span>
          <span className="v">{ship.cargo}/{ship.cargoMax}</span>
        </div>
        <div className="bar" aria-label={`Cargo ${cargoPct}%`}>
          <div style={{ width: `${cargoPct}%` }} />
        </div>
      </div>
    </aside>
  );
}
