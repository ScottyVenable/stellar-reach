// Static catalogue of tradable goods. Carefully sized so the player has a
// rich market to navigate without overwhelming the UI: 36 goods across 12
// categories (3 per category on average).

import type { Good } from '../engine/types';

export const GOODS: Good[] = [
  // Foodstuffs
  { id: 'bio-rations', name: 'Bio-Rations', category: 'Foodstuffs', basePrice: 18, bulk: 1, legality: 'legal', description: 'Vat-grown protein bricks. Bland but cheap.' },
  { id: 'hydroponic-grain', name: 'Hydroponic Grain', category: 'Foodstuffs', basePrice: 32, bulk: 1, legality: 'legal', description: 'Grain cultivated in orbital ag-domes.' },
  { id: 'gourmet-spice', name: 'Gourmet Spice', category: 'Foodstuffs', basePrice: 240, bulk: 1, legality: 'legal', description: 'Rare aromatic compounds prized by core-world chefs.' },

  // Raw Materials
  { id: 'iron-ore', name: 'Iron Ore', category: 'Raw Materials', basePrice: 14, bulk: 2, legality: 'legal', description: 'Crude ore awaiting refinement.' },
  { id: 'silicates', name: 'Silicates', category: 'Raw Materials', basePrice: 22, bulk: 1, legality: 'legal', description: 'Bulk silicon for fabrication lines.' },
  { id: 'rare-earths', name: 'Rare Earth Elements', category: 'Raw Materials', basePrice: 180, bulk: 1, legality: 'legal', description: 'Lanthanide-series metals critical for high-end electronics.' },

  // Refined Goods
  { id: 'plasteel-plate', name: 'Plasteel Plating', category: 'Refined Goods', basePrice: 90, bulk: 2, legality: 'legal', description: 'Composite hull plating used everywhere from freighters to fortresses.' },
  { id: 'machine-parts', name: 'Machine Parts', category: 'Refined Goods', basePrice: 120, bulk: 1, legality: 'legal', description: 'Generic mechanical assemblies and replacement components.' },
  { id: 'polymer-textiles', name: 'Polymer Textiles', category: 'Refined Goods', basePrice: 60, bulk: 1, legality: 'legal', description: 'Smart fabrics with embedded thermal regulation.' },

  // Technology
  { id: 'comm-relays', name: 'Comm Relays', category: 'Technology', basePrice: 320, bulk: 1, legality: 'legal', description: 'Subspace transceivers for long-range communication.' },
  { id: 'ai-cores', name: 'AI Cores', category: 'Technology', basePrice: 1450, bulk: 1, legality: 'restricted', description: 'Crystalline cognitive substrates. Watched by core-world authorities.' },
  { id: 'nav-charts', name: 'Encrypted Nav Charts', category: 'Technology', basePrice: 280, bulk: 1, legality: 'legal', description: 'Updated star charts with risk overlays.' },

  // Medical
  { id: 'medkits', name: 'Medkits', category: 'Medical', basePrice: 95, bulk: 1, legality: 'legal', description: 'Standard field medical supplies.' },
  { id: 'gene-therapy', name: 'Gene Therapy Vials', category: 'Medical', basePrice: 720, bulk: 1, legality: 'restricted', description: 'Targeted retroviral treatments for hereditary diseases.' },
  { id: 'med-stims', name: 'Med-Stims', category: 'Medical', basePrice: 110, bulk: 1, legality: 'restricted', description: 'Combat stimulants. Helpful, habit-forming.' },

  // Luxury
  { id: 'starwine', name: 'Starwine', category: 'Luxury', basePrice: 380, bulk: 1, legality: 'legal', description: 'Wine fermented at near-zero gravity.' },
  { id: 'silk-tapestry', name: 'Voidsilk Tapestry', category: 'Luxury', basePrice: 950, bulk: 1, legality: 'legal', description: 'Hand-loomed by the Vendari guild houses.' },
  { id: 'gemstones', name: 'Cut Gemstones', category: 'Luxury', basePrice: 1100, bulk: 1, legality: 'legal', description: 'Precision-cut precious stones.' },

  // Weapons
  { id: 'sidearms', name: 'Sidearms', category: 'Weapons', basePrice: 220, bulk: 1, legality: 'restricted', description: 'Personal-defense pulse pistols.' },
  { id: 'mil-rifles', name: 'Military Rifles', category: 'Weapons', basePrice: 540, bulk: 1, legality: 'restricted', description: 'Surplus standard-issue infantry rifles.' },
  { id: 'plasma-cannon', name: 'Plasma Cannons', category: 'Weapons', basePrice: 2400, bulk: 2, legality: 'illegal', description: 'Ship-grade weapons. Carrying these is a one-way ticket to a cell.' },

  // Energy
  { id: 'fusion-cells', name: 'Fusion Cells', category: 'Energy', basePrice: 75, bulk: 1, legality: 'legal', description: 'Modular power packs.' },
  { id: 'antimatter', name: 'Antimatter Capsules', category: 'Energy', basePrice: 1800, bulk: 1, legality: 'restricted', description: 'Magnetic-bottle antimatter, the lifeblood of capital ships.' },
  { id: 'helium-3', name: 'Helium-3', category: 'Energy', basePrice: 260, bulk: 1, legality: 'legal', description: 'Mined from gas giants, fuels civilian fusion drives.' },

  // Biological
  { id: 'biosamples', name: 'Bio-Samples', category: 'Biological', basePrice: 140, bulk: 1, legality: 'legal', description: 'Catalogued flora and microfauna for research.' },
  { id: 'xeno-fungus', name: 'Xeno-Fungus', category: 'Biological', basePrice: 410, bulk: 1, legality: 'restricted', description: 'Psychoactive spores from Frontier worlds.' },
  { id: 'live-livestock', name: 'Live Livestock', category: 'Biological', basePrice: 60, bulk: 2, legality: 'legal', description: 'Hardy animal stock for colony worlds. Smells.' },

  // Contraband
  { id: 'narcotics', name: 'Black Lotus', category: 'Contraband', basePrice: 880, bulk: 1, legality: 'illegal', description: 'A potent narcotic. Customs scanners hate it.' },
  { id: 'forged-credentials', name: 'Forged Credentials', category: 'Contraband', basePrice: 620, bulk: 1, legality: 'illegal', description: 'False identities and shipping manifests.' },
  { id: 'stolen-art', name: 'Stolen Art', category: 'Contraband', basePrice: 1700, bulk: 1, legality: 'illegal', description: 'Beautiful, irreplaceable, very illegal.' },

  // Data
  { id: 'market-feeds', name: 'Market Feeds', category: 'Data', basePrice: 90, bulk: 1, legality: 'legal', description: 'Real-time commodity intelligence packets.' },
  { id: 'research-data', name: 'Research Data', category: 'Data', basePrice: 360, bulk: 1, legality: 'legal', description: 'Peer-reviewed datasets and findings.' },
  { id: 'corp-secrets', name: 'Corporate Secrets', category: 'Data', basePrice: 1250, bulk: 1, legality: 'illegal', description: 'Stolen trade secrets. Worth a fortune to the right buyer.' },

  // Cultural
  { id: 'religious-icons', name: 'Religious Icons', category: 'Cultural', basePrice: 200, bulk: 1, legality: 'legal', description: 'Crafted devotional items.' },
  { id: 'ancient-relics', name: 'Ancient Relics', category: 'Cultural', basePrice: 2100, bulk: 1, legality: 'restricted', description: 'Artefacts of vanished civilisations. Often haunted by export law.' },
  { id: 'live-music', name: 'Live Performance Recs', category: 'Cultural', basePrice: 80, bulk: 1, legality: 'legal', description: 'Concert recordings hand-mixed by touring artists.' },
];

export const GOODS_BY_ID: Record<string, Good> = Object.fromEntries(GOODS.map((g) => [g.id, g]));

export function goodsByCategory(cat: import('../engine/types').GoodCategory): Good[] {
  return GOODS.filter((g) => g.category === cat);
}
