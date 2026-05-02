// High-level game logic.
//
// All of the functions in this module are *pure* with respect to game state:
// they take the current state plus arguments and return a new state object.
// The Zustand store wires them up to React.

import {
  GameState,
  GameSettings,
  CrewMember,
  CourierMission,
  TransitChoice,
  TransitChoiceOutcome,
  TransitEvent,
} from './types';
import { createRng, generateSeedString, cryptoRandomUint32, type Rng } from './rng';
import { generateGalaxy, allStations, findStation, findSystemOfStation } from './galaxy';
export { allStations, findStation, findSystemOfStation };
import { generateHireRoster, tickCrew, effectiveSkill } from './crew';
import { generateNews, ageNews } from './news';
import { tickEconomy, applyTrade, entry } from './economy';
import { pickTransitEvents } from './events';
import { GOODS_BY_ID } from '../data/goods';
import { defaultStarterShipModuleIds, SHIP_MODULES_BY_ID } from '../data/modules';

const DEFAULT_STARTING_CREDITS = 5000;
const COURIER_BASE_FEE = 250;

export function defaultSettings(): GameSettings {
  return { hardcore: false };
}

function buildShipFromModules(moduleIds: string[]): GameState['player']['ship'] {
  const stats = {
    cargoMax: 0,
    fuelMax: 0,
    hullMax: 0,
    shieldMax: 0,
    speed: 0,
    sensor: 0,
    evasion: 0,
  };
  for (const id of moduleIds) {
    const mod = SHIP_MODULES_BY_ID[id];
    if (!mod) continue;
    stats.cargoMax += mod.effects.cargo ?? 0;
    stats.fuelMax += mod.effects.fuelMax ?? 0;
    stats.hullMax += mod.effects.hullMax ?? 0;
    stats.shieldMax += mod.effects.shieldMax ?? 0;
    stats.speed += mod.effects.speed ?? 0;
    stats.sensor += mod.effects.sensor ?? 0;
    stats.evasion += mod.effects.evasion ?? 0;
  }
  return {
    name: 'Starling',
    cargo: 0,
    cargoMax: stats.cargoMax,
    fuel: stats.fuelMax,
    fuelMax: stats.fuelMax,
    hull: stats.hullMax,
    hullMax: stats.hullMax,
    shield: stats.shieldMax,
    shieldMax: stats.shieldMax,
    speed: Math.max(1, stats.speed),
    sensor: Math.max(1, stats.sensor),
    evasion: stats.evasion,
    installedModuleIds: moduleIds.slice(),
    hold: {},
  };
}

export interface NewGameOptions {
  seed?: string;
  captainName?: string;
}

export function newGame(opts: NewGameOptions = {}): GameState {
  // When no seed is given we derive one from a crypto-random uint32 XORed with
  // the current timestamp, then let generateSeedString format it as a human-
  // readable string (e.g. "NOVA-7421"). Using crypto avoids Math.random.
  const bootSeed = opts.seed ?? String(cryptoRandomUint32() ^ (Date.now() >>> 0));
  const rng = createRng(bootSeed);
  const seed = opts.seed ?? generateSeedString(rng);
  const galaxy = generateGalaxy(seed);
  const startStation = allStations(galaxy)[0];
  const ship = buildShipFromModules(defaultStarterShipModuleIds());
  const starterCrew: CrewMember[] = [
    {
      id: 'crew-pilot',
      name: 'Anya Vey',
      raceId: 'human',
      role: 'Pilot',
      skill: 6,
      wage: 28,
      energy: 'Grounded',
      stress: 10,
      traitIds: ['lucky'],
      resting: false,
    },
    {
      id: 'crew-engineer',
      name: 'Bram Korr',
      raceId: 'human',
      role: 'Engineer',
      skill: 5,
      wage: 24,
      energy: 'Grounded',
      stress: 8,
      traitIds: ['analyst'],
      resting: false,
    },
  ];

  const news = generateNews(rng, 1, galaxy);

  return {
    galaxy,
    player: {
      captainName: opts.captainName ?? 'Captain',
      credits: DEFAULT_STARTING_CREDITS,
      ship,
      crew: starterCrew,
      locationStationId: startStation.id,
      day: 1,
    },
    news,
    missions: [],
    hireRoster: generateHireRoster(rng, 4),
    log: [
      { day: 1, text: `New campaign begins. Seed: ${seed}.` },
      { day: 1, text: `Docked at ${startStation.name}.` },
    ],
    pendingEvents: [],
    settings: defaultSettings(),
  };
}

