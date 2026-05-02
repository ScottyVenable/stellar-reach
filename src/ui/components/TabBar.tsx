import { useGameStore, type Screen } from '../../state/store';
import { Icon } from './Icon';

type IconName = 'market' | 'ship' | 'crew' | 'helm' | 'news' | 'jobs' | 'log';

interface Props {
  tabs: { id: Screen; label: string; icon: IconName }[];
}

/**
 * Primary navigation. Renders a row of console buttons. The same markup
 * is reshaped by CSS into:
 *   - a fixed bottom bar on mobile (icons stacked over labels)
 *   - a vertical rail on desktop (icons + labels + Fn key hints)
 */
export function TabBar({ tabs }: Props) {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((t, idx) => (
        <button
          key={t.id}
          className={`console-btn${screen === t.id ? ' active' : ''}`}
          onClick={() => setScreen(t.id)}
          aria-current={screen === t.id ? 'page' : undefined}
        >
          <Icon name={t.icon} size={20} />
          <span>{t.label}</span>
          <span className="console-key" aria-hidden="true">F{idx + 1}</span>
        </button>
      ))}
    </nav>
  );
}
