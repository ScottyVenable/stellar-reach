// LocalStorage save/load. We keep the entire GameState as JSON; it is small.

import type { GameState } from './types';

const KEY = 'stellar-reach.save.v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Storage is best-effort; quota or privacy mode may block writes.
    console.warn('Failed to save game:', err);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (err) {
    console.warn('Failed to load game:', err);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