export function currentStation(state: GameState) {
  return findStation(state.galaxy, state.player.locationStationId);
}

export function currentSystem(state: GameState) {
  return findSystemOfStation(state.galaxy, state.player.locationStationId);
}

/** Effective trade multiplier from crew (Negotiator + Empath/Silver Tongue). */
export function tradeMultiplier(state: GameState): number {
  let bonus = 0;
  for (const c of state.player.crew) {
    if (c.resting) continue;
    if (c.role === 'Negotiator') bonus += 0.02 * c.skill;
    for (const tid of c.traitIds) {
      // Trait modifier on Trade is a multiplicative-ish nudge, kept small.
      const trait = (TRAIT_MAP[tid] ?? {}).Trade;
      if (typeof trait === 'number') bonus += trait;
    }
  }
  return Math.max(0.7, Math.min(1.3, 1 - bonus / 4));
  // Buying multiplier: lower is better. We expose buy & sell separately below.
}

// Lazy-loaded trait modifier map to avoid circular imports at module init.
import { CREW_TRAITS_BY_ID } from '../data/traits';
const TRAIT_MAP = Object.fromEntries(
  Object.values(CREW_TRAITS_BY_ID).map((t) => [t.id, t.modifiers]),
) as Record<string, Record<string, number>>;

export function priceMultipliers(state: GameState): { buy: number; sell: number } {
  let bonus = 0;
  for (const c of state.player.crew) {
    if (c.resting) continue;
    if (c.role === 'Negotiator') bonus += 0.015 * c.skill;
    for (const tid of c.traitIds) {
      const t = TRAIT_MAP[tid];
      if (t && typeof t.Trade === 'number') bonus += t.Trade;
    }
  }
  bonus = Math.max(0, Math.min(0.2, bonus));
  return { buy: 1 - bonus, sell: 1 + bonus };
}

/** Buy units of a good from the current station. */
export function buy(state: GameState, goodId: string, units: number): GameState {
  if (units <= 0) return state;
  const station = currentStation(state);
  if (!station) return state;
  const e = entry(station, goodId);
  if (!e) return state;
  const good = GOODS_BY_ID[goodId];
  if (!good) return state;

  const { buy: buyMul } = priceMultipliers(state);
  const unitPrice = Math.max(1, Math.round(e.price * buyMul));
  const maxByCredits = Math.floor(state.player.credits / unitPrice);
  const maxByCargo = Math.floor((state.player.ship.cargoMax - state.player.ship.cargo) / good.bulk);
  const maxBySupply = e.supply;
  const actualUnits = Math.max(0, Math.min(units, maxByCredits, maxByCargo, maxBySupply));
  if (actualUnits === 0) return state;

  const cost = actualUnits * unitPrice;
  const newStation = applyTrade(station, goodId, actualUnits);
  const galaxy = replaceStation(state.galaxy, newStation);
  const ship = {
    ...state.player.ship,
    cargo: state.player.ship.cargo + actualUnits * good.bulk,
    hold: { ...state.player.ship.hold, [goodId]: (state.player.ship.hold[goodId] ?? 0) + actualUnits },
  };
  return {
    ...state,
    galaxy,
    player: { ...state.player, credits: state.player.credits - cost, ship },
    log: pushLog(state.log, state.player.day, `Bought ${actualUnits} x ${good.name} for ${cost}cr at ${station.name}.`),
  };
}

