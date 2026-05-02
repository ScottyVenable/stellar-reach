import { useEffect, useState } from 'react';
import { useGameStore } from '../../state/store';
import { currentStation, currentSystem } from '../../engine/game';
import { RACES_BY_ID } from '../../data/races';
import { GOODS_BY_ID } from '../../data/goods';
import { StatusReadout } from './StatusBar';
import { Icon } from './Icon';
import { useSfx } from '../hooks/useSfx';

/**
 * Mobile-only pull-up sheet that mirrors the desktop right-rail content.
 * The trigger is a tab handle pinned just above the bottom nav. Tapping
 * the handle, or swiping anywhere on the content, opens the sheet.
 *
 * On viewports >= 960px the trigger and sheet are hidden; the right rail
 * takes over. On mobile this is the only way to peek at hold / news /
 * callsign without leaving the active screen.
 */
export function MobileSheet() {
  const game = useGameStore((s) => s.game);
  const sfx = useSfx();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!game) return null;
  const station = currentStation(game);
  const system = currentSystem(game);
  const race = station ? RACES_BY_ID[station.raceId] : undefined;
  const ship = game.player.ship;
  const news = [...game.news].sort((a, b) => b.day - a.day).slice(0, 3);
  const hold = Object.entries(ship.hold)
    .filter(([, units]) => units > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <>
      <button
        type="button"
        className={`mobile-sheet-handle${open ? ' open' : ''}`}
        onClick={() => {
          sfx('ui-press');
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-controls="mobile-status-sheet"
        aria-label={open ? 'Close status sheet' : 'Open status sheet'}
      >
        <span className="mobile-sheet-grip" aria-hidden="true" />
        <span className="mobile-sheet-handle-label">
          {ship.hull}/{ship.hullMax} HUL · {ship.fuel}/{ship.fuelMax} FUL · {ship.cargo}/{ship.cargoMax} CRG
        </span>
      </button>
      {open ? (
        <div
          id="mobile-status-sheet"
          className="mobile-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Vessel status"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="mobile-sheet">
            <header className="mobile-sheet-header">
              <span className="mobile-sheet-grip" aria-hidden="true" />
              <span>VESSEL STATUS</span>
              <button
                type="button"
                className="ghost icon-only"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </header>
            <section className="mobile-sheet-block">
              <div className="mobile-sheet-eyebrow">CALLSIGN · FN01</div>
              <div className="mobile-sheet-title">{station?.name ?? 'Unknown'}</div>
              <div className="tiny" style={{ marginTop: 4 }}>
                {system?.name} · {system?.region}
              </div>
              <div className="tiny" style={{ marginTop: 2 }}>
                {station?.kind} · {race?.adjective ?? '—'}
              </div>
            </section>
            <section className="mobile-sheet-block">
              <div className="mobile-sheet-eyebrow">VESSEL · FN02</div>
              <div className="mobile-sheet-readouts">
                <StatusReadout label="HUL" glyph="◇" value={ship.hull} max={ship.hullMax} tone="hull" />
                <StatusReadout label="FUL" glyph="∆" value={ship.fuel} max={ship.fuelMax} tone="fuel" />
                <StatusReadout label="CRG" glyph="□" value={ship.cargo} max={ship.cargoMax} tone="cargo" />
              </div>
            </section>
            {hold.length > 0 ? (
              <section className="mobile-sheet-block">
                <div className="mobile-sheet-eyebrow">HOLD · FN02A</div>
                <div className="kv">
                  {hold.map(([gid, units]) => (
                    <div key={gid} style={{ display: 'contents' }}>
                      <span className="k">{GOODS_BY_ID[gid]?.name ?? gid}</span>
                      <span className="v">{units}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {news.length > 0 ? (
              <section className="mobile-sheet-block">
                <div className="mobile-sheet-eyebrow">WIRE · FN05</div>
                <div className="rail-news">
                  {news.map((n) => (
                    <div key={n.id} className="rail-news-item">
                      <div>{n.headline}</div>
                      <div className="meta">D{String(n.day).padStart(3, '0')}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
