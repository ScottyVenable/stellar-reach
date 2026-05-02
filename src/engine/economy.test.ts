import { describe, expect, it } from 'vitest';
import { applyTrade, tickWithSalt } from './economy';
import { generateGalaxy } from './galaxy';

describe('economy', () => {
  it('adjusts supply and price when buying from market', () => {
    const galaxy = generateGalaxy('VEGA-3333', { systemCount: 4, avgStationsPerSystem: 2 });
    const station = galaxy.systems[0].stations[0];
    const target = station.market[0];

    const updated = applyTrade(station, target.goodId, 3);
    const nextEntry = updated.market.find((m) => m.goodId === target.goodId);

    expect(nextEntry).toBeDefined();
    expect(nextEntry!.supply).toBe(Math.max(0, target.supply - 3));
    expect(nextEntry!.price).toBeGreaterThanOrEqual(target.price);
  });

  it('is deterministic when ticked with the same salt', () => {
    const galaxy = generateGalaxy('QUASAR-4444', { systemCount: 5, avgStationsPerSystem: 2 });
    const a = tickWithSalt(galaxy, [], 'day-2');
    const b = tickWithSalt(galaxy, [], 'day-2');
    expect(a).toEqual(b);
  });
});
