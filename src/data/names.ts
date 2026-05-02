// Pools used by procedural name generation. Kept readable and lore-flavoured.

export const NAME_POOLS = {
  systemPrefixes: [
    'Astra', 'Borealis', 'Cygnus', 'Drakon', 'Eridanus', 'Fornax', 'Gemini', 'Hyperion',
    'Indus', 'Janus', 'Kaiyo', 'Lyra', 'Meridian', 'Nimbus', 'Orion', 'Polaris',
    'Quasar', 'Rigel', 'Sirius', 'Triton', 'Umbra', 'Vega', 'Wraith', 'Xenon',
    'Ymir', 'Zenith', 'Aether', 'Bastion', 'Caelum', 'Dyson',
  ],
  systemSuffixes: [
    'Reach', 'Expanse', 'Spur', 'Verge', 'Drift', 'Cradle', 'Belt', 'Fringe',
    'Nebula', 'Veil', 'Run', 'Rift', 'Shoal', 'Hollow', 'Curtain', 'Crown',
  ],
  stationPrefixes: [
    'Halcyon', 'Iron', 'Crimson', 'Silver', 'Ember', 'Frost', 'Twilight', 'Dawn',
    'Echo', 'Ghost', 'Bright', 'Hidden', 'Outer', 'Inner', 'Last', 'Long',
    'Black', 'White', 'Storm', 'Quiet', 'Far', 'Near', 'High', 'Low',
  ],
  stationSuffixes: [
    'Anchorage', 'Hold', 'Junction', 'Spire', 'Citadel', 'Foundry', 'Garden', 'Vault',
    'Watch', 'Way-Post', 'Pier', 'Refuge', 'Outpost', 'Quay', 'Forum', 'Yard',
  ],
  givenNames: [
    'Anya', 'Bram', 'Cyra', 'Dax', 'Elin', 'Fenn', 'Galen', 'Halia', 'Iro', 'Jora',
    'Kael', 'Lira', 'Mira', 'Nox', 'Orin', 'Pell', 'Quinn', 'Rhea', 'Soren', 'Talia',
    'Ulric', 'Vex', 'Wren', 'Xan', 'Yara', 'Zev', 'Asha', 'Calder', 'Dione', 'Erev',
  ],
  surnames: [
    'Vey', 'Korr', 'Tide', 'Ash', 'Vance', 'Solis', 'Marek', 'Helio', 'Drake', 'Yarrow',
    'Quill', 'Brink', 'Hale', 'Cinder', 'Stark', 'Verge', 'Roan', 'Ember', 'Stoll', 'Vale',
  ],
  silicariSyllables: ['ix', 'ka', 'ven', 'ar', 'th', 'ol', 'um', 'qi', 'ze', 'lor'],
  kreshSyllables: ['ka', 'thar', 'voth', 'rax', 'gol', 'shen', 'krall', 'mok', 'hex', 'zar'],
  aelynSyllables: ['li', 'mara', 'sien', 'wi', 'ola', 'rai', 'thalo', 'pen', 'evi', 'syl'],
  voidkinSyllables: ['vex', 'um', 'shi', 'qor', 'nyl', 'thal', 'oz', 'rin', 'phae', 'kor'],
  vendariSyllables: ['mira', 'sen', 'tova', 'lor', 'ven', 'cara', 'pell', 'isi', 'thel', 'ory'],
};

export function buildRaceName(raceId: string, syllables: (n: number) => string[]): string {
  const parts = syllables(2 + Math.floor(Math.random() * 2));
  let name = parts.join('');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  if (raceId === 'kresh') name += "'tar";
  if (raceId === 'voidkin') name = `${name}-${syllables(1)[0]}`;
  return name;
}
