import { useState } from 'react';
import { useGameStore } from '../../state/store';
import { generateSeedString } from '../../engine/rng';
import { changelog } from '../../engine/changelog';
import { ChangelogModal } from '../components/ChangelogModal';
import { SettingsModal } from '../components/SettingsModal';
import { Starfield } from '../components/Starfield';
import { useSfx } from '../hooks/useSfx';

const CHANNEL = (() => {
  const v = changelog.currentVersion ?? '';
  if (v.includes('-alpha')) return 'ALPHA';
  if (v.includes('-dev')) return 'DEV';
  return 'STABLE';
})();

const isElectron =
  typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent || '');

export function TitleScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const sfx = useSfx();
  const [seed, setSeed] = useState<string>(() => generateSeedString());
  const [name, setName] = useState<string>('Captain Ren');
  const [showChangelog, setShowChangelog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);

  const launch = () => {
    sfx('ui-confirm');
    startNewGame(seed.trim() || generateSeedString(), name.trim() || 'Captain');
  };

  return (
    <div className="title-screen">
      <Starfield />
      <div className="title-vignette" aria-hidden="true" />

      <header className="title-brand">
        <div className="title-eyebrow">
          <span className="title-eyebrow-mark" aria-hidden="true" />
          <span>BRIDGE CONSOLE / OS-09</span>
          <span className="title-eyebrow-mark" aria-hidden="true" />
        </div>
        <h1 className="title-display">
          <span>STELLAR</span>
          <span className="title-display-spacer" aria-hidden="true" />
          <span>REACH</span>
        </h1>
        <div className="title-tagline">A SCI-FI TRADING SIMULATION</div>
      </header>

      {showCampaign ? (
        <section className="title-card" aria-label="New campaign">
          <div className="title-card-header">
            <span className="title-card-strip" />
            <span>NEW VOYAGE / FN-CAP-001</span>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowCampaign(false)}
              style={{ marginLeft: 'auto' }}
            >
              Back
            </button>
          </div>
          <label className="tiny" htmlFor="captain-name">Captain Name</label>
          <input
            id="captain-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <label className="tiny" htmlFor="seed">Galaxy Seed</label>
          <div className="row">
            <input
              id="seed"
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value.toUpperCase())}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                sfx('ui-press');
                setSeed(generateSeedString());
              }}
            >
              Reroll
            </button>
          </div>
          <button
            type="button"
            className="primary"
            onClick={launch}
            style={{ width: '100%', marginTop: 14, minHeight: 56 }}
          >
            Launch Campaign
          </button>
        </section>
      ) : (
        <nav className="title-actions" aria-label="Title actions">
          <button
            type="button"
            className="title-action primary"
            onClick={() => {
              sfx('ui-press');
              setShowCampaign(true);
            }}
          >
            <span className="title-action-glyph" aria-hidden="true">▸</span>
            <span className="title-action-label">New Voyage</span>
            <span className="title-action-key">F1</span>
          </button>
          <button
            type="button"
            className="title-action"
            onClick={() => {
              sfx('ui-press');
              setShowChangelog(true);
            }}
          >
            <span className="title-action-glyph" aria-hidden="true">▸</span>
            <span className="title-action-label">Patch Notes</span>
            <span className="title-action-key">F2</span>
          </button>
          <button
            type="button"
            className="title-action"
            onClick={() => {
              sfx('ui-press');
              setShowSettings(true);
            }}
          >
            <span className="title-action-glyph" aria-hidden="true">▸</span>
            <span className="title-action-label">Settings</span>
            <span className="title-action-key">F3</span>
          </button>
          {isElectron ? (
            <button
              type="button"
              className="title-action danger"
              onClick={() => {
                sfx('ui-deny');
                window.close();
              }}
            >
              <span className="title-action-glyph" aria-hidden="true">▸</span>
              <span className="title-action-label">Quit</span>
              <span className="title-action-key">F4</span>
            </button>
          ) : null}
        </nav>
      )}

      <footer className="title-footer">
        <button
          type="button"
          className="version-chip"
          onClick={() => setShowChangelog(true)}
          aria-label="Open changelog"
          title="View changelog"
        >
          <span className={`version-channel ch-${CHANNEL.toLowerCase()}`}>{CHANNEL}</span>
          <span className="version-num">v{changelog.currentVersion}</span>
        </button>
        <div className="title-system-status" aria-live="polite">
          <span className="status-dot" />
          <span>SYSTEMS NOMINAL</span>
        </div>
      </footer>

      {showChangelog ? <ChangelogModal onClose={() => setShowChangelog(false)} /> : null}
      {showSettings ? <SettingsModal onClose={() => setShowSettings(false)} /> : null}
    </div>
  );
}
