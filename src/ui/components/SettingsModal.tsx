import { useEffect } from 'react';
import { useGameStore, FONT_SCALE_OPTIONS, DENSITY_OPTIONS, MOTION_OPTIONS } from '../../state/store';
import { Icon } from './Icon';

interface Props {
  onClose: () => void;
}

/**
 * Settings modal. Three controls today, all UI-only:
 *   - Font scale (small / standard / large)
 *   - Density   (compact / comfortable)
 *   - Motion    (system / reduce / full)
 *
 * The values are pushed onto <html> via dataset/style by the App shell
 * so plain CSS selectors can react to them.
 */
export function SettingsModal({ onClose }: Props) {
  const settings = useGameStore((s) => s.settings);
  const setSetting = useGameStore((s) => s.setSetting);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="row spread" style={{ marginBottom: 4 }}>
          <h2 id="settings-title">Settings · FN09</h2>
          <button
            className="ghost icon-only"
            onClick={onClose}
            aria-label="Close settings"
            title="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="settings-grid">
          <div className="settings-row">
            <span className="settings-label">Font scale</span>
            <span className="settings-help">Adjust readability without zooming the whole page.</span>
            <div className="settings-segments" role="group" aria-label="Font scale">
              {FONT_SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  aria-pressed={settings.fontScale === opt.value}
                  className={settings.fontScale === opt.value ? 'active' : ''}
                  onClick={() => setSetting('fontScale', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">Density</span>
            <span className="settings-help">Tighten or relax the space between rows.</span>
            <div className="settings-segments" role="group" aria-label="Density">
              {DENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  aria-pressed={settings.density === opt.value}
                  className={settings.density === opt.value ? 'active' : ''}
                  onClick={() => setSetting('density', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">Motion</span>
            <span className="settings-help">
              System matches your OS preference. Reduce disables HUD flickers and screen fades.
            </span>
            <div className="settings-segments" role="group" aria-label="Motion">
              {MOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  aria-pressed={settings.motion === opt.value}
                  className={settings.motion === opt.value ? 'active' : ''}
                  onClick={() => setSetting('motion', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
