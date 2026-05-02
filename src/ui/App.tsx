import { useEffect, useState } from 'react';
import { useGameStore, type Screen } from '../state/store';
import { TitleScreen } from './screens/TitleScreen';
import { MarketScreen } from './screens/MarketScreen';
import { ShipScreen } from './screens/ShipScreen';
import { CrewScreen } from './screens/CrewScreen';
import { HelmScreen } from './screens/HelmScreen';
import { NewsScreen } from './screens/NewsScreen';
import { MissionsScreen } from './screens/MissionsScreen';
import { LogScreen } from './screens/LogScreen';
import { TripModal } from './components/TripModal';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';

const SCREEN_LABELS: { id: Screen; label: string }[] = [
  { id: 'market', label: 'Market' },
  { id: 'ship', label: 'Ship' },
  { id: 'crew', label: 'Crew' },
  { id: 'helm', label: 'Helm' },
  { id: 'news', label: 'News' },
  { id: 'missions', label: 'Jobs' },
];

export function App() {
  const game = useGameStore((s) => s.game);
  const screen = useGameStore((s) => s.screen);
  const trip = useGameStore((s) => s.trip);
  const loadIfPresent = useGameStore((s) => s.loadIfPresent);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadIfPresent();
    setHydrated(true);
  }, [loadIfPresent]);

  if (!hydrated) return null;
  if (!game) return <TitleScreen />;

  return (
    <div className="app">
      <TopBar />
      <main className="screen">
        {screen === 'market' && <MarketScreen />}
        {screen === 'ship' && <ShipScreen />}
        {screen === 'crew' && <CrewScreen />}
        {screen === 'helm' && <HelmScreen />}
        {screen === 'news' && <NewsScreen />}
        {screen === 'missions' && <MissionsScreen />}
        {screen === 'log' && <LogScreen />}
      </main>
      <TabBar tabs={SCREEN_LABELS} />
      {trip && <TripModal />}
    </div>
  );
}
