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
import { RightRail } from './components/RightRail';
import { SettingsModal } from './components/SettingsModal';
import { Breadcrumb } from './components/Breadcrumb';

type IconName = 'market' | 'ship' | 'crew' | 'helm' | 'news' | 'jobs' | 'log';

interface ScreenMeta {
  id: Screen;
  label: string;
  icon: IconName;
  section: string;
  help: string;
  tag: string;
}

const SCREENS: ScreenMeta[] = [
  { id: 'market', label: 'Market', icon: 'market', section: 'MARKET',
    help: 'Buy low, sell high. Watch the legality column.', tag: 'FN03' },
  { id: 'ship', label: 'Ship', icon: 'ship', section: 'SHIP',
    help: 'Refuel, repair, install modules.', tag: 'FN04' },
  { id: 'crew', label: 'Crew', icon: 'crew', section: 'CREW',
    help: 'Hire, dismiss, manage shifts.', tag: 'FN06' },
  { id: 'helm', label: 'Helm', icon: 'helm', section: 'HELM',
    help: 'Plot a route, choose a profile, depart.', tag: 'FN07' },
  { id: 'news', label: 'News', icon: 'news', section: 'COMMS',
    help: 'Wire stories that move the markets.', tag: 'FN05' },
  { id: 'missions', label: 'Jobs', icon: 'jobs', section: 'JOBS',
    help: 'Contracts, courier runs, and bounties.', tag: 'FN08' },
];

const LOG_META: ScreenMeta = {
  id: 'log',
  label: 'Log',
  icon: 'log',
  section: 'LOG',
  help: "Captain's recorded entries, latest first.",
  tag: 'FN10',
};

const SCREEN_LABELS = SCREENS.map(({ id, label, icon }) => ({ id, label, icon }));

export function App() {
  const game = useGameStore((s) => s.game);
  const screen = useGameStore((s) => s.screen);
  const trip = useGameStore((s) => s.trip);
  const settings = useGameStore((s) => s.settings);
  const loadIfPresent = useGameStore((s) => s.loadIfPresent);
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadIfPresent();
    setHydrated(true);
  }, [loadIfPresent]);

  // Apply UI settings to the document root so plain CSS selectors react.
  // Font scale is a CSS custom property; density and motion are data
  // attributes. 'system' for motion means hand off to the OS preference.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ui-font-scale', String(settings.fontScale));
    root.dataset.density = settings.density;
    if (settings.motion === 'system') {
      delete root.dataset.motion;
    } else {
      root.dataset.motion = settings.motion;
    }
  }, [settings]);

  if (!hydrated) return null;
  if (!game) {
    return (
      <>
        <TitleScreen />
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </>
    );
  }

  const meta = screen === 'log' ? LOG_META : SCREENS.find((s) => s.id === screen) ?? SCREENS[0];

  return (
    <div className="app">
      <div className="corner-accent corner-tl" aria-hidden="true" />
      <div className="corner-accent corner-tr" aria-hidden="true" />
      <div className="corner-accent corner-bl" aria-hidden="true" />
      <div className="corner-accent corner-br" aria-hidden="true" />
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <TabBar tabs={SCREEN_LABELS} />
      <main className="screen">
        <div className="viewport">
          <div className="viewport-frame screen-anim" key={screen}>
            <span className="vp-corner-bl" aria-hidden="true" />
            <span className="vp-corner-br" aria-hidden="true" />
            <Breadcrumb section={meta.section} help={meta.help} tag={meta.tag} />
            {screen === 'market' && <MarketScreen />}
            {screen === 'ship' && <ShipScreen />}
            {screen === 'crew' && <CrewScreen />}
            {screen === 'helm' && <HelmScreen />}
            {screen === 'news' && <NewsScreen />}
            {screen === 'missions' && <MissionsScreen />}
            {screen === 'log' && <LogScreen />}
          </div>
        </div>
      </main>
      <RightRail />
      {trip && <TripModal />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
