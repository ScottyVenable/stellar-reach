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
  {
    id: 'nebula-storm',
    title: 'Nebula ion storm',
    description:
      'A sudden ion storm rolls off the nearby nebula, saturating your shields with charge and threatening critical systems.',
    choices: [
      {
        id: 'engineer',
        label: 'Purge shield capacitors to bleed the charge',
        testRole: 'Engineer',
        dc: 12,
        success: { text: 'A clean purge. The storm passes and systems stabilise.', shieldDelta: -10, stressDelta: 4 },
        failure: { text: 'The backflow fries a relay. Hull integrity suffers.', shieldDelta: -20, hullDelta: -10, stressDelta: 10 },
      },
      {
        id: 'pilot',
        label: 'Punch through the storm at full burn',
        testRole: 'Pilot',
        dc: 13,
        success: { text: 'You claw through. Fuel burns hot but the ship holds.', fuelDelta: -8, stressDelta: 6 },
        failure: { text: 'The storm bucks the hull and you lose nav control briefly. Sparks everywhere.', hullDelta: -14, stressDelta: 12 },
      },
      {
        id: 'drift',
        label: 'Drop to minimal power and drift through',
        testRole: null,
        dc: 0,
        success: { text: 'The storm sweeps past. Slow but safe — mostly.', shieldDelta: -5, stressDelta: 2 },
        failure: { text: '' },
      },
    ],
  },
  {
    id: 'trader-convoy',
    title: 'Merchant convoy hail',
    description:
      'A heavily laden merchant convoy broadcasts an open channel, asking if you want to trade surplus cargo at reduced prices.',
    choices: [
      {
        id: 'negotiator',
        label: 'Negotiate a bulk purchase',
        testRole: 'Negotiator',
        dc: 11,
        success: { text: 'You barter hard and offload some goods at a tidy margin.', creditsDelta: 600, stressDelta: 2 },
        failure: { text: 'The convoy captain drives a hard bargain — you walk away with nothing but pleasantries.', stressDelta: 2 },
      },
      {
        id: 'scan',
        label: 'Run a passive sensor scan before responding',
        testRole: 'Scientist',
        dc: 12,
        success: { text: 'Your scan reveals hidden cargo bays packed with contraband — you report them for a bounty.', creditsDelta: 800, stressDelta: 4 },
        failure: { text: 'Your scan is detected. The convoy accelerates away before you can hail.', stressDelta: 3 },
      },
      {
        id: 'wave',
        label: 'Wave them off and continue',
        testRole: null,
        dc: 0,
        success: { text: 'You log the encounter and proceed on course.' },
        failure: { text: '' },
      },
    ],
  },
  {
    id: 'distress-beacon',
    title: 'Distress beacon',
    description:
      'An automated distress beacon pulses from a nearby moon. Someone — or something — is in trouble down there.',
    choices: [
      {
        id: 'medic',
        label: 'Dispatch the Medic in a drop shuttle',
        testRole: 'Medic',
        dc: 12,
        success: { text: 'Your Medic stabilises the survivors. They reward you with rare biological samples.', cargoDelta: [{ goodId: 'biosamples', units: 3 }], stressDelta: 6 },
        failure: { text: 'The shuttle is ambushed — it limps back with hull scoring and a shaken crew.', hullDelta: -8, stressDelta: 14 },
      },
      {
        id: 'pilot',
        label: 'Swoop in fast and grab whoever is there',
        testRole: 'Pilot',
        dc: 13,
        success: { text: 'Lightning extraction. The survivor turns out to be a fugitive scientist who pays handsomely for safe passage.', creditsDelta: 900, stressDelta: 8 },
        failure: { text: 'The landing strut clips a rock. Minor hull damage but the shuttle returns empty.', hullDelta: -6, stressDelta: 8 },
      },
      {
        id: 'ignore',
        label: 'Log the beacon and report it at the next station',
        testRole: null,
        dc: 0,
        success: { text: 'You file the report. Authorities say they will investigate. Probably.', stressDelta: 3 },
        failure: { text: '' },
      },
    ],
  },
];

export function pickTransitEvents(rng: Rng, count: number): TransitEvent[] {
  return rng.shuffle(TRANSIT_EVENTS).slice(0, Math.min(count, TRANSIT_EVENTS.length));
}
