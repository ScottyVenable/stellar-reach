// Ship modules the player can install in dock. Each module slots into a fixed
// hardpoint; installing a new module replaces the previous one in that slot.

import type { ShipModule } from '../engine/types';

export const SHIP_MODULES: ShipModule[] = [
  // Hull
  { id: 'hull-i', name: 'Reinforced Frame I', slot: 'Hull', cost: 0, description: 'Stock light freighter chassis.', effects: { hullMax: 60 } },
  { id: 'hull-ii', name: 'Reinforced Frame II', slot: 'Hull', cost: 4500, description: 'Welded structural lattice for combat zones.', effects: { hullMax: 100 } },
  { id: 'hull-iii', name: 'Reinforced Frame III', slot: 'Hull', cost: 15000, description: 'Aelyn living-bone composite. Self-healing welds.', effects: { hullMax: 160 } },

  // Cargo
  { id: 'cargo-i', name: 'Standard Hold', slot: 'Cargo', cost: 0, description: 'Basic 20-unit cargo bay.', effects: { cargo: 20 } },
  { id: 'cargo-ii', name: 'Expanded Hold', slot: 'Cargo', cost: 3500, description: 'Sacrifices crew quarters for 50 cargo units.', effects: { cargo: 50 } },
  { id: 'cargo-iii', name: 'Industrial Hold', slot: 'Cargo', cost: 12000, description: 'A genuine freighter spine. 100 cargo units.', effects: { cargo: 100 } },

  // Drive
  { id: 'drive-i', name: 'Civilian Drive', slot: 'Drive', cost: 0, description: 'Standard fusion drive. Reliable, slow.', effects: { speed: 1, fuelMax: 80 } },
  { id: 'drive-ii', name: 'Hyper Drive Mk II', slot: 'Drive', cost: 5500, description: 'Tuned hyper-drive with overcharge bleed.', effects: { speed: 2, fuelMax: 120 } },
  { id: 'drive-iii', name: 'Antimatter Drive', slot: 'Drive', cost: 18000, description: 'Class-A antimatter core. Cuts transit times in half.', effects: { speed: 3, fuelMax: 180 } },

  // Shield
  { id: 'shield-i', name: 'Static Field', slot: 'Shield', cost: 0, description: 'Cheap kinetic deflector.', effects: { shieldMax: 30 } },
  { id: 'shield-ii', name: 'Layered Field', slot: 'Shield', cost: 4200, description: 'Multi-layer deflectors with overlap pattern.', effects: { shieldMax: 70 } },
  { id: 'shield-iii', name: 'Resonant Field', slot: 'Shield', cost: 13500, description: 'Silicari resonance shield. Phase-tuned.', effects: { shieldMax: 130 } },

  // Sensor
  { id: 'sensor-i', name: 'Civilian Scanner', slot: 'Sensor', cost: 0, description: 'Basic short-range scanner suite.', effects: { sensor: 1 } },
  { id: 'sensor-ii', name: 'Long-Range Array', slot: 'Sensor', cost: 3000, description: 'Spots pirates earlier and reveals hidden cargo.', effects: { sensor: 2 } },
  { id: 'sensor-iii', name: 'Quantum Sweep', slot: 'Sensor', cost: 10000, description: 'Subspace anomaly detection. Reveals derelicts and contraband.', effects: { sensor: 3 } },

  // Utility
  { id: 'utility-pod', name: 'Sensory Deprivation Pod', slot: 'Utility', cost: 2500, description: 'Stress recovery for the crew. Highly recommended.', effects: { evasion: 0 } },
  { id: 'utility-cloak', name: 'Stealth Coating', slot: 'Utility', cost: 8000, description: 'Refractive paint that fools cheap scanners.', effects: { evasion: 2 } },
  { id: 'utility-medbay', name: 'Auto-Medbay', slot: 'Utility', cost: 6000, description: 'Reduces stress accumulated during transit events.', effects: { evasion: 1 } },
];

export const SHIP_MODULES_BY_ID: Record<string, ShipModule> = Object.fromEntries(
  SHIP_MODULES.map((m) => [m.id, m]),
);

export function defaultStarterShipModuleIds(): string[] {
  return ['hull-i', 'cargo-i', 'drive-i', 'shield-i', 'sensor-i'];
}
