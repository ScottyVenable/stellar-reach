import { useMemo } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { Icon } from './Icon';
import { StatusReadout } from './StatusBar';
import { useSfx } from '../hooks/useSfx';

interface Props {
  onOpenSettings: () => void;
}

/**
 * Format a credit value as "00 005 000" with three-digit groups so the
 * HUD readout has a tabular cockpit feel. We keep the digit width fixed
 * so values don't dance as numbers grow during a session.
 */
function formatCredits(value: number): string {
  const padded = String(Math.max(0, Math.floor(value))).padStart(8, '0');
  return padded.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Desktop HUD strip — the instrument row across the top of the bridge
 * layout. Visible on viewports >= 960px; hidden on mobile in favour of
 * the compact .topbar grid.
 *
 * Composition (left to right):
 *   - Brand cell (game name, build channel, OS line)
 *   - Stardate cell with frame number + sector
 *   - Callsign cell (station + class + race)
 *   - Vessel status — segmented bars for hull/fuel/cargo
 *   - Credits cell — grouped tabular digits + currency glyph
 *   - Action cluster — log + settings ghost buttons
 */
export function HudStrip({ onOpenSettings }: Props) {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const sfx = useSfx();

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

  return (
    <div className="hud-strip" role="group" aria-label="Bridge instrument cluster">
      <div className="hud-cell brand" data-cut="left">
        <span className="hud-label">
          <span className="hud-led" aria-hidden="true" />
          Stellar Reach
        </span>
        <span className="hud-value">Bridge Console</span>
        <span className="hud-sub">OS-09 / FN-HUD-001</span>
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

      <div className="hud-cell vessel">
        <span className="hud-label">Vessel</span>
        <div className="hud-readouts">
          <StatusReadout label="HUL" glyph="◇" value={ship.hull} max={ship.hullMax} tone="hull" />
          <StatusReadout label="FUL" glyph="∆" value={ship.fuel} max={ship.fuelMax} tone="fuel" />
          <StatusReadout label="CRG" glyph="□" value={ship.cargo} max={ship.cargoMax} tone="cargo" />
        </div>
      </div>

      <div className="hud-cell credits right" data-cut="right">
        <span className="hud-label">Credits</span>
        <span className="hud-value">
          <span className="hud-currency" aria-hidden="true">¤</span>
          <span>{formatCredits(game.player.credits)}</span>
        </span>
        <span className="hud-sub">Net {formatCredits(netWorth)}</span>
      </div>

      <div className="hud-actions">
        <button
          className="ghost icon-only"
          onClick={() => {
            sfx('ui-press');
            setScreen('log');
          }}
          aria-label="Captain's log"
          title="Captain's log"
        >
          <Icon name="log" size={18} />
        </button>
        <button
          className="ghost icon-only"
          onClick={() => {
            sfx('ui-press');
            onOpenSettings();
          }}
          aria-label="Settings"
          title="Settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>
    </div>
  );
}
