import { useMemo, useState } from 'react';
import { changelog, type ChangelogChannel, type ChangelogRelease } from '../../engine/changelog';

interface Props {
  onClose: () => void;
}

const CHANNEL_TABS: { id: ChangelogChannel; label: string }[] = [
  { id: 'stable', label: 'Stable' },
  { id: 'alpha', label: 'Alpha' },
  { id: 'development', label: 'Development' },
];

/**
 * In-game changelog viewer. Reads `src/data/changelog.generated.json` (built
 * from CHANGELOG.md by scripts/parse-changelog.mjs). Channels are tabbed so
 * players see Stable / Alpha / Development separately.
 */
export function ChangelogModal({ onClose }: Props) {
  const initial = changelog.channel === 'unreleased' ? 'development' : changelog.channel;
  const [channel, setChannel] = useState<ChangelogChannel>(initial);

  const releases: ChangelogRelease[] = useMemo(
    () => changelog.releases.filter((release) => release.channel === channel),
    [channel],
  );

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Changelog">
      <div className="modal changelog-modal">
        <header className="changelog-header">
          <div>
            <div className="tiny muted">CHANGELOG</div>
            <div className="changelog-version">{changelog.currentVersion}</div>
          </div>
          <button className="muted" onClick={onClose} aria-label="Close changelog">Close</button>
        </header>

        <div className="changelog-tabs" role="tablist">
          {CHANNEL_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={channel === tab.id}
              className={channel === tab.id ? 'active' : ''}
              onClick={() => setChannel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="changelog-body">
          {releases.length === 0 ? (
            <div className="muted" style={{ padding: 16 }}>
              No releases on this channel yet.
            </div>
          ) : (
            releases.map((release) => (
              <article key={release.version} className="changelog-release">
                <header>
                  <div className="changelog-release-version">{release.version}</div>
                  {release.date ? (
                    <div className="changelog-release-date tiny muted">{release.date}</div>
                  ) : null}
                </header>
                {release.title ? (
                  <h3 className="changelog-release-title">{release.title}</h3>
                ) : null}
                {release.description ? (
                  <p className="changelog-release-description">{release.description}</p>
                ) : null}
                {release.categories.map((category) => (
                  <section key={category.id} className="changelog-category">
                    <h4>{category.label}</h4>
                    <ul>
                      {category.entries.map((entry, idx) => (
                        <li key={idx}>{entry}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