/** Sell units of a good to the current station. */
export function sell(state: GameState, goodId: string, units: number): GameState {
  if (units <= 0) return state;
  const station = currentStation(state);
  if (!station) return state;
  const e = entry(station, goodId);
  if (!e) return state;
  const good = GOODS_BY_ID[goodId];
  if (!good) return state;

  const have = state.player.ship.hold[goodId] ?? 0;
  const actualUnits = Math.max(0, Math.min(units, have, e.demand));
  if (actualUnits === 0) return state;

  const { sell: sellMul } = priceMultipliers(state);
  const unitPrice = Math.max(1, Math.round(e.price * sellMul));
  const earned = actualUnits * unitPrice;

  const newStation = applyTrade(station, goodId, -actualUnits);
  const galaxy = replaceStation(state.galaxy, newStation);
  const remaining = have - actualUnits;
  const newHold = { ...state.player.ship.hold };
  if (remaining > 0) newHold[goodId] = remaining;
  else delete newHold[goodId];
  const ship = {
    ...state.player.ship,
    cargo: Math.max(0, state.player.ship.cargo - actualUnits * good.bulk),
    hold: newHold,
  };

  return {
    ...state,
    galaxy,
    player: { ...state.player, credits: state.player.credits + earned, ship },
    log: pushLog(state.log, state.player.day, `Sold ${actualUnits} x ${good.name} for ${earned}cr at ${station.name}.`),
  };
}

function replaceStation(galaxy: GameState['galaxy'], station: GameState['galaxy']['systems'][number]['stations'][number]): GameState['galaxy'] {
  return {
    ...galaxy,
    systems: galaxy.systems.map((sys) =>
      sys.id !== station.systemId
        ? sys
        : { ...sys, stations: sys.stations.map((s) => (s.id === station.id ? station : s)) },
    ),
  };
}

function pushLog(log: GameState['log'], day: number, text: string) {
  const next = log.slice(-199);
  next.push({ day, text });
  return next;
}

/** Install a ship module in the current station. */
export function installModule(state: GameState, moduleId: string): GameState {
  const mod = SHIP_MODULES_BY_ID[moduleId];
  if (!mod) return state;
  if (state.player.credits < mod.cost) return state;

  // Replace the current module in the same slot.
  const otherModuleIds = state.player.ship.installedModuleIds.filter((id) => SHIP_MODULES_BY_ID[id]?.slot !== mod.slot);
  const newIds = [...otherModuleIds, mod.id];
  const newShip = buildShipFromModules(newIds);
  // Preserve current cargo & hold, scaled to new max if smaller.
  newShip.hold = { ...state.player.ship.hold };
  newShip.cargo = Math.min(state.player.ship.cargo, newShip.cargoMax);
  newShip.fuel = Math.min(state.player.ship.fuel, newShip.fuelMax);
  newShip.hull = Math.min(state.player.ship.hull, newShip.hullMax);
  newShip.shield = Math.min(state.player.ship.shield, newShip.shieldMax);

  return {
    ...state,
    player: { ...state.player, credits: state.player.credits - mod.cost, ship: newShip },
    log: pushLog(state.log, state.player.day, `Installed ${mod.name} for ${mod.cost}cr.`),
  };
}

/** Refuel at the current station. */
export function refuel(state: GameState, units: number): GameState {
  const ship = state.player.ship;
  const need = ship.fuelMax - ship.fuel;
  const actual = Math.max(0, Math.min(units, need));
  const cost = actual * 8;
  if (state.player.credits < cost) return state;
  return {
    ...state,
    player: { ...state.player, credits: state.player.credits - cost, ship: { ...ship, fuel: ship.fuel + actual } },
    log: pushLog(state.log, state.player.day, `Refueled ${actual} units for ${cost}cr.`),
  };
}

