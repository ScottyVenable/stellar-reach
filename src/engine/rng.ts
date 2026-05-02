// Seeded pseudo-random number generator (mulberry32).
//
// We use a deterministic PRNG so that every "new game" can be re-derived from
// a single integer seed. This makes universes shareable and reproducible while
// still feeling fresh on every reroll.
//
// Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32

export interface Rng {
  /** Returns a float in [0, 1). */
  next(): number;
  /** Returns an integer in [min, max] (inclusive). */
  int(min: number, max: number): number;
  /** Returns a float in [min, max). */
  range(min: number, max: number): number;
  /** Returns true with the given probability (0..1). */
  chance(p: number): boolean;
  /** Picks a random element from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Returns a shuffled shallow copy of the input array. */
  shuffle<T>(arr: readonly T[]): T[];
  /** Rolls `n` dice with `sides` faces and returns the sum. */
  roll(n: number, sides: number): number;
  /** Returns the current internal state, useful for branching child RNGs. */
  fork(label: string): Rng;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash for converting strings to a 32-bit seed. */
export function hashSeed(input: string | number): number {
  if (typeof input === 'number') return input >>> 0;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createRng(seed: number | string): Rng {
  const numericSeed = hashSeed(seed);
  const next = mulberry32(numericSeed);

  const rng: Rng = {
    next,
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    range(min, max) {
      return next() * (max - min) + min;
    },
    chance(p) {
      return next() < p;
    },
    pick(arr) {
      if (arr.length === 0) throw new Error('rng.pick: empty array');
      return arr[Math.floor(next() * arr.length)];
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    roll(n, sides) {
      let total = 0;
      for (let i = 0; i < n; i++) total += Math.floor(next() * sides) + 1;
      return total;
    },
    fork(label) {
      // Combine the parent's next draw with the label so child streams are
      // both deterministic and decorrelated.
      const childSeed = hashSeed(`${numericSeed}:${label}:${Math.floor(next() * 0xffffffff)}`);
      return createRng(childSeed);
    },
  };
  return rng;
}

/** Generates a short, human-friendly seed string like "NOVA-7421". */
export function generateSeedString(rng?: Rng): string {
  const r = rng ?? createRng(Date.now() ^ Math.floor(Math.random() * 0xffffffff));
  const prefixes = ['NOVA', 'ORION', 'HELIX', 'AURIGA', 'CYGNUS', 'LYRA', 'VEGA', 'KEPLER', 'PULSAR', 'QUASAR'];
  const prefix = r.pick(prefixes);
  const num = r.int(1000, 9999);
  return `${prefix}-${num}`;
}
