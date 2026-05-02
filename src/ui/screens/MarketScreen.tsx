import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, priceMultipliers } from '../../engine/game';
import { GOODS_BY_ID } from '../../data/goods';
import type { GoodCategory } from '../../engine/types';
import { PanelHeader } from '../components/PanelHeader';

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

/** Percentage deviation from galactic base price below which the trend is shown as neutral. */
const PRICE_TREND_THRESHOLD = 3;
const HOLD_START_DELAY_MS = 320;
const HOLD_MIN_DELAY_MS = 55;
const HOLD_ACCELERATION = 0.78;

function useRepeatingPress(onStep: () => void) {
  const onStepRef = useRef(onStep);
  const timerRef = useRef<number | null>(null);
  const delayRef = useRef(HOLD_START_DELAY_MS);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    delayRef.current = HOLD_START_DELAY_MS;
  }, []);

  const schedule = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      onStepRef.current();
      delayRef.current = Math.max(HOLD_MIN_DELAY_MS, delayRef.current * HOLD_ACCELERATION);
      schedule();
    }, delayRef.current);
  }, []);

  const start = useCallback(() => {
    stop();
    schedule();
  }, [schedule, stop]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}

interface QuantityControlProps {
  label: string;
  value: number;
  max: number;
  onChange(value: number): void;
}

function QuantityControl({ label, value, max, onChange }: QuantityControlProps) {
  const clamp = useCallback((next: number) => Math.max(1, Math.min(max, Math.floor(next || 1))), [max]);
  const stepDown = useCallback(() => onChange(clamp(value - 1)), [clamp, onChange, value]);
  const stepUp = useCallback(() => onChange(clamp(value + 1)), [clamp, onChange, value]);
  const decPress = useRepeatingPress(stepDown);
  const incPress = useRepeatingPress(stepUp);

  return (
    <div className="qty-control" aria-label={label}>
      <HoldButton label="Decrease units" onClick={stepDown} hold={decPress}>-</HoldButton>
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(ev) => onChange(clamp(Number(ev.target.value)))}
        inputMode="numeric"
        aria-label={label}
      />
      <HoldButton label="Increase units" onClick={stepUp} hold={incPress}>+</HoldButton>
      <button type="button" className="tiny qty-max" onClick={() => onChange(max)} disabled={max <= 1}>
        Max
      </button>
    </div>
  );
}

function HoldButton({
  children,
  label,
  onClick,
  hold,
}: {
  children: string;
  label: string;
  onClick(): void;
  hold: ReturnType<typeof useRepeatingPress>;
}) {
  return (
    <button
      type="button"
      className="qty-step"
      onClick={onClick}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        hold.start();
      }}
      onPointerUp={hold.stop}
      onPointerCancel={hold.stop}
      onPointerLeave={hold.stop}
      onBlur={hold.stop}
      aria-label={label}
    >
      {children}
    </button>
  );
}

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
  const cargoFree = Math.max(0, ship.cargoMax - ship.cargo);

  return (
    <div>
      <div className="card">
        <PanelHeader
          tag="MARKET"
          code="FN03"
          status="ok"
          rightSlot={`BUY x${muls.buy.toFixed(2)} / SELL x${muls.sell.toFixed(2)}`}
        />
        <div className="market-flow-summary" aria-label="Current trade status">
          <span>{station.name}</span>
          <span>Cargo {ship.cargo}/{ship.cargoMax} ({cargoFree} free)</span>
          <span>Fuel {ship.fuel}/{ship.fuelMax}</span>
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
          const trendLabel = Math.abs(pct) < PRICE_TREND_THRESHOLD ? '=' : pct > 0 ? `▲${Math.abs(pct).toFixed(0)}%` : `▼${Math.abs(pct).toFixed(0)}%`;
          const trendClass = Math.abs(pct) < PRICE_TREND_THRESHOLD ? 'muted' : pct > 0 ? 'amber' : 'cyan';

          // Max amounts for convenience buttons
          const maxBuy = Math.min(
            Math.floor(game.player.credits / Math.max(1, buyPrice)),
            freeCargoUnits(good.bulk),
            e.supply,
          );
          const maxSell = Math.min(have, e.demand);
          const quantityMax = Math.max(1, Math.max(maxBuy, maxSell, u));

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
                <QuantityControl
                  label={`Units of ${good.name}`}
                  value={u}
                  max={quantityMax}
                  onChange={(next) => setU(e.goodId, next)}
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
