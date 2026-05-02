import { useGameStore, type Screen } from '../../state/store';

interface Props {
  tabs: { id: Screen; label: string }[];
}

export function TabBar({ tabs }: Props) {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={screen === t.id ? 'active' : ''}
          onClick={() => setScreen(t.id)}
          aria-current={screen === t.id ? 'page' : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
