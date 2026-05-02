import { useGameStore, type Screen } from '../../state/store';
import { Icon } from './Icon';
import { useSfx } from '../hooks/useSfx';

type IconName = 'market' | 'ship' | 'crew' | 'helm' | 'news' | 'jobs' | 'log';

interface Props {
  tabs: { id: Screen; label: string; icon: IconName }[];
}

/**
 * Primary navigation. Renders a row of console buttons. The same markup
 * is reshaped by CSS into:
 *   - a fixed bottom bar on mobile (icons stacked over labels)
 *   - a vertical rail on desktop (icons + labels + Fn key hints)
 *
 * Each button has explicit elements for the active-state bracket and
 * the scanline glow so the CSS can target them without ::before/::after
 * collisions. The SFX hook is wired here for the future audio pass.
 */
export function TabBar({ tabs }: Props) {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const sfx = useSfx();

  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((t, idx) => {
        const isActive = screen === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className={`console-btn${isActive ? ' active' : ''}`}
            onClick={() => {
              if (!isActive) sfx('ui-tab');
              setScreen(t.id);
            }}
            aria-current={isActive ? 'page' : undefined}
            data-screen={t.id}
          >
            <span className="console-btn-bracket" aria-hidden="true" />
            <span className="console-btn-icon" aria-hidden="true">
              <Icon name={t.icon} size={20} />
            </span>
            <span className="console-btn-label">{t.label}</span>
            <span className="console-key" aria-hidden="true">F{idx + 1}</span>
            <span className="console-btn-scanline" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
