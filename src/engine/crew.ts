// Procedural crew generation. Crew members are sampled from the race pools
// with role-appropriate skill distributions and a couple of traits each.

import type { CrewMember, CrewRole } from './types';
import type { Rng } from './rng';
import { CREW_TRAITS } from '../data/traits';
import { RACES } from '../data/races';
import { NAME_POOLS } from '../data/names';

const ROLES: CrewRole[] = [
  'Pilot',
  'Engineer',
  'Negotiator',
  'Gunner',
  'Medic',
  'Diplomat',
  'Scientist',
  'Quartermaster',
];

function alienName(rng: Rng, raceId: string): string {
  const pool: Record<string, string[]> = {
    silicari: NAME_POOLS.silicariSyllables,
    kresh: NAME_POOLS.kreshSyllables,
    aelyn: NAME_POOLS.aelynSyllables,
    voidkin: NAME_POOLS.voidkinSyllables,
    vendari: NAME_POOLS.vendariSyllables,
  };
  const syllables = pool[raceId];
  if (!syllables) {
    return `${rng.pick(NAME_POOLS.givenNames)} ${rng.pick(NAME_POOLS.surnames)}`;
  }
  const count = rng.int(2, 3);
  let name = '';
  for (let i = 0; i < count; i++) name += rng.pick(syllables);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  if (raceId === 'kresh') name += "'tar";
  if (raceId === 'voidkin') name = `${name}-${rng.pick(syllables)}`;
  if (raceId === 'silicari') name = `[${name}]`;
  return name;
}

export interface CrewGenOptions {
  /** Restrict roster to a specific role. */
  role?: CrewRole;
  /** Mean skill level. Default 5. */
  skillCenter?: number;
  /** Skill standard deviation as +/- range. Default 2. */
  skillSpread?: number;
  /** Optional id prefix to keep generated crew ids stable across screens. */
  idPrefix?: string;
}

export function generateCrewMember(rng: Rng, opts: CrewGenOptions = {}): CrewMember {
  const role = opts.role ?? rng.pick(ROLES);
  const race = rng.pick(RACES);
  const center = opts.skillCenter ?? 5;
  const spread = opts.skillSpread ?? 2;
  const skill = Math.max(1, Math.min(10, Math.round(center + rng.range(-spread, spread))));

  const traitCount = rng.chance(0.35) ? 2 : 1;
  const traits = rng.shuffle(CREW_TRAITS).slice(0, traitCount).map((t) => t.id);

  const wage = 8 + skill * 4 + rng.int(0, 6);

  return {
    id: `${opts.idPrefix ?? 'crew'}-${rng.int(0, 99999999).toString(36)}`,
    name: alienName(rng, race.id),
    raceId: race.id,
    role,
    skill,
    wage,
    energy: 'Grounded',
    stress: rng.int(0, 15),
    traitIds: traits,
    resting: false,
  };
}

export function generateHireRoster(rng: Rng, count: number): CrewMember[] {
  const out: CrewMember[] = [];
  for (let i = 0; i < count; i++) {
    out.push(generateCrewMember(rng, { idPrefix: `hire-${i}` }));
  }
  return out;
}

/**
 * Decay stress and refresh energy for crew. Called as part of the daily tick.
 */
export function tickCrew(crew: CrewMember[]): CrewMember[] {
  return crew.map((c) => {
    let stress = c.stress;
    if (c.resting) stress -= 12;
    else stress -= 2;
    stress = Math.max(0, Math.min(100, stress));

    let energy = c.energy;
    if (stress > 80) energy = 'Depleted';
    else if (stress > 60) energy = 'Chaotic';
    else if (stress > 35) energy = 'Grounded';
    else if (stress > 15) energy = 'Focused';
    else energy = 'Radiant';

    return { ...c, stress, energy };
  });
}

/** Skill modifier applied during d20 + skill checks. */
export function effectiveSkill(member: CrewMember): number {
  let skill = member.skill;
  if (member.energy === 'Radiant') skill += 2;
  else if (member.energy === 'Focused') skill += 1;
  else if (member.energy === 'Chaotic') skill -= 1;
  else if (member.energy === 'Depleted') skill -= 3;
  return skill;
}
