import { describe, expect, it } from 'vitest';
import { createRng, generateSeedString } from './rng';

describe('rng', () => {
  it('is deterministic for identical seeds', () => {
    const a = createRng('seed-1');
    const b = createRng('seed-1');
    expect([a.next(), a.next(), a.int(1, 10), a.roll(2, 6)]).toEqual([
      b.next(),
      b.next(),
      b.int(1, 10),
      b.roll(2, 6),
    ]);
  });

  it('throws when picking from an empty array', () => {
    const rng = createRng('seed-2');
    expect(() => rng.pick([] as string[])).toThrow('rng.pick: empty array');
  });

  it('generates human friendly seed strings', () => {
    const seed = generateSeedString(createRng('seed-3'));
    expect(seed).toMatch(/^[A-Z]+-\d{4}$/);
  });
});
