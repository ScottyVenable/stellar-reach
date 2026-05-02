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

  const ship = game.player.ship;
  const freeCargoUnits = (slot: number) => Math.floor((ship.cargoMax - ship.cargo) / slot);

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
          const have = ship.hold[e.goodId] ?? 0;
          const buyPrice = Math.max(1, Math.round(e.price * muls.buy));
          const sellPrice = Math.max(1, Math.round(e.price * muls.sell));
          const u = units[e.goodId] ?? 1;

          // Price trend vs galactic base price
          const delta = e.price - good.basePrice;
          const pct = good.basePrice > 0 ? (delta / good.basePrice) * 100 : 0;
          const trendLabel = Math.abs(pct) < 3 ? '=' : pct > 0 ? `▲${Math.abs(pct).toFixed(0)}%` : `▼${Math.abs(pct).toFixed(0)}%`;
          const trendClass = Math.abs(pct) < 3 ? 'muted' : pct > 0 ? 'amber' : 'cyan';

          // Max amounts for convenience buttons
          const maxBuy = Math.min(
            Math.floor(game.player.credits / Math.max(1, buyPrice)),
            freeCargoUnits(good.bulk),
            e.supply,
          );
          const maxSell = Math.min(have, e.demand);

          return (
            <div className="market-row" key={e.goodId}>
              <div>
                <div className="name">
                  {good.name}{' '}
                  <span className={`tag ${good.legality}`}>{good.legality}</span>
                  {' '}
                  <span className={`tiny ${trendClass}`}>{trendLabel}</span>
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
                <button onClick={() => buy(e.goodId, u)} disabled={e.supply <= 0 || maxBuy <= 0}>
                  Buy
                </button>
                <button
                  className="tiny"
                  onClick={() => { if (maxBuy > 0) buy(e.goodId, maxBuy); }}
                  disabled={maxBuy <= 0}
                  title={`Buy max affordable (${maxBuy})`}
                >
                  Max
                </button>
                <button onClick={() => sell(e.goodId, u)} disabled={have <= 0 || e.demand <= 0}>
                  Sell
                </button>
                {have > 0 && (
                  <button
                    className="tiny"
                    onClick={() => { if (maxSell > 0) sell(e.goodId, maxSell); }}
                    disabled={maxSell <= 0}
                    title={`Sell all (${maxSell})`}
                  >
                    All
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
