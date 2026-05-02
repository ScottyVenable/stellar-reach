// Dynamic economy.
//
// Each in-game day, every station's market drifts toward its baseline price
// while reacting to active news items. News can spike or crater a category or
// a specific good across an affected system.

import type { GalaxyState, MarketEntry, NewsItem, Station } from './types';
import type { Rng } from './rng';
import { GOODS_BY_ID } from '../data/goods';
import { RACES_BY_ID } from '../data/races';
import { createRng } from './rng';

/** Compute the baseline price for a good at a station. Mirrors galaxy.ts. */
function baselineFor(station: Station, goodId: string): number {
  const good = GOODS_BY_ID[goodId];
  const race = RACES_BY_ID[station.raceId];
  if (!good || !race) return 1;
  let bias = 1;
  bias *= station.categoryBias[good.category] ?? 1;
  if (race.exports.includes(good.category)) bias *= 0.85;
  if (race.imports.includes(good.category)) bias *= 1.2;
  bias *= race.tradeBias;
  return Math.max(1, Math.round(good.basePrice * bias));
}

/** Apply news effect to one entry. */
function applyNewsToEntry(entry: MarketEntry, station: Station, news: NewsItem[]): MarketEntry {
  let multiplier = 1;
  for (const n of news) {
    if (n.systemId && n.systemId !== station.systemId) continue;
    const good = GOODS_BY_ID[entry.goodId];
    if (!good) continue;
    if (n.goodId && n.goodId !== entry.goodId) continue;
    if (!n.goodId && n.category && n.category !== good.category) continue;
    multiplier *= 1 + n.priceDelta;
  }
  return { ...entry, price: Math.max(1, Math.round(entry.price * multiplier)) };
}

/**
 * Step every market: drift prices toward baseline (~30% per day), restock
 * supply/demand, then apply current news effects on top.
 */
export function tickEconomy(galaxy: GalaxyState, news: NewsItem[], rng: Rng): GalaxyState {
  const systems = galaxy.systems.map((sys) => ({
    ...sys,
    stations: sys.stations.map((station) => {
      const market = station.market.map((entry) => {
        const baseline = baselineFor(station, entry.goodId);
        // Drift 30% toward baseline + small jitter.
        const drifted = entry.price + (baseline - entry.price) * 0.3 + rng.range(-2, 2);
        const restockedSupply = Math.min(80, entry.supply + rng.int(0, 4));
        const restockedDemand = Math.min(80, entry.demand + rng.int(0, 4));
        const updated: MarketEntry = {
          ...entry,
          price: Math.max(1, Math.round(drifted)),
          supply: restockedSupply,
          demand: restockedDemand,
        };
        return applyNewsToEntry(updated, station, news);
      });
      return { ...station, market };
    }),
  }));
  return { ...galaxy, systems };
}

/** Adjust a single market entry after a player buy or sell action. */
export function applyTrade(
  station: Station,
  goodId: string,
  unitsDelta: number,
): Station {
  const market = station.market.map((entry) => {
    if (entry.goodId !== goodId) return entry;
    if (unitsDelta > 0) {
      // Player bought: supply drops, price ticks up.
      const newPrice = Math.round(entry.price * (1 + 0.01 * unitsDelta));
      return {
        ...entry,
        supply: Math.max(0, entry.supply - unitsDelta),
        price: Math.max(1, newPrice),
      };
    }
    // Player sold: demand drops, price ticks down.
    const sold = -unitsDelta;
    const newPrice = Math.round(entry.price * (1 - 0.008 * sold));
    return {
      ...entry,
      demand: Math.max(0, entry.demand - sold),
      price: Math.max(1, newPrice),
    };
  });
  return { ...station, market };
}

/** Shorthand to find the entry. Returns undefined if not stocked. */
export function entry(station: Station, goodId: string): MarketEntry | undefined {
  return station.market.find((e) => e.goodId === goodId);
}

/** Convenience pure ticker that builds its own RNG from a salt. */
export function tickWithSalt(galaxy: GalaxyState, news: NewsItem[], salt: string): GalaxyState {
  return tickEconomy(galaxy, news, createRng(salt));
}
