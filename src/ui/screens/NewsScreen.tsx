import { useGameStore } from '../../state/store';
import { GOODS_BY_ID } from '../../data/goods';

export function NewsScreen() {
  const game = useGameStore((s) => s.game)!;
  const items = [...game.news].sort((a, b) => b.day - a.day);

  return (
    <div>
      <div className="card">
        <h3>Galactic News Feed</h3>
        {items.length === 0 && <div className="muted">All quiet across the reach.</div>}
        {items.map((n) => {
          const sys = n.systemId ? game.galaxy.systems.find((s) => s.id === n.systemId) : undefined;
          const good = n.goodId ? GOODS_BY_ID[n.goodId] : undefined;
          const sign = n.priceDelta > 0 ? '+' : '';
          return (
            <div key={n.id} className="card" style={{ background: 'var(--bg-2)' }}>
              <div className="tiny">D{n.day}{sys ? ` | ${sys.name}` : ''}</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{n.headline}</div>
              <div className="muted" style={{ marginTop: 4 }}>{n.body}</div>
              <div className="tiny" style={{ marginTop: 6 }}>
                Effect: <span className={n.priceDelta > 0 ? 'red' : 'green'}>
                  {sign}{Math.round(n.priceDelta * 100)}%
                </span>{' '}
                on {good ? good.name : n.category} | decays in {n.duration}d
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
