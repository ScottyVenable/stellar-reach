import { describe, expect, it } from 'vitest';
import { allStations, findStation, findSystemOfStation, generateGalaxy } from './galaxy';

describe('galaxy generation', () => {
  it('generates deterministic galaxy layouts for the same seed', () => {
    const a = generateGalaxy('ORION-1001', { systemCount: 6, avgStationsPerSystem: 2 });
    const b = generateGalaxy('ORION-1001', { systemCount: 6, avgStationsPerSystem: 2 });
    expect(a).toEqual(b);
  });

  it('exposes stations through helpers', () => {
    const galaxy = generateGalaxy('LYRA-2222', { systemCount: 5, avgStationsPerSystem: 2 });
    const stations = allStations(galaxy);
    expect(stations.length).toBeGreaterThan(0);

    const station = stations[0];
    expect(findStation(galaxy, station.id)?.id).toBe(station.id);
    expect(findSystemOfStation(galaxy, station.id)?.id).toBe(station.systemId);
  });
});
