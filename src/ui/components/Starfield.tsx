import { useMemo } from 'react';
import { createRng } from '../../engine/rng';

interface Props {
  /** Stable seed for the field. Defaults to a fixed value so the title
   *  field is identical between mounts. */
  seed?: string;
  /** How many stars to render. Higher counts blow out gpu compositing on
   *  low-end mobile, so default is conservative. */
  count?: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle: number;
  delay: number;
}

const DEFAULT_COUNT = 110;

/**
 * Deterministic starfield rendered as absolutely-positioned divs. The
 * positions are seeded by the seeded `rng` so the field is reproducible
 * and we never call Math.random. A handful of stars get a CSS twinkle
 * animation; the rest sit static so we don't repaint the whole field
 * every frame on mobile.
 */
export function Starfield({ seed = 'STELLAR-REACH-TITLE', count = DEFAULT_COUNT }: Props) {
  const stars = useMemo(() => {
    const rng = createRng(seed);
    const out: Star[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: rng.range(0, 100),
        y: rng.range(0, 100),
        r: rng.range(0.5, 1.8),
        o: rng.range(0.35, 0.95),
        twinkle: rng.next() < 0.18 ? 1 : 0,
        delay: rng.range(0, 6),
      });
    }
    return out;
  }, [seed, count]);

  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield-horizon" />
      <div className="starfield-grid" />
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star${s.twinkle ? ' twinkle' : ''}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.r}px`,
            height: `${s.r}px`,
            opacity: s.o,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
