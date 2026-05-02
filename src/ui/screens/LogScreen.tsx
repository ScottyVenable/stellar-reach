import { useGameStore } from '../../state/store';
import { PanelHeader } from '../components/PanelHeader';

export function LogScreen() {
  const game = useGameStore((s) => s.game)!;
  const resetGame = useGameStore((s) => s.resetGame);
  const entries = [...game.log].reverse();

  return (
    <div>
      <div className="card">
        <PanelHeader tag="LOG" code="FN07" status="ok" rightSlot={`D${String(game.player.day).padStart(3, '0')}`} />
        <div className="tiny">Galaxy seed: <span className="mono cyan">{game.galaxy.seed}</span></div>
        <div className="tiny">Captain: {game.player.captainName}</div>
        <div className="divider" />
        {entries.map((e, i) => (
          <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="tiny mono">D{e.day}</span> {e.text}
          </div>
        ))}
      </div>
      <div className="card">
        <PanelHeader tag="DANGER" code="FN99" status="alert" />
        <button
          className="danger"
          onClick={() => {
            if (window.confirm('Abandon this campaign and start over? This deletes the save.')) {
              resetGame();
            }
          }}
        >
          Abandon Campaign
        </button>
      </div>
    </div>
  );
}
