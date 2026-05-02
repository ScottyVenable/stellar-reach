import { useMemo, useState } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, priceMultipliers } from '../../engine/game';
import { GOODS_BY_ID } from '../../data/goods';
import type { GoodCategory } from '../../engine/types';

const CATEGORIES: ('All' | GoodCategory)[] = [
  'All',
  'Foodstuffs',
  'Raw Materials',
  'Refined Goods',
  'Technology',
  'Medical',
  'Luxury',
  'Weapons',
  'Energy',
  'Biological',
  'Contraband',
  'Data',
  'Cultural',
];

export function MarketScreen() {
  const game = useGameStore((s) => s.game)!;
  const buy = useGameStore((s) => s.buy);
  const sell = useGameStore((s) => s.sell);
  const station = currentStation(game);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('All');
  const [units, setUnits] = useState<Record<string, number>>({});

  const muls = useMemo(() => priceMultipliers(game), [game]);

  if (!station) return <div>No station.</div>;

  const filtered = station.market.filter((entry) => {
    if (filter === 'All') return true;
    return GOODS_BY_ID[entry.goodId]?.category === filter;
  });

  const setU = (id: string, v: number) => setUnits((u) => ({ ...u, [id]: Math.max(1, Math.floor(v || 1)) }));

  return (
    <div>
      <div className="card">
        <div className="row spread">
          <h3 style={{ margin: 0 }}>Market</h3>
          <span className="tiny mono">
            BUY x{muls.buy.toFixed(2)} / SELL x{muls.sell.toFixed(2)}
          </span>
        </div>
        <div className="scroll-x" role="tablist" aria-label="Category filter">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              className={`chip ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 && <div className="muted">No goods in this category.</div>}
        {filtered.map((e) => {
          const good = GOODS_BY_ID[e.goodId];
          if (!good) return null;
          const have = game.player.ship.hold[e.goodId] ?? 0;
          const buyPrice = Math.max(1, Math.round(e.price * muls.buy));
          const sellPrice = Math.max(1, Math.round(e.price * muls.sell));
          const u = units[e.goodId] ?? 1;
          return (
            <div className="market-row" key={e.goodId}>
              <div>
                <div className="name">
                  {good.name}{' '}
                  <span className={`tag ${good.legality}`}>{good.legality}</span>
                </div>
                <div className="meta">
                  {good.category} | bulk {good.bulk} |{' '}
                  <span className="cyan">supply {e.supply}</span>{' '}
                  <span className="violet">demand {e.demand}</span>
                  {have > 0 && <> | <span className="amber">hold {have}</span></>}
                </div>
              </div>
              <div className="price">
                {buyPrice}
                <div className="tiny">sell {sellPrice}</div>
              </div>
              <div className="controls">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={u}
                  onChange={(ev) => setU(e.goodId, Number(ev.target.value))}
                  inputMode="numeric"
                  aria-label={`Units of ${good.name}`}
                />
                <button onClick={() => buy(e.goodId, u)} disabled={e.supply <= 0}>
                  Buy
                </button>
                <button onClick={() => sell(e.goodId, u)} disabled={have <= 0 || e.demand <= 0}>
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
