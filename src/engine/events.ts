// Transit event templates. When a ship travels between stations we draw a
// 1d-something number of these events and present them as choice cards.

import type { TransitEvent } from './types';
import type { Rng } from './rng';

export const TRANSIT_EVENTS: TransitEvent[] = [
  {
    id: 'derelict',
    title: 'Derelict freighter',
    description:
      'A long-abandoned cargo hauler tumbles silently across your path. Lights are out. Nav transponder is dead.',
    choices: [
      {
        id: 'engineer',
        label: 'Send the Engineer to crack the cargo bay',
        testRole: 'Engineer',
        dc: 12,
        success: { text: 'You haul out a half-tonne of plasteel plating before life support fails.', cargoDelta: [{ goodId: 'plasteel-plate', units: 4 }], stressDelta: 4 },
        failure: { text: 'A fuel-line ruptures. The Engineer barely makes it back. Your hull takes scarring.', hullDelta: -8, stressDelta: 10 },
      },
      {
        id: 'diplomat',
        label: 'Hail it on every channel before boarding',
        testRole: 'Diplomat',
        dc: 11,
        success: { text: 'A weak distress AI answers; it grants salvage rights for a small fee.', creditsDelta: 480, stressDelta: 0 },
        failure: { text: 'The AI was a lure. Bandits decloak nearby. You burn fuel running.', fuelDelta: -10, stressDelta: 6 },
      },
      { id: 'pass', label: 'Leave it and continue', testRole: null, dc: 0, success: { text: 'You log the wreck and move on.' }, failure: { text: '' } },
    ],
  },
  {
    id: 'pirates',
    title: 'Pirate skiffs on intercept',
    description:
      'Three skiffs vector hard from a debris field. Their hails are static and threats.',
    choices: [
      {
        id: 'gunner',
        label: 'Run the guns hot',
        testRole: 'Gunner',
        dc: 13,
        success: { text: 'Your gunner cracks two skiffs open. The third runs.', creditsDelta: 250, stressDelta: 10 },
        failure: { text: 'They land hits. Shields shred and you bleed cargo.', shieldDelta: -25, hullDelta: -10, stressDelta: 14 },
      },
      {
        id: 'pilot',
        label: 'Outrun them through the dust',
        testRole: 'Pilot',
        dc: 12,
        success: { text: 'A perfect slingshot leaves them eating wake.', stressDelta: 6 },
        failure: { text: 'A dust-choked manifold strains the drive. Fuel burns away.', fuelDelta: -15, stressDelta: 10 },
      },
      {
        id: 'pay',
        label: 'Pay tribute',
        testRole: null,
        dc: 0,
        success: { text: 'You buy passage. Your purse is lighter.', creditsDelta: -350, stressDelta: 4 },
        failure: { text: '' },
      },
    ],
  },
  {
    id: 'anomaly',
    title: 'Subspace anomaly',
    description:
      'A shimmering wound in space distorts your sensors. It pulses in time with your heartbeat.',
    choices: [
      {
        id: 'scientist',
        label: 'Have the Scientist sample it',
        testRole: 'Scientist',
        dc: 13,
        success: { text: 'You bottle data worth a fortune to research stations.', cargoDelta: [{ goodId: 'research-data', units: 2 }], stressDelta: 4 },
        failure: { text: 'The probe vaporises. Sensor banks burn out.', hullDelta: -4, stressDelta: 8 },
      },
      {
        id: 'pilot',
        label: 'Skirt the edge',
        testRole: 'Pilot',
        dc: 11,
        success: { text: 'A clean pass. Drive harmonics ring like a bell.', stressDelta: 0 },
        failure: { text: 'Tidal forces buckle a spar. Hull dents.', hullDelta: -6, stressDelta: 6 },
      },
    ],
  },
  {
    id: 'refugees',
    title: 'Lifeboat with refugees',
    description:
      'A pod of survivors, gaunt and scared, drifts in your sensor cone.',
    choices: [
      {
        id: 'medic',
        label: 'Take them aboard',
        testRole: 'Medic',
        dc: 12,
        success: { text: 'The grateful refugees pay in heirloom relics.', cargoDelta: [{ goodId: 'religious-icons', units: 2 }], stressDelta: 6 },
        failure: { text: 'A stowaway disease scrapes through the crew.', stressDelta: 18 },
      },
      { id: 'pass', label: 'Mark their position and pass', testRole: null, dc: 0, success: { text: 'You log their coords for any rescuer who is listening.', stressDelta: 4 }, failure: { text: '' } },
    ],
  },
  {
    id: 'inspection',
    title: 'Customs inspection',
    description:
      'A patrol cruiser pings you with an inspection request. They lock weapons until you cooperate.',
    choices: [
      {
        id: 'negotiator',
        label: 'Negotiate a fast clearance',
        testRole: 'Negotiator',
        dc: 12,
        success: { text: 'Pleasant conversation; a small "expediting fee" and you are clear.', creditsDelta: -120 },
        failure: { text: 'They tear the ship apart and confiscate restricted cargo.', stressDelta: 10 },
      },
      {
        id: 'pilot',
        label: 'Fake a coolant leak and slip away',
        testRole: 'Pilot',
        dc: 14,
        success: { text: 'A masterful gambit. You vanish into a debris field.', stressDelta: 8 },
        failure: { text: 'They tag your hull. You burn fuel hard to escape.', fuelDelta: -12, hullDelta: -6, stressDelta: 12 },
      },
    ],
  },
  {
    id: 'meteor',
    title: 'Meteor shower',
    description: 'A bright cone of micrometeors strikes your forward arc.',
    choices: [
      {
        id: 'pilot',
        label: 'Dodge through the gaps',
        testRole: 'Pilot',
        dc: 12,
        success: { text: 'You weave the ship through with elegance.', stressDelta: 4 },
        failure: { text: 'Several rocks score the hull.', hullDelta: -8, stressDelta: 6 },
      },
      {
        id: 'engineer',
        label: 'Vent shield capacitors forward',
        testRole: 'Engineer',
        dc: 11,
        success: { text: 'A perfectly timed dump shrugs off the worst.', shieldDelta: -15 },
        failure: { text: 'The capacitors backfire and shields drop.', shieldDelta: -30, hullDelta: -4, stressDelta: 6 },
      },
    ],
  },
];

export function pickTransitEvents(rng: Rng, count: number): TransitEvent[] {
  return rng.shuffle(TRANSIT_EVENTS).slice(0, Math.min(count, TRANSIT_EVENTS.length));
}
