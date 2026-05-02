import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { Icon } from './Icon';
import { HudStrip } from './HudStrip';
import { useSfx } from '../hooks/useSfx';

interface Props {
  onOpenSettings: () => void;
}

function formatCreditsCompact(value: number): string {
  // On mobile we want a tighter representation that still feels like a
  // cockpit readout. We use a 6-digit pad and three-digit grouping; if
  // the value exceeds 999,999 we fall back to a "K"/"M" suffix.
  const v = Math.max(0, Math.floor(value));
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 100_000) return `${Math.floor(v / 1000)}K`;
  return String(v).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Top bar. On mobile this is a compact 3-region strip with: a station
 * eyebrow + name, a credits readout in tabular mono, and a quick-access
 * cluster (log + settings). On desktop CSS hides the .topbar-mobile
 * children and shows the embedded HudStrip instead.
 */
export function TopBar({ onOpenSettings }: Props) {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const sfx = useSfx();

  if (!game) return null;

  const station = currentStation(game);
  const system = currentSystem(game);

  return (
    <header className="topbar">
      <div className="topbar-mobile topbar-mobile-station">
        <div className="topbar-mobile-eyebrow">
          <span className="topbar-led" aria-hidden="true" />
          <span>STR/{String(game.player.day).padStart(3, '0')}</span>
          <span className="topbar-mobile-sep" aria-hidden="true">·</span>
          <span>{system?.region ?? '—'}</span>
        </div>
        <div className="topbar-mobile-name">{station?.name ?? 'Unknown'}</div>
      </div>
      <div className="topbar-mobile topbar-mobile-credits">
        <span className="topbar-mobile-credits-label">CR</span>
        <span className="topbar-mobile-credits-val">
          {formatCreditsCompact(game.player.credits)}
        </span>
      </div>
      <div className="topbar-mobile topbar-mobile-actions">
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

      {/* Desktop HUD strip — CSS shows this only at >= 960px. */}
      <HudStrip onOpenSettings={onOpenSettings} />
    </header>
  );
}
