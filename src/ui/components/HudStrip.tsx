import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { Icon } from './Icon';
import { useMemo } from 'react';

interface Props {
  onOpenSettings: () => void;
}

/**
 * Desktop HUD strip — a single horizontal instrument bar that runs across
 * the top of the bridge layout. Shown only on viewports >= 960px wide
 * (CSS hides it on mobile in favour of the compact .topbar grid).
 *
 * Layout, left to right:
 *   - Brand cell (game name + class line)
 *   - Stardate + system region
 *   - Callsign (current station + race)
 *   - Ship status bars (hull / fuel / cargo) — three thin rows
 *   - Credits + net worth
 *   - Settings + log buttons
 */
export function HudStrip({ onOpenSettings }: Props) {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);

  const station = game ? currentStation(game) : undefined;
  const system = game ? currentSystem(game) : undefined;
  const race = station ? RACES_BY_ID[station.raceId] : undefined;
  const ship = game?.player.ship;

  const netWorth = useMemo(() => {
    if (!game || !station) return game?.player.credits ?? 0;
    let total = game.player.credits;
    for (const [gid, units] of Object.entries(game.player.ship.hold)) {
      const e = station.market.find((m) => m.goodId === gid);
      if (e) total += e.price * units;
    }
    return total;
  }, [game, station]);

  if (!game || !ship) return null;

  const hullPct = ship.hullMax > 0 ? Math.round((ship.hull / ship.hullMax) * 100) : 0;
  const fuelPct = ship.fuelMax > 0 ? Math.round((ship.fuel / ship.fuelMax) * 100) : 0;
  const cargoPct = ship.cargoMax > 0 ? Math.round((ship.cargo / ship.cargoMax) * 100) : 0;

  // Status bar tone reflects how stressed the system is. Hull and fuel go
  // amber under 50% and red under 25%; cargo is informational only.
  const tone = (pct: number) => (pct < 25 ? 'warn' : pct < 50 ? 'warn' : '');

  return (
    <div className="hud-strip" role="group" aria-label="Ship status">
      <div className="hud-cell brand">
        <span className="hud-label">Stellar Reach</span>
        <span className="hud-value">Bridge Console</span>
      </div>

      <div className="hud-cell">
        <span className="hud-label">Stardate</span>
        <span className="hud-value">D{String(game.player.day).padStart(3, '0')}</span>
        <span className="hud-sub">{system?.region ?? '—'}</span>
      </div>

      <div className="hud-cell flex">
        <span className="hud-label">Callsign</span>
        <span className="hud-value">{station?.name ?? 'Unknown'}</span>
        <span className="hud-sub">
          {system?.name} · {station?.kind} · {race?.adjective}
        </span>
      </div>

      <div className="hud-cell" style={{ minWidth: 240 }}>
        <span className="hud-label">Vessel</span>
        <div className={`hud-status-row`}>
          <span className="k">Hull</span>
          <div className={`bar ${hullPct < 50 ? 'warn' : 'ok'}`} aria-hidden="true">
            <div style={{ width: `${hullPct}%` }} />
          </div>
          <span className="v">{ship.hull}/{ship.hullMax}</span>
        </div>
        <div className="hud-status-row">
          <span className="k">Fuel</span>
          <div className={`bar ${tone(fuelPct) || 'ok'}`} aria-hidden="true">
            <div style={{ width: `${fuelPct}%` }} />
          </div>
          <span className="v">{ship.fuel}/{ship.fuelMax}</span>
        </div>
        <div className="hud-status-row">
          <span className="k">Cargo</span>
          <div className="bar" aria-hidden="true">
            <div style={{ width: `${cargoPct}%` }} />
          </div>
          <span className="v">{ship.cargo}/{ship.cargoMax}</span>
        </div>
      </div>

      <div className="hud-cell credits right">
        <span className="hud-label">Credits</span>
        <span className="hud-value">{game.player.credits.toLocaleString()}</span>
        <span className="hud-sub">Net {netWorth.toLocaleString()}</span>
      </div>

      <div className="hud-actions">
        <button
          className="ghost icon-only"
          onClick={() => setScreen('log')}
          aria-label="Captain's log"
          title="Captain's log"
        >
          <Icon name="log" size={18} />
        </button>
        <button
          className="ghost icon-only"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>
    </div>
  );
}
