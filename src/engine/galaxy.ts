// Procedural universe generator.
//
// Given a seed string we deterministically build a full galaxy: systems,
// stations, races at each station, and an initial market for each station.
// The same seed always reconstructs the same universe, but every "new game"
// uses a fresh seed by default.

import type {
  GalaxyState,
  GoodCategory,
  MarketEntry,
  Race,
  StarSystem,
  Station,
  StationKind,
} from './types';
import { createRng, type Rng } from './rng';
import { GOODS } from '../data/goods';
import { RACES } from '../data/races';
import { NAME_POOLS } from '../data/names';

const STATION_KINDS: StationKind[] = [
  'Trade Hub',
  'Industrial',
  'Agricultural',
  'Research',
  'Mining',
  'Military',
  'Frontier Outpost',
  'Pleasure Resort',
  'Refinery',
  'Black Market',
];

/** Per-station-kind biases applied to category prices (1.0 = neutral). */
const KIND_BIAS: Record<StationKind, Partial<Record<GoodCategory, number>>> = {
  'Trade Hub': { Luxury: 0.95, 'Refined Goods': 0.95, Data: 0.9 },
  Industrial: { 'Refined Goods': 0.8, 'Raw Materials': 1.15, Technology: 0.95 },
  Agricultural: { Foodstuffs: 0.7, Biological: 0.85, Medical: 1.1 },
  Research: { Data: 0.75, Technology: 0.9, Medical: 0.95, Biological: 0.95 },
  Mining: { 'Raw Materials': 0.65, Energy: 0.85, Foodstuffs: 1.2, Luxury: 1.25 },
  Military: { Weapons: 0.85, Medical: 0.95, Foodstuffs: 1.05, Energy: 0.95 },
  'Frontier Outpost': { Foodstuffs: 1.25, Medical: 1.2, Weapons: 1.1 },
  'Pleasure Resort': { Luxury: 0.85, Cultural: 0.85, Foodstuffs: 1.1, Contraband: 1.05 },
  Refinery: { 'Refined Goods': 0.7, 'Raw Materials': 1.1, Energy: 0.9 },
  'Black Market': { Contraband: 0.6, Weapons: 0.85, Data: 0.9, Cultural: 0.85 },
};

function makeName(rng: Rng, prefixes: string[], suffixes: string[]): string {
  return `${rng.pick(prefixes)} ${rng.pick(suffixes)}`;
}

