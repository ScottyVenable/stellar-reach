// Galactic news generator.
//
// Every day we may publish 0-2 news items that perturb the economy. Each item
// targets either a single good or an entire category, optionally restricted
// to one star system, and decays after a few days.

import type { GalaxyState, GoodCategory, NewsItem } from './types';
import type { Rng } from './rng';
import { GOODS } from '../data/goods';

const HEADLINE_TEMPLATES: Array<{
  headline: string;
  body: string;
  delta: number;
  duration: [number, number];
}> = [
  {
    headline: 'Solar flare devastates {system} ag-domes',
    body: 'Crops are ash. Foodstuffs are scarce until shipments arrive.',
    delta: 0.6,
    duration: [4, 7],
  },
  {
    headline: 'Pirate gangs choke {system} shipping lanes',
    body: 'Insurance premiums spike. Refined goods see steep markups.',
    delta: 0.35,
    duration: [3, 5],
  },
  {
    headline: 'Industrial accord lowers {system} parts prices',
    body: 'A factories pact undercuts black-market machine parts.',
    delta: -0.25,
    duration: [4, 6],
  },
  {
    headline: 'Plague outbreak in {system} drives demand for medical supplies',
    body: 'Field hospitals are bidding double for medkits and gene therapy.',
    delta: 0.5,
    duration: [4, 7],
  },
  {
    headline: 'Festival of the Long Night approaches in {system}',
    body: 'Luxury and cultural goods flood the markets at premium prices.',
    delta: 0.3,
    duration: [3, 6],
  },
  {
    headline: 'Ore strike floods {system} refineries',
    body: 'Raw material prices crash; refiners rejoice.',
    delta: -0.4,
    duration: [4, 7],
  },
  {
    headline: 'Corporate war escalates over {system} data archives',
    body: 'Encrypted data and corporate secrets command record prices.',
    delta: 0.5,
    duration: [3, 5],
  },
  {
    headline: 'Customs sweep across {system} squeezes contraband',
    body: 'Black-market stocks dry up. Prices for narcotics surge.',
    delta: 0.45,
    duration: [3, 5],
  },
  {
    headline: 'Drought in {system} halves Helium-3 mining',
    body: 'Energy prices climb sector-wide.',
    delta: 0.4,
    duration: [4, 6],
  },
  {
    headline: 'Aelyn bloomships seed {system} bio-markets',
    body: 'Biological goods arrive in glut.',
    delta: -0.3,
    duration: [4, 7],
  },
];

const CATEGORY_BY_TEMPLATE: GoodCategory[] = [
  'Foodstuffs',
  'Refined Goods',
  'Refined Goods',
  'Medical',
  'Luxury',
  'Raw Materials',
  'Data',
  'Contraband',
  'Energy',
  'Biological',
];

let counter = 0;

export function generateNews(rng: Rng, day: number, galaxy: GalaxyState): NewsItem[] {
  const out: NewsItem[] = [];
  // Most days publish either 0 or 1 stories; occasionally 2.
  const count = rng.chance(0.55) ? 1 : rng.chance(0.5) ? 2 : 0;
  for (let i = 0; i < count; i++) {
    const idx = rng.int(0, HEADLINE_TEMPLATES.length - 1);
    const tmpl = HEADLINE_TEMPLATES[idx];
    const sys = rng.pick(galaxy.systems);
    const headline = tmpl.headline.replace('{system}', sys.name);
    // 60% category-wide, 40% targeted at a specific good in that category.
    const category = CATEGORY_BY_TEMPLATE[idx];
    const targeted = rng.chance(0.4);
    let goodId: string | undefined;
    if (targeted) {
      const candidates = GOODS.filter((g) => g.category === category);
      goodId = candidates.length > 0 ? rng.pick(candidates).id : undefined;
    }
    const duration = rng.int(tmpl.duration[0], tmpl.duration[1]);
    out.push({
      id: `news-${day}-${counter++}`,
      day,
      headline,
      body: tmpl.body,
      systemId: sys.id,
      goodId,
      category: goodId ? undefined : category,
      priceDelta: tmpl.delta,
      duration,
    });
  }
  return out;
}

/** Decrement durations and drop expired news items. */
export function ageNews(news: NewsItem[]): NewsItem[] {
  return news
    .map((n) => ({ ...n, duration: n.duration - 1 }))
    .filter((n) => n.duration > 0);
}
