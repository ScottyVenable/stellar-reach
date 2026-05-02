// Crew traits. Each trait is a short, high-flavour modifier that combines
// with a crew member's role and energy state to influence event rolls and
// trade prices.

import type { CrewTrait } from '../engine/types';

export const CREW_TRAITS: CrewTrait[] = [
  {
    id: 'empath',
    name: 'Empath',
    description: 'Reads a room. Negotiation is easier, but they soak up the crew\'s stress.',
    modifiers: { Trade: 0.05, Negotiator: 1, StressGain: 0.5 },
  },
  {
    id: 'anxious-attachment',
    name: 'Anxious Attachment',
    description: 'Performs above their grade when paired with the Captain. Falters if abandoned.',
    modifiers: { StressGain: 0.5 },
  },
  {
    id: 'stoic',
    name: 'Stoic',
    description: 'Unflappable under fire. Slow stress accumulation.',
    modifiers: { StressGain: -0.5 },
  },
  {
    id: 'jaded',
    name: 'Jaded',
    description: 'Has seen it all. Bonus to gun work but a penalty to diplomacy.',
    modifiers: { Gunner: 1, Diplomat: -1 },
  },
  {
    id: 'optimist',
    name: 'Optimist',
    description: 'Finds the silver lining. Faster stress recovery for the whole crew.',
    modifiers: { StressRecovery: 1 },
  },
  {
    id: 'addict',
    name: 'Stim Addict',
    description: 'Fast in a pinch. Crashes hard.',
    modifiers: { Pilot: 1, Gunner: 1, StressGain: 1 },
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Sees patterns in the noise. Better engineering and science checks.',
    modifiers: { Engineer: 1, Scientist: 1 },
  },
  {
    id: 'silver-tongue',
    name: 'Silver Tongue',
    description: 'Born for negotiation. Sweetens every haggle.',
    modifiers: { Trade: 0.07, Negotiator: 2 },
  },
  {
    id: 'green',
    name: 'Green',
    description: 'Untested. Picks up stress easily but cheap to hire.',
    modifiers: { StressGain: 0.5 },
  },
  {
    id: 'old-hand',
    name: 'Old Hand',
    description: 'Decades on the void. Boosts every check by a touch.',
    modifiers: { Pilot: 1, Engineer: 1, Gunner: 1, Diplomat: 1 },
  },
  {
    id: 'trauma',
    name: 'Combat Trauma',
    description: 'Pirate fights spike their stress.',
    modifiers: { StressGain: 1 },
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'Survives encounters by sheer providence.',
    modifiers: { Pilot: 1 },
  },
];

export const CREW_TRAITS_BY_ID: Record<string, CrewTrait> = Object.fromEntries(
  CREW_TRAITS.map((t) => [t.id, t]),
);
