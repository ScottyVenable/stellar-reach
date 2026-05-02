// The sentient races of Stellar Reach. Each race has cultural trade biases
// that shape the supply/demand of stations they control.

import type { Race } from '../engine/types';

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Terran Concord',
    adjective: 'Terran',
    description:
      'Pragmatic descendants of Sol. Decentralised corporate states bound by treaty and trade.',
    exports: ['Refined Goods', 'Technology', 'Foodstuffs'],
    imports: ['Raw Materials', 'Energy', 'Luxury'],
    tradeBias: 1.0,
  },
  {
    id: 'vendari',
    name: 'Vendari Houses',
    adjective: 'Vendari',
    description:
      'Aesthete merchant clans whose voidsilk and gemwork command core-world markets. They prize beauty above utility.',
    exports: ['Luxury', 'Cultural', 'Refined Goods'],
    imports: ['Raw Materials', 'Foodstuffs', 'Technology'],
    tradeBias: 1.05,
  },
  {
    id: 'kresh',
    name: 'Kresh Hegemony',
    adjective: 'Kresh',
    description:
      'A militant chitin-armoured species. They fabricate weapons and demand rations to feed their endless legions.',
    exports: ['Weapons', 'Refined Goods'],
    imports: ['Foodstuffs', 'Medical', 'Energy'],
    tradeBias: 0.95,
  },
  {
    id: 'silicari',
    name: 'Silicari Synod',
    adjective: 'Silicari',
    description:
      'Crystalline, semi-collective minds. They trade in pure data, AI substrates, and refined silicates.',
    exports: ['Technology', 'Data', 'Raw Materials'],
    imports: ['Energy', 'Biological', 'Luxury'],
    tradeBias: 1.0,
  },
  {
    id: 'aelyn',
    name: 'Aelyn Bloomkin',
    adjective: 'Aelyn',
    description:
      'Soft-spoken plant-symbionts who grow living spacecraft. Excellent biologists, hopeless miners.',
    exports: ['Biological', 'Medical', 'Foodstuffs'],
    imports: ['Raw Materials', 'Refined Goods', 'Technology'],
    tradeBias: 1.0,
  },
  {
    id: 'voidkin',
    name: 'Voidkin Drift',
    adjective: 'Voidkin',
    description:
      'Nomadic shadow-cult that thrives in lawless reaches. Their ports are markets where anything is for sale.',
    exports: ['Contraband', 'Cultural', 'Data'],
    imports: ['Weapons', 'Medical', 'Luxury'],
    tradeBias: 1.1,
  },
];

export const RACES_BY_ID: Record<string, Race> = Object.fromEntries(RACES.map((r) => [r.id, r]));
