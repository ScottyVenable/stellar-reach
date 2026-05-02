// LocalStorage save/load with a versioned envelope and a forward-only
// migration registry.
//
// The envelope is:  { v: number; state: unknown }
//
// When a new field is added to GameState, or an existing field is renamed or
// restructured, add a migration function to MIGRATIONS that transforms the
// old shape into the new one. Never bump LEGACY_KEY — that abandoned saves.
//
// Migration numbering:
//   v0  = raw GameState written by the old `stellar-reach.save.v1` key
//   v1  = first versioned envelope (current)

import type { GameState } from './types';

// The only key we ever write from now on.
const SAVE_KEY = 'stellar-reach.save';

// Legacy key used before the migration framework was introduced.
const LEGACY_KEY = 'stellar-reach.save.v1';

export const CURRENT_SAVE_VERSION = 1;

interface SaveEnvelope {
  v: number;
  state: unknown;
}

// ---  Migrations  -----------------------------------------------------------
// Each entry migrates state from version `from` to version `from + 1`.
// Add a new entry any time the persisted GameState shape changes.

type MigrateFn = (state: unknown) => unknown;

const MIGRATIONS: Map<number, MigrateFn> = new Map([
  // v0 → v1:  Handles legacy saves written without the envelope.
  //   • Fills in `settings` if the field was absent (added in 0.1.x).
  //   • Fills in `pendingEvents` if absent (added alongside transit events).
  //   • Ensures array fields are never undefined.
  [0, (raw: unknown): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- migration operates on unknown shape
    const s = raw as Record<string, any>;
    return {
      ...s,
      settings:      s['settings']      ?? { hardcore: false },
      pendingEvents: s['pendingEvents'] ?? [],
      hireRoster:    s['hireRoster']    ?? [],
      missions:      s['missions']      ?? [],
      log:           s['log']           ?? [],
      news:          s['news']          ?? [],
    };
  }],
]);

/**
 * Runs all registered migrations from `fromVersion` up to
 * `CURRENT_SAVE_VERSION` and returns the fully-updated state.
 * Throws if a migration step is missing.
 */
export function migrate(state: unknown, fromVersion: number): GameState {
  let current = state;
  let version = fromVersion;
  while (version < CURRENT_SAVE_VERSION) {
    const fn = MIGRATIONS.get(version);
    if (!fn) {
      throw new Error(
        `Save migration: no function registered for v${version} → v${version + 1}. ` +
        `Add an entry to MIGRATIONS in src/engine/save.ts.`,
      );
    }
    current = fn(current);
    version++;
  }
  return current as GameState;
}

// ---  Public API  ------------------------------------------------------------

export function saveGame(state: GameState): void {
  try {
    const envelope: SaveEnvelope = { v: CURRENT_SAVE_VERSION, state };
    localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch (err) {
    // Storage is best-effort; quota or privacy mode may block writes.
    console.warn('Failed to save game:', err);
  }
}

export function loadGame(): GameState | null {
  try {
    // --- Current-format save -------------------------------------------------
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const envelope = JSON.parse(raw) as SaveEnvelope;
      if (typeof envelope?.v === 'number') {
        if (envelope.v === CURRENT_SAVE_VERSION) {
          return envelope.state as GameState;
        }
        if (envelope.v < CURRENT_SAVE_VERSION) {
          // Migrate forward and re-save so this only runs once.
          const migrated = migrate(envelope.state, envelope.v);
          saveGame(migrated);
          return migrated;
        }
      }
      // envelope.v is missing or > CURRENT — could be from a newer build.
      // Treat as unrecognised; fall through to legacy check.
      console.warn(
        `Save envelope version ${(envelope as SaveEnvelope).v} is not recognised by this build. ` +
        'The save has been left untouched.',
      );
      return null;
    }

    // --- Legacy save (written without the envelope) --------------------------
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const legacyState = JSON.parse(legacy) as unknown;
      const migrated = migrate(legacyState, 0);
      saveGame(migrated);
      try { localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
      return migrated;
    }

    return null;
  } catch (err) {
    console.warn('Failed to load game:', err);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
