import { useGameStore } from '../../state/store';
import { CREW_TRAITS_BY_ID } from '../../data/traits';
import { RACES_BY_ID } from '../../data/races';
import type { CrewMember } from '../../engine/types';
import { PanelHeader } from '../components/PanelHeader';

function CrewRow({ member, action, actionLabel, actionDisabled, secondary, secondaryLabel }: {
  member: CrewMember;
  action?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  secondary?: () => void;
  secondaryLabel?: string;
}) {
  const race = RACES_BY_ID[member.raceId];
  return (
    <div className="crew-card">
      <div>
        <div className="name">
          {member.name}{' '}
          <span className={`energy-${member.energy}`}>{member.energy}</span>
        </div>
        <div className="role">
          {member.role} | skill {member.skill} | {race?.adjective ?? 'Unknown'}
          {member.resting && <span className="amber"> | resting</span>}
        </div>
        <div className="tiny" style={{ marginTop: 4 }}>
          stress {Math.round(member.stress)} / wage {member.wage}cr
        </div>
        <div className="row wrap" style={{ gap: 4, marginTop: 6 }}>
          {member.traitIds.map((tid) => {
            const t = CREW_TRAITS_BY_ID[tid];
            return t ? (
              <span key={tid} className="tag" title={t.description}>{t.name}</span>
            ) : null;
          })}
        </div>
      </div>
      <div className="row" style={{ flexDirection: 'column', gap: 6 }}>
        {action && (
          <button onClick={action} disabled={actionDisabled}>
            {actionLabel}
          </button>
        )}
        {secondary && (
          <button className="muted" onClick={secondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function CrewScreen() {
  const game = useGameStore((s) => s.game)!;
  const hireCrew = useGameStore((s) => s.hireCrew);
  const dismissCrew = useGameStore((s) => s.dismissCrew);
  const toggleRest = useGameStore((s) => s.toggleRest);

  return (
    <div>
      <div className="card">
        <PanelHeader
          tag="CREW"
          code="FN02"
          status="ok"
          rightSlot={`${game.player.crew.length}/8 ACTIVE`}
        />
        {game.player.crew.length === 0 && <div className="muted">You fly alone.</div>}
        {game.player.crew.map((m) => (
          <CrewRow
            key={m.id}
            member={m}
            action={() => toggleRest(m.id)}
            actionLabel={m.resting ? 'Wake up' : 'Rest'}
            secondary={() => dismissCrew(m.id)}
            secondaryLabel="Dismiss"
          />
        ))}
      </div>

      <div className="card">
        <PanelHeader tag="ROSTER" code="FN02B" status="ok" rightSlot="LOCAL PORT" />
        {game.hireRoster.length === 0 && <div className="muted">No-one is looking for a berth here.</div>}
        {game.hireRoster.map((m) => {
          const fee = m.wage * 5;
          const canAfford = game.player.credits >= fee;
          const full = game.player.crew.length >= 8;
          return (
            <CrewRow
              key={m.id}
              member={m}
              action={() => hireCrew(m.id)}
              actionLabel={`Hire (${fee}cr)`}
              actionDisabled={!canAfford || full}
            />
          );
        })}
      </div>
    </div>
  );
}