function uniqueNames(rng: Rng, prefixes: string[], suffixes: string[], count: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let safety = count * 8;
  while (out.length < count && safety-- > 0) {
    const n = makeName(rng, prefixes, suffixes);
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function buildMarket(rng: Rng, station: Station, race: Race): MarketEntry[] {
  const entries: MarketEntry[] = [];
  for (const good of GOODS) {
    // Skip illegal goods on lawful stations most of the time.
    if (good.legality === 'illegal' && station.kind !== 'Black Market' && rng.next() > 0.15) {
      continue;
    }
    if (good.legality === 'restricted' && station.kind === 'Military' && rng.next() > 0.5) {
      // Military stations sometimes don't carry restricted civilian goods.
      continue;
    }

    let bias = 1;
    bias *= station.categoryBias[good.category] ?? 1;
    if (race.exports.includes(good.category)) bias *= 0.85;
    if (race.imports.includes(good.category)) bias *= 1.2;
    bias *= race.tradeBias;
    // Random local jitter +/- 20%.
    bias *= 0.8 + rng.next() * 0.4;

    const price = Math.max(1, Math.round(good.basePrice * bias));

    // Supply/demand: stations that export a category have more supply, less demand.
    const exportFactor = race.exports.includes(good.category) ? 1.6 : 1;
    const importFactor = race.imports.includes(good.category) ? 1.6 : 1;
    const supply = Math.floor((10 + rng.int(0, 30)) * exportFactor);
    const demand = Math.floor((10 + rng.int(0, 30)) * importFactor);

    entries.push({ goodId: good.id, price, supply, demand });
  }
  return entries;
}

function buildStation(
  rng: Rng,
  id: string,
  systemId: string,
  raceId: string,
  name: string,
  kind: StationKind,
  pos: { x: number; y: number },
): Station {
  const station: Station = {
    id,
    name,
    kind,
    raceId,
    systemId,
    prosperity: rng.int(35, 85),
    x: pos.x,
    y: pos.y,
    categoryBias: { ...KIND_BIAS[kind] },
    market: [],
  };
  const race = RACES.find((r) => r.id === raceId) ?? RACES[0];
  station.market = buildMarket(rng, station, race);
  return station;
}

function regionForRing(ring: number): StarSystem['region'] {
  if (ring === 0) return 'Core';
  if (ring === 1) return 'Inner';
  if (ring === 2) return 'Frontier';
  return 'Lawless';
}

export interface GalaxyOptions {
  /** Total number of star systems to generate. */
  systemCount?: number;
  /** Average stations per system; concrete count is sampled per system. */
  avgStationsPerSystem?: number;
}

export function generateGalaxy(seed: string, opts: GalaxyOptions = {}): GalaxyState {
  const systemCount = opts.systemCount ?? 14;
  const rng = createRng(seed);

  // Distribute systems across 4 concentric rings on a 1000x1000 map.
  const systems: StarSystem[] = [];
  const systemNames = uniqueNames(rng, NAME_POOLS.systemPrefixes, NAME_POOLS.systemSuffixes, systemCount);

  for (let i = 0; i < systemCount; i++) {
    const ring = Math.min(3, Math.floor((i / systemCount) * 4));
    const angle = rng.range(0, Math.PI * 2);
    const radius = 120 + ring * 130 + rng.range(-40, 40);
    const x = 500 + Math.cos(angle) * radius;
    const y = 500 + Math.sin(angle) * radius;

    const stationCount = Math.max(1, Math.round((opts.avgStationsPerSystem ?? 2.2) + rng.range(-1, 1)));
    const stationNames = uniqueNames(
      rng,
      NAME_POOLS.stationPrefixes,
      NAME_POOLS.stationSuffixes,
      stationCount,
    );

    const region = regionForRing(ring);
    const systemId = `sys-${i}`;
    const stations: Station[] = [];
    for (let s = 0; s < stationCount; s++) {
      // Race weight depends on region to give the galaxy a sense of place.
      let raceCandidates = RACES;
      if (region === 'Core') raceCandidates = RACES.filter((r) => ['human', 'vendari', 'silicari'].includes(r.id));
      else if (region === 'Inner') raceCandidates = RACES.filter((r) => r.id !== 'voidkin');
      else if (region === 'Lawless') raceCandidates = RACES.filter((r) => ['voidkin', 'kresh', 'human'].includes(r.id));

      const race = rng.pick(raceCandidates);
      let kind: StationKind;
      if (region === 'Lawless' && rng.chance(0.45)) kind = 'Black Market';
      else if (region === 'Frontier' && rng.chance(0.35)) kind = 'Frontier Outpost';
      else if (race.id === 'aelyn' && rng.chance(0.4)) kind = 'Agricultural';
      else if (race.id === 'kresh' && rng.chance(0.4)) kind = 'Military';
      else if (race.id === 'silicari' && rng.chance(0.4)) kind = 'Research';
      else if (race.id === 'vendari' && rng.chance(0.4)) kind = 'Trade Hub';
      else kind = rng.pick(STATION_KINDS);

      const station = buildStation(
        rng,
        `sta-${i}-${s}`,
        systemId,
        race.id,
        stationNames[s],
        kind,
        { x: rng.range(120, 380), y: rng.range(120, 380) },
      );
      stations.push(station);
    }

    systems.push({
      id: systemId,
      name: systemNames[i],
      x,
      y,
      region,
      stations,
    });
  }

  return { seed, systems, races: RACES };
}

/** Convenience helper to flatten all stations across systems. */
export function allStations(galaxy: GalaxyState): Station[] {
  return galaxy.systems.flatMap((s) => s.stations);
}

export function findStation(galaxy: GalaxyState, stationId: string): Station | undefined {
  return allStations(galaxy).find((s) => s.id === stationId);
}

export function findSystemOfStation(galaxy: GalaxyState, stationId: string): StarSystem | undefined {
  return galaxy.systems.find((sys) => sys.stations.some((s) => s.id === stationId));
}
