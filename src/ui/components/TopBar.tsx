import { useMemo } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { Icon } from './Icon';
import { HudStrip } from './HudStrip';

interface Props {
  onOpenSettings: () => void;
}

/**
 * Top bar. On mobile this is a compact 3-cell grid (log button, station
 * label, credits + day). On desktop CSS hides the .topbar-mobile children
 * and shows the embedded <HudStrip /> instead, so the same component
 * drives both shapes.
 */
export function TopBar({ onOpenSettings }: Props) {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);

  const station = game ? currentStation(game) : undefined;
  const system = game ? currentSystem(game) : undefined;
  const race = station ? RACES_BY_ID[station.raceId] : undefined;

  const netWorth = useMemo(() => {
    if (!game) return 0;
    let total = game.player.credits;
    if (station) {
      for (const [gid, units] of Object.entries(game.player.ship.hold)) {
        const e = station.market.find((m) => m.goodId === gid);
        if (e) total += e.price * units;
      }
    }
    return total;
  }, [game, station]);

  if (!game) return null;

  return (
    <header className="topbar">
      <div className="topbar-mobile" style={{ display: 'flex', gap: 6 }}>
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
      <div className="topbar-mobile station">
        <div className="name">{station?.name ?? 'Unknown'}</div>
        <div className="sub">
          {system?.name} · {system?.region} · {race?.adjective}
        </div>
      </div>
      <div className="topbar-mobile">
        <div className="day">D{String(game.player.day).padStart(3, '0')}</div>
        <div className="credits">
          <span className="label">CR</span>
          {game.player.credits.toLocaleString()}
        </div>
        <div className="tiny muted" style={{ textAlign: 'right' }}>
          NET {netWorth.toLocaleString()}
        </div>
      </div>

      {/* Desktop HUD strip — CSS shows this only at >= 960px. */}
      <HudStrip onOpenSettings={onOpenSettings} />
    </header>
  );
}
