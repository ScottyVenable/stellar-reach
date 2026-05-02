import { useGameStore } from '../../state/store';
import { SHIP_MODULES, SHIP_MODULES_BY_ID } from '../../data/modules';
import { GOODS_BY_ID } from '../../data/goods';
import type { ShipModuleSlot } from '../../engine/types';

const SLOTS: ShipModuleSlot[] = ['Hull', 'Cargo', 'Drive', 'Shield', 'Sensor', 'Utility'];

function Bar({ value, max, warn }: { value: number; max: number; warn?: boolean }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`bar ${warn ? 'warn' : ''}`}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ShipScreen() {
  const game = useGameStore((s) => s.game)!;
  const installModule = useGameStore((s) => s.installModule);
  const refuel = useGameStore((s) => s.refuel);
  const repair = useGameStore((s) => s.repair);
  const ship = game.player.ship;
  const installed = new Set(ship.installedModuleIds);

  return (
    <div>
      <div className="card">
        <h3>Vessel: {ship.name}</h3>
        <div className="kv">
          <span className="k">Hull</span>
          <span className="v">{ship.hull}/{ship.hullMax}</span>
        </div>
        <Bar value={ship.hull} max={ship.hullMax} warn={ship.hull < ship.hullMax * 0.4} />
        <div className="kv" style={{ marginTop: 8 }}>
          <span className="k">Shield</span>
          <span className="v">{ship.shield}/{ship.shieldMax}</span>
        </div>
        <Bar value={ship.shield} max={ship.shieldMax} />
        <div className="kv" style={{ marginTop: 8 }}>
          <span className="k">Fuel</span>
          <span className="v">{ship.fuel}/{ship.fuelMax}</span>
        </div>
        <Bar value={ship.fuel} max={ship.fuelMax} warn={ship.fuel < ship.fuelMax * 0.25} />
        <div className="kv" style={{ marginTop: 8 }}>
          <span className="k">Cargo</span>
          <span className="v">{ship.cargo}/{ship.cargoMax}</span>
          <span className="k">Speed</span>
          <span className="v">{ship.speed}</span>
          <span className="k">Sensor</span>
          <span className="v">{ship.sensor}</span>
          <span className="k">Evasion</span>
          <span className="v">{ship.evasion}</span>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button onClick={() => refuel(10)}>Refuel +10 (80cr)</button>
          <button onClick={() => refuel(ship.fuelMax - ship.fuel)}>Top off</button>
          <button onClick={() => repair(10)}>Repair +10 (180cr)</button>
        </div>
      </div>

      <div className="card">
        <h3>Cargo Hold</h3>
        {Object.keys(ship.hold).length === 0 && <div className="muted">Hold empty.</div>}
        {Object.entries(ship.hold).map(([gid, units]) => {
          const good = GOODS_BY_ID[gid];
          if (!good) return null;
          return (
            <div key={gid} className="row spread" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div>{good.name}</div>
                <div className="tiny">{good.category} | bulk {good.bulk}</div>
              </div>
              <div className="mono">{units} u</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Modules</h3>
        {SLOTS.map((slot) => {
          const candidates = SHIP_MODULES.filter((m) => m.slot === slot);
          const current = ship.installedModuleIds.find((id) => SHIP_MODULES_BY_ID[id]?.slot === slot);
          return (
            <div key={slot} style={{ marginBottom: 12 }}>
              <div className="tiny">{slot}</div>
              <div className="list">
                {candidates.map((m) => {
                  const isInstalled = installed.has(m.id);
                  const canAfford = game.player.credits >= m.cost;
                  return (
                    <div key={m.id} className="row spread" style={{ padding: '6px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div>
                          {m.name}{' '}
                          {isInstalled && <span className="tag legal">installed</span>}
                        </div>
                        <div className="tiny">{m.description}</div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <span className="mono amber">{m.cost.toLocaleString()}cr</span>
                        <button
                          disabled={isInstalled || !canAfford || (m.id === current)}
                          onClick={() => installModule(m.id)}
                        >
                          Install
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