/** Repair hull at the current station. */
export function repair(state: GameState, units: number): GameState {
  const ship = state.player.ship;
  const need = ship.hullMax - ship.hull;
  const actual = Math.max(0, Math.min(units, need));
  const cost = actual * 18;
  if (state.player.credits < cost) return state;
  return {
    ...state,
    player: { ...state.player, credits: state.player.credits - cost, ship: { ...ship, hull: ship.hull + actual } },
    log: pushLog(state.log, state.player.day, `Repaired ${actual} hull for ${cost}cr.`),
  };
}

/** Hire a crew member from the current station's roster. */
export function hireCrew(state: GameState, crewId: string): GameState {
  const candidate = state.hireRoster.find((c) => c.id === crewId);
  if (!candidate) return state;
  const signingFee = candidate.wage * 5;
  if (state.player.credits < signingFee) return state;
  if (state.player.crew.length >= 8) return state;
  return {
    ...state,
    player: {
      ...state.player,
      credits: state.player.credits - signingFee,
      crew: [...state.player.crew, candidate],
    },
    hireRoster: state.hireRoster.filter((c) => c.id !== crewId),
    log: pushLog(state.log, state.player.day, `Hired ${candidate.name} (${candidate.role}) for ${signingFee}cr.`),
  };
}

/** Dismiss a crew member, paying severance. */
export function dismissCrew(state: GameState, crewId: string): GameState {
  const member = state.player.crew.find((c) => c.id === crewId);
  if (!member) return state;
  const severance = member.wage * 3;
  return {
    ...state,
    player: {
      ...state.player,
      credits: Math.max(0, state.player.credits - severance),
      crew: state.player.crew.filter((c) => c.id !== crewId),
    },
    log: pushLog(state.log, state.player.day, `Dismissed ${member.name}. Severance ${severance}cr.`),
  };
}

/** Toggle resting / Sensory Deprivation Pod. */
export function toggleRest(state: GameState, crewId: string): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      crew: state.player.crew.map((c) => (c.id === crewId ? { ...c, resting: !c.resting } : c)),
    },
  };
}

export type RouteSafety = 'safe' | 'fast';

export interface RouteEstimate {
  distance: number;
  fuelCost: number;
  days: number;
  eventCount: number;
  safety: RouteSafety;
}

export function estimateRoute(state: GameState, toStationId: string, safety: RouteSafety): RouteEstimate | null {
  const from = currentStation(state);
  const fromSys = currentSystem(state);
  const toSys = state.galaxy.systems.find((sys) => sys.stations.some((s) => s.id === toStationId));
  if (!from || !fromSys || !toSys) return null;
  const intra = fromSys.id === toSys.id;
  const dx = fromSys.x - toSys.x;
  const dy = fromSys.y - toSys.y;
  const distance = intra ? 30 : Math.max(40, Math.round(Math.sqrt(dx * dx + dy * dy)));
  const speed = state.player.ship.speed;
  const baseFuel = Math.max(2, Math.round(distance / 12));
  const fuelCost = safety === 'safe' ? Math.round(baseFuel * 1.4) : baseFuel;
  const days = Math.max(1, Math.round(distance / (12 * speed)));
  const eventCount = intra ? (safety === 'fast' ? 1 : 0) : safety === 'fast' ? 2 : 1;
  return { distance, fuelCost, days, eventCount, safety };
}

/** Initiate travel to another station. Selects events but does not resolve them. */
export function beginTravel(
  state: GameState,
  toStationId: string,
  safety: RouteSafety,
): { state: GameState; route: RouteEstimate | null } {
  const route = estimateRoute(state, toStationId, safety);
  if (!route) return { state, route: null };
  const ship = state.player.ship;
  if (ship.fuel < route.fuelCost) return { state, route: null };
  const rng = createRng(`${state.galaxy.seed}:travel:${state.player.day}:${toStationId}`);
  const events = pickTransitEvents(rng, route.eventCount);

  const next: GameState = {
    ...state,
    player: {
      ...state.player,
      ship: { ...ship, fuel: ship.fuel - route.fuelCost },
    },
    pendingEvents: events,
    log: pushLog(state.log, state.player.day, `Plotting course to ${toStationId} (${safety} route).`),
  };
  return { state: next, route };
}

