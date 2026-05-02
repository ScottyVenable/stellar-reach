// Domain types for Stellar Reach.
//
// All persisted game state is built from these interfaces. They are written
// to be JSON-serializable so saves can round-trip through localStorage.

export type GoodCategory =
  | 'Foodstuffs'
  | 'Raw Materials'
  | 'Refined Goods'
  | 'Technology'
  | 'Medical'
  | 'Luxury'
  | 'Weapons'
  | 'Energy'
  | 'Biological'
  | 'Contraband'
  | 'Data'
  | 'Cultural';

export type Legality = 'legal' | 'restricted' | 'illegal';

export interface Good {
  id: string;
  name: string;
  category: GoodCategory;
  /** Fair galactic-average price in credits. */
  basePrice: number;
  /** Cargo units per single unit of this good. */
  bulk: number;
  legality: Legality;
  description: string;
}

export type StationKind =
  | 'Trade Hub'
  | 'Industrial'
  | 'Agricultural'
  | 'Research'
  | 'Mining'
  | 'Military'
  | 'Frontier Outpost'
  | 'Pleasure Resort'
  | 'Refinery'
  | 'Black Market';

export interface Race {
  id: string;
  name: string;
  /** Short adjective form, e.g. "Vendari" -> "Vendari" */
  adjective: string;
  description: string;
  /** Goods this race tends to produce in surplus (lower prices). */
  exports: GoodCategory[];
  /** Goods this race tends to demand (higher prices). */
  imports: GoodCategory[];
  /** Optional discount/markup multiplier on legal goods. */
  tradeBias: number;
}

export interface MarketEntry {
  goodId: string;
  /** Current price in credits. */
  price: number;
  /** Available units to buy from the station. */
  supply: number;
  /** Units the station is willing to buy. */
  demand: number;
}

export interface Station {
  id: string;
  name: string;
  kind: StationKind;
  raceId: string;
  systemId: string;
  /** Local sentiment 0..100; affects security and prices. */
  prosperity: number;
  /** Position within the system in 2D star-map coordinates. */
  x: number;
  y: number;
  /** Price multipliers per category (1.0 = neutral). */
  categoryBias: Partial<Record<GoodCategory, number>>;
  market: MarketEntry[];
}

export interface StarSystem {
  id: string;
  name: string;
  /** Position on the galactic star map. */
  x: number;
  y: number;
  /** Single-word descriptor: "Core", "Inner", "Frontier", "Lawless". */
  region: 'Core' | 'Inner' | 'Frontier' | 'Lawless';
  stations: Station[];
}

export interface NewsItem {
  id: string;
  /** Day on which the news was published. */
  day: number;
  headline: string;
  body: string;
  /** Affected system id, if any. */
  systemId?: string;
  /** Affected good id, if any. */
  goodId?: string;
  /** Direction of the price effect on the affected good (or category). */
  priceDelta: number;
  /** If a goodId is missing, an entire category may be affected. */
  category?: GoodCategory;
  /** Days until effect decays. */
  duration: number;
}

export type CrewRole =
  | 'Pilot'
  | 'Engineer'
  | 'Negotiator'
  | 'Gunner'
  | 'Medic'
  | 'Diplomat'
  | 'Scientist'
  | 'Quartermaster';

export type EnergyState = 'Radiant' | 'Grounded' | 'Focused' | 'Chaotic' | 'Depleted';

export interface CrewTrait {
  id: string;
  name: string;
  description: string;
  /** Stat modifiers applied while the trait is active. */
  modifiers: Partial<Record<CrewRole | 'Trade' | 'StressGain' | 'StressRecovery', number>>;
}

export interface CrewMember {
  id: string;
  name: string;
  raceId: string;
  role: CrewRole;
  /** Skill rating 1..10 used for event resolution. */
  skill: number;
  /** Wages paid each in-game day. */
  wage: number;
  energy: EnergyState;
  /** 0..100, higher means more stressed. */
  stress: number;
  /** Identifier list of currently applied traits. */
  traitIds: string[];
  /** True if currently confined to the Sensory Deprivation Pod for recovery. */
  resting: boolean;
}

export type ShipModuleSlot = 'Hull' | 'Cargo' | 'Drive' | 'Shield' | 'Sensor' | 'Utility';

export interface ShipModule {
  id: string;
  name: string;
  slot: ShipModuleSlot;
  description: string;
  cost: number;
  /** Stat deltas applied to the ship while installed. */
  effects: {
    cargo?: number;
    fuelMax?: number;
    hullMax?: number;
    shieldMax?: number;
    speed?: number;
    sensor?: number;
    evasion?: number;
  };
}

export interface ShipState {
  name: string;
  cargo: number;
  cargoMax: number;
  fuel: number;
  fuelMax: number;
  hull: number;
  hullMax: number;
  shield: number;
  shieldMax: number;
  speed: number;
  sensor: number;
  evasion: number;
  installedModuleIds: string[];
  /** Mapping of goodId -> units currently in the hold. */
  hold: Record<string, number>;
}

export type CourierStatus = 'In Transit' | 'Completed' | 'Failed';

export interface CourierMission {
  id: string;
  goodId: string;
  units: number;
  fromStationId: string;
  toStationId: string;
  /** Day the mission was dispatched. */
  startDay: number;
  /** Day the mission resolves. */
  endDay: number;
  /** Pay per unit when delivered. */
  payPerUnit: number;
  /** Crew member id captaining the courier vessel (a hired NPC crew). */
  hiredCrewId: string;
  /** Hire fee already paid up-front. */
  hireFee: number;
  status: CourierStatus;
}

export interface LogEntry {
  day: number;
  text: string;
}

export interface GalaxyState {
  seed: string;
  systems: StarSystem[];
  races: Race[];
}

export interface PlayerState {
  captainName: string;
  credits: number;
  ship: ShipState;
  crew: CrewMember[];
  /** Station id where the player is currently docked. */
  locationStationId: string;
  /** Days elapsed since campaign start. */
  day: number;
}

export interface GameState {
  galaxy: GalaxyState;
  player: PlayerState;
  news: NewsItem[];
  missions: CourierMission[];
  /** Pool of NPC crew available to hire at the current station. */
  hireRoster: CrewMember[];
  log: LogEntry[];
  /** Reverse chronological event resolution log for the current trip. */
  pendingEvents: TransitEvent[];
  settings: GameSettings;
}

export interface GameSettings {
  /** If true, the player accumulates daily station fees and crew wages. */
  hardcore: boolean;
}

export type TransitChoiceOutcome = {
  text: string;
  creditsDelta?: number;
  hullDelta?: number;
  shieldDelta?: number;
  fuelDelta?: number;
  cargoDelta?: { goodId: string; units: number }[];
  stressDelta?: number;
};

export interface TransitChoice {
  id: string;
  label: string;
  /** The crew role tested by this choice, or null for an automatic option. */
  testRole: CrewRole | null;
  /** Difficulty class on a d20 + skill check. */
  dc: number;
  success: TransitChoiceOutcome;
  failure: TransitChoiceOutcome;
}

export interface TransitEvent {
  id: string;
  title: string;
  description: string;
  choices: TransitChoice[];
}
