import { useState } from 'react';
import { useGameStore } from '../../state/store';
import { generateSeedString } from '../../engine/rng';
import { changelog } from '../../engine/changelog';
import { ChangelogModal } from '../components/ChangelogModal';

export function TitleScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const [seed, setSeed] = useState<string>(() => generateSeedString());
  const [name, setName] = useState<string>('Captain Ren');
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="title-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="sub">Sci-Fi Trading Sim</div>
        <h1>STELLAR REACH</h1>
        <div className="muted" style={{ marginTop: 8, maxWidth: 320 }}>
          Captain a starship across a procedurally generated galaxy. Trade goods, manage your crew,
          and survive the void.
        </div>
      </div>
      <div className="card" style={{ width: '100%', maxWidth: 360 }}>
        <h3>New Campaign</h3>
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
          <button onClick={() => setSeed(generateSeedString())}>Reroll</button>
        </div>
      </div>
      <div className="actions">
        <button className="primary" onClick={() => startNewGame(seed.trim() || generateSeedString(), name.trim() || 'Captain')}>
          Launch Campaign
        </button>
      </div>
      <button
        type="button"
        className="version-chip"
        onClick={() => setShowChangelog(true)}
        aria-label="Open changelog"
        title="View changelog"
      >
        v{changelog.currentVersion}
      </button>
      {showChangelog ? <ChangelogModal onClose={() => setShowChangelog(false)} /> : null}
    </div>
  );
}