function applyOutcome(state: GameState, outcome: TransitChoiceOutcome): GameState {
  const ship = { ...state.player.ship };
  if (outcome.hullDelta) ship.hull = Math.max(0, Math.min(ship.hullMax, ship.hull + outcome.hullDelta));
  if (outcome.shieldDelta) ship.shield = Math.max(0, Math.min(ship.shieldMax, ship.shield + outcome.shieldDelta));
  if (outcome.fuelDelta) ship.fuel = Math.max(0, Math.min(ship.fuelMax, ship.fuel + outcome.fuelDelta));
  if (outcome.cargoDelta) {
    const newHold = { ...ship.hold };
    let cargo = ship.cargo;
    for (const cd of outcome.cargoDelta) {
      const good = GOODS_BY_ID[cd.goodId];
      if (!good) continue;
      const remainingSpace = ship.cargoMax - cargo;
      const fit = Math.max(0, Math.min(cd.units, Math.floor(remainingSpace / good.bulk)));
      if (fit <= 0) continue;
      newHold[cd.goodId] = (newHold[cd.goodId] ?? 0) + fit;
      cargo += fit * good.bulk;
    }
    ship.hold = newHold;
    ship.cargo = cargo;
  }

  let crew = state.player.crew;
  if (outcome.stressDelta) {
    crew = crew.map((c) => (c.resting ? c : { ...c, stress: Math.max(0, Math.min(100, c.stress + (outcome.stressDelta ?? 0))) }));
  }

  const credits = Math.max(0, state.player.credits + (outcome.creditsDelta ?? 0));
  return {
    ...state,
    player: { ...state.player, credits, crew, ship },
    log: pushLog(state.log, state.player.day, outcome.text || ''),
  };
}

export function resolveChoice(
  state: GameState,
  event: TransitEvent,
  choice: TransitChoice,
  rng: Rng,
): { state: GameState; success: boolean; roll: number; total: number } {
  let success = true;
  let roll = 0;
  let total = 0;

  if (choice.testRole !== null) {
    // Find best crew member for the role.
    const candidates = state.player.crew.filter((c) => !c.resting && c.role === choice.testRole);
    const tester = candidates.sort((a, b) => effectiveSkill(b) - effectiveSkill(a))[0];
    roll = rng.int(1, 20);
    total = roll + (tester ? effectiveSkill(tester) : 0) + state.player.ship.evasion;
    success = total >= choice.dc;
  }

  const outcome = success ? choice.success : choice.failure;
  const next = applyOutcome(state, outcome);
  // Drop this event from the queue.
  const remaining = next.pendingEvents.filter((e) => e.id !== event.id);
  return {
    state: { ...next, pendingEvents: remaining },
    success,
    roll,
    total,
  };
}

