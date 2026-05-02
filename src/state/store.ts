// Zustand store wiring. The store is a thin shell over the pure functions in
// `engine/game.ts`. UI components subscribe to slices of state.

import { create } from 'zustand';
import type { GameState, TransitChoice, TransitEvent } from '../engine/types';
import { newGame, type RouteSafety } from '../engine/game';
import * as game from '../engine/game';
import { saveGame, loadGame, clearSave } from '../engine/save';
import { createRng } from '../engine/rng';

export type Screen = 'market' | 'ship' | 'crew' | 'helm' | 'news' | 'missions' | 'log';

export interface PendingTrip {
  toStationId: string;
  safety: RouteSafety;
  route: NonNullable<ReturnType<typeof game.estimateRoute>>;
}

interface ChoiceResolution {
  eventId: string;
  choiceId: string;
  success: boolean;
  roll: number;
  total: number;
  text: string;
}

interface AppState {
  screen: Screen;
  game: GameState | null;
  trip: PendingTrip | null;
  lastResolution: ChoiceResolution | null;
  setScreen(s: Screen): void;

  // Lifecycle
  startNewGame(seed?: string, captainName?: string): void;
  loadIfPresent(): boolean;
  resetGame(): void;

  // Actions
  buy(goodId: string, units: number): void;
  sell(goodId: string, units: number): void;
  installModule(moduleId: string): void;
  refuel(units: number): void;
  repair(units: number): void;
  hireCrew(crewId: string): void;
  dismissCrew(crewId: string): void;
  toggleRest(crewId: string): void;
  hireCourier(goodId: string, units: number, toStationId: string): void;
  clearMission(missionId: string): void;

  // Travel
  beginTrip(toStationId: string, safety: RouteSafety): void;
  resolveChoice(event: TransitEvent, choice: TransitChoice): void;
  finishTrip(): void;
  cancelTrip(): void;
}

export const useGameStore = create<AppState>((set, get) => ({
  screen: 'market',
  game: null,
  trip: null,
  lastResolution: null,
  setScreen: (s) => set({ screen: s }),

  startNewGame: (seed, captainName) => {
    const g = newGame({ seed, captainName });
    saveGame(g);
    set({ game: g, screen: 'market', trip: null, lastResolution: null });
  },

  loadIfPresent: () => {
    const g = loadGame();
    if (g) {
      set({ game: g });
      return true;
    }
    return false;
  },

  resetGame: () => {
    clearSave();
    set({ game: null, trip: null, screen: 'market', lastResolution: null });
  },

  buy: (goodId, units) => {
    const g = get().game;
    if (!g) return;
    const next = game.buy(g, goodId, units);
    saveGame(next);
    set({ game: next });
  },
  sell: (goodId, units) => {
    const g = get().game;
    if (!g) return;
    const next = game.sell(g, goodId, units);
    saveGame(next);
    set({ game: next });
  },
  installModule: (moduleId) => {
    const g = get().game;
    if (!g) return;
    const next = game.installModule(g, moduleId);
    saveGame(next);
    set({ game: next });
  },
  refuel: (units) => {
    const g = get().game;
    if (!g) return;
    const next = game.refuel(g, units);
    saveGame(next);
    set({ game: next });
  },
  repair: (units) => {
    const g = get().game;
    if (!g) return;
    const next = game.repair(g, units);
    saveGame(next);
    set({ game: next });
  },
  hireCrew: (crewId) => {
    const g = get().game;
    if (!g) return;
    const next = game.hireCrew(g, crewId);
    saveGame(next);
    set({ game: next });
  },
  dismissCrew: (crewId) => {
    const g = get().game;
    if (!g) return;
    const next = game.dismissCrew(g, crewId);
    saveGame(next);
    set({ game: next });
  },
  toggleRest: (crewId) => {
    const g = get().game;
    if (!g) return;
    const next = game.toggleRest(g, crewId);
    saveGame(next);
    set({ game: next });
  },
  hireCourier: (goodId, units, toStationId) => {
    const g = get().game;
    if (!g) return;
    const next = game.hireCourier(g, goodId, units, toStationId);
    saveGame(next);
    set({ game: next });
  },
  clearMission: (missionId) => {
    const g = get().game;
    if (!g) return;
    const next = game.clearResolvedMission(g, missionId);
    saveGame(next);
    set({ game: next });
  },

  beginTrip: (toStationId, safety) => {
    const g = get().game;
    if (!g) return;
    const { state, route } = game.beginTravel(g, toStationId, safety);
    if (!route) return;
    saveGame(state);
    set({ game: state, trip: { toStationId, safety, route } });
  },
  resolveChoice: (event, choice) => {
    const g = get().game;
    if (!g) return;
    const rng = createRng(`${g.galaxy.seed}:roll:${g.player.day}:${event.id}:${choice.id}`);
    const { state, success, roll, total } = game.resolveChoice(g, event, choice, rng);
    saveGame(state);
    set({
      game: state,
      lastResolution: {
        eventId: event.id,
        choiceId: choice.id,
        success,
        roll,
        total,
        text: success ? choice.success.text : choice.failure.text,
      },
    });
  },
  finishTrip: () => {
    const g = get().game;
    const trip = get().trip;
    if (!g || !trip) return;
    const next = game.arriveAt(g, trip.toStationId, trip.route);
    saveGame(next);
    set({ game: next, trip: null, lastResolution: null });
  },
  cancelTrip: () => {
    set({ trip: null, lastResolution: null });
  },
}));
