import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { GOODS_BY_ID } from '../../data/goods';
import { PanelHeader } from './PanelHeader';

/**
 * Right-rail status panel rendered on desktop layouts (>= 960px). The
 * HudStrip up top covers credits / hull / fuel / cargo, so this rail is
 * free to focus on:
 *   - Callsign block (current station + system + race)
 *   - News ticker (last few headlines, latest first)
 *   - Trade hold contents (top items)
 */
export function RightRail() {
  const game = useGameStore((s) => s.game);
  if (!game) return null;
  const station = currentStation(game);
  const system = currentSystem(game);
  const race = station ? RACES_BY_ID[station.raceId] : undefined;
  const ship = game.player.ship;

  // Surface up to 4 most recent news items, newest first. If the news log
  // is empty we hide the panel entirely rather than showing an empty box.
  const news = [...game.news].sort((a, b) => b.day - a.day).slice(0, 4);

  // Top hold items by units, capped at 4. Cargo hold is a Record<id, units>
  // so we sort by value.
  const hold = Object.entries(ship.hold)
    .filter(([, units]) => units > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <aside className="rightrail" aria-label="Status summary">
      <div className="card">
        <PanelHeader tag="CALLSIGN" code="FN01" status="ok" />
        <div className="rightrail-name cyan">{station?.name ?? 'Unknown'}</div>
        <div className="tiny" style={{ marginTop: 4 }}>
          {system?.name} · {system?.region}
        </div>
        <div className="tiny" style={{ marginTop: 2 }}>
          {station?.kind} · {race?.adjective ?? '—'}
        </div>
      </div>

      {hold.length > 0 ? (
        <div className="card">
          <PanelHeader
            tag="HOLD"
            code="FN02"
            status="ok"
            rightSlot={`${ship.cargo}/${ship.cargoMax}`}
          />
          <div className="kv">
            {hold.map(([gid, units]) => (
              <RowItem
                key={gid}
                k={GOODS_BY_ID[gid]?.name ?? gid}
                v={String(units)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {news.length > 0 ? (
        <div className="card">
          <PanelHeader tag="WIRE" code="FN05" status="ok" />
          <div className="rail-news">
            {news.map((n) => (
              <div key={n.id} className="rail-news-item">
                <div>{n.headline}</div>
                <div className="meta">D{String(n.day).padStart(3, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

/** Tiny wrapper so the kv markup stays in one place. */
function RowItem({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </>
  );
}
