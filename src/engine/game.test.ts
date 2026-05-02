import { describe, expect, it } from 'vitest';
import { allStations, beginTravel, buy, newGame, sell } from './game';

describe('game engine', () => {
  it('creates new campaigns with supplied seed and captain', () => {
    const game = newGame({ seed: 'NOVA-5005', captainName: 'Captain Test' });
    expect(game.galaxy.seed).toBe('NOVA-5005');
    expect(game.player.captainName).toBe('Captain Test');
    expect(game.player.credits).toBeGreaterThan(0);
  });

  it('supports buy and sell loops', () => {
    const game = newGame({ seed: 'ORION-6006' });
    const station = game.galaxy.systems[0].stations[0];
    const item = station.market[0];

    const afterBuy = buy(game, item.goodId, 1);
    expect(afterBuy.player.credits).toBeLessThan(game.player.credits);
    expect((afterBuy.player.ship.hold[item.goodId] ?? 0)).toBeGreaterThanOrEqual(1);

    const afterSell = sell(afterBuy, item.goodId, 1);
    expect(afterSell.player.ship.cargo).toBeLessThanOrEqual(afterBuy.player.ship.cargo);
    expect(afterSell.player.credits).toBeGreaterThan(afterBuy.player.credits);
  });

  it('does not begin travel without enough fuel', () => {
    const game = newGame({ seed: 'LYRA-7007' });
    const destination = allStations(game.galaxy).find((s) => s.id !== game.player.locationStationId);
    expect(destination).toBeDefined();

    const noFuel = {
      ...game,
      player: {
        ...game.player,
        ship: { ...game.player.ship, fuel: 0 },
      },
    };

    const result = beginTravel(noFuel, destination!.id, 'safe');
    expect(result.route).toBeNull();
    expect(result.state).toEqual(noFuel);
  });
});
