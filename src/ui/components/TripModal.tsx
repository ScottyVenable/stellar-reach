import { useGameStore } from '../../state/store';
import { effectiveSkill } from '../../engine/crew';

export function TripModal() {
  const game = useGameStore((s) => s.game)!;
  const trip = useGameStore((s) => s.trip)!;
  const lastResolution = useGameStore((s) => s.lastResolution);
  const resolveChoice = useGameStore((s) => s.resolveChoice);
  const finishTrip = useGameStore((s) => s.finishTrip);

  const next = game.pendingEvents[0];
  const dest = game.galaxy.systems.flatMap((sys) => sys.stations).find((s) => s.id === trip.toStationId);

  return (
    <div className="modal-backdrop" role="dialog" aria-label="Transit">
      <div className="modal">
        <div className="tiny">Transit | {trip.safety.toUpperCase()} ROUTE</div>
        <h2 style={{ margin: '4px 0 12px', color: 'var(--accent-cyan)' }}>
          En route to {dest?.name}
        </h2>

        {lastResolution && (
          <div className={`notice ${lastResolution.success ? '' : 'bad'}`} style={{ marginBottom: 12 }}>
            <div className="tiny">{lastResolution.success ? 'SUCCESS' : 'FAILURE'} | roll {lastResolution.roll} (total {lastResolution.total})</div>
            <div>{lastResolution.text}</div>
          </div>
        )}

        {next ? (
          <div>
            <div className="card" style={{ background: 'var(--bg-2)' }}>
              <h3>{next.title}</h3>
              <div>{next.description}</div>
            </div>
            {next.choices.map((c) => {
              const tester = c.testRole
                ? game.player.crew.filter((m) => !m.resting && m.role === c.testRole).sort((a, b) => effectiveSkill(b) - effectiveSkill(a))[0]
                : null;
              return (
                <button
                  key={c.id}
                  className="choice-card"
                  style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  onClick={() => resolveChoice(next, c)}
                >
                  <div className="label">{c.label}</div>
                  <div className="meta">
                    {c.testRole
                      ? tester
                        ? `${c.testRole} | ${tester.name} (skill ${effectiveSkill(tester)}) vs DC ${c.dc}`
                        : `${c.testRole} | no qualified crew (rolling unmodified) vs DC ${c.dc}`
                      : 'Automatic'}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="notice">All transit events resolved. Dock when ready.</div>
            <button className="primary" style={{ width: '100%', marginTop: 12 }} onClick={finishTrip}>
              Dock at {dest?.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