/** Once events are resolved, dock at the destination and tick the world. */
export function arriveAt(state: GameState, stationId: string, route: RouteEstimate): GameState {
  const dest = findStation(state.galaxy, stationId);
  if (!dest) return state;
  const rng = createRng(`${state.galaxy.seed}:arrive:${state.player.day}:${stationId}`);

  // Tick days, news, economy, crew.
  let nextNews = ageNews(state.news);
  let galaxy = state.galaxy;
  let crew = state.player.crew;
  let day = state.player.day;
  let missions = state.missions;
  let credits = state.player.credits;
  const log = state.log.slice();

  for (let d = 0; d < route.days; d++) {
    day += 1;
    nextNews = nextNews.concat(generateNews(rng, day, galaxy));
    nextNews = ageNews(nextNews); // age every step too
    galaxy = tickEconomy(galaxy, nextNews, rng);
    crew = tickCrew(crew);

    // Pay wages
    const wages = crew.reduce((sum, c) => sum + c.wage, 0);
    credits = Math.max(0, credits - wages);
    if (wages > 0) log.push({ day, text: `Paid crew wages ${wages}cr.` });

    // Resolve courier missions whose endDay is reached.
    missions = missions.map((m) => {
      if (m.status !== 'In Transit' || day < m.endDay) return m;
      // Resolve mission with a small skill check.
      const success = rng.next() < 0.85;
      if (success) {
        const earned = m.units * m.payPerUnit;
        credits += earned;
        log.push({ day, text: `Courier ${m.id.slice(0, 6)} delivered ${m.units} units for ${earned}cr.` });
        return { ...m, status: 'Completed' as const };
      }
      log.push({ day, text: `Courier ${m.id.slice(0, 6)} was lost. The cargo is gone.` });
      return { ...m, status: 'Failed' as const };
    });
  }

  log.push({ day, text: `Docked at ${dest.name}.` });

  // Refresh hire roster.
  const roster = generateHireRoster(rng, 4);

  return {
    ...state,
    galaxy,
    news: nextNews,
    player: {
      ...state.player,
      credits,
      crew,
      day,
      locationStationId: stationId,
    },
    missions,
    hireRoster: roster,
    pendingEvents: [],
    log,
  };
}

/** Hire a courier mission (no risk to your own ship). */
export function hireCourier(
  state: GameState,
  goodId: string,
  units: number,
  toStationId: string,
): GameState {
  const station = currentStation(state);
  if (!station) return state;
  const have = state.player.ship.hold[goodId] ?? 0;
  if (have < units) return state;
  const good = GOODS_BY_ID[goodId];
  if (!good) return state;
  const route = estimateRoute(state, toStationId, 'safe');
  if (!route) return state;

  const fee = COURIER_BASE_FEE + units * 8;
  if (state.player.credits < fee) return state;

  // Determine pay per unit using the *current* market price at destination.
  const dest = findStation(state.galaxy, toStationId);
  const e = dest ? entry(dest, goodId) : undefined;
  const payPerUnit = e ? Math.max(1, Math.round(e.price * 0.92)) : Math.round(good.basePrice * 0.9);

  const rng = createRng(`${state.galaxy.seed}:courier:${state.player.day}:${toStationId}`);
  const hired: CrewMember = generateHireRosterItem(rng);

  // Remove cargo from ship.
  const remaining = have - units;
  const newHold = { ...state.player.ship.hold };
  if (remaining > 0) newHold[goodId] = remaining;
  else delete newHold[goodId];
  const ship = {
    ...state.player.ship,
    hold: newHold,
    cargo: Math.max(0, state.player.ship.cargo - units * good.bulk),
  };

  const mission: CourierMission = {
    id: `mis-${state.player.day}-${rng.int(0, 99999).toString(36)}`,
    goodId,
    units,
    fromStationId: station.id,
    toStationId,
    startDay: state.player.day,
    endDay: state.player.day + route.days + 1,
    payPerUnit,
    hiredCrewId: hired.id,
    hireFee: fee,
    status: 'In Transit',
  };

  return {
    ...state,
    player: { ...state.player, credits: state.player.credits - fee, ship },
    missions: [...state.missions, mission],
    log: pushLog(
      state.log,
      state.player.day,
      `Hired ${hired.name} to ferry ${units} x ${good.name} for ${fee}cr (pay/unit ${payPerUnit}cr).`,
    ),
  };
}

function generateHireRosterItem(rng: Rng): CrewMember {
  // Reuse generator, single member.
  const [m] = generateHireRoster(rng, 1);
  return m;
}

/** Discard a completed/failed mission entry from the player's view. */
export function clearResolvedMission(state: GameState, missionId: string): GameState {
  return { ...state, missions: state.missions.filter((m) => m.id !== missionId) };
}

export function rerollSeed(): string {
  return generateSeedString();
}
