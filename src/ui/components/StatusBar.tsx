interface StatusReadoutProps {
  /** Short label like 'HUL', 'FUL', 'CRG'. Three letters keeps the rail tight. */
  label: string;
  /** Single-character glyph rendered before the label. */
  glyph: string;
  value: number;
  max: number;
  /** Optional warn/alert thresholds as fractions of max. */
  warnAt?: number;
  alertAt?: number;
  /** Use cargo tone (cyan) when set; otherwise the bar tone is derived. */
  tone?: 'hull' | 'fuel' | 'cargo';
}

/**
 * One row in the HUD strip status block: glyph, label, segmented bar, and
 * monospace value. The bar is 12 segments rendered as flex children so the
 * HUD reads like an instrument cluster, not a generic progress bar.
 */
export function StatusReadout({
  label,
  glyph,
  value,
  max,
  warnAt = 0.5,
  alertAt = 0.25,
  tone = 'hull',
}: StatusReadoutProps) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const segCount = 12;
  const litSegs = Math.round(pct * segCount);

  let toneClass = 'sr-ok';
  if (tone === 'hull' || tone === 'fuel') {
    if (pct < alertAt) toneClass = 'sr-alert';
    else if (pct < warnAt) toneClass = 'sr-warn';
  } else if (tone === 'cargo') {
    toneClass = 'sr-cargo';
  }

  return (
    <div className={`sr-row ${toneClass}`} role="group" aria-label={`${label} ${value} of ${max}`}>
      <span className="sr-glyph" aria-hidden="true">{glyph}</span>
      <span className="sr-label">{label}</span>
      <span className="sr-bar" aria-hidden="true">
        {Array.from({ length: segCount }, (_, i) => (
          <span key={i} className={`sr-seg${i < litSegs ? ' on' : ''}`} />
        ))}
      </span>
      <span className="sr-val">
        {String(value).padStart(String(max).length, '0')}
        <span className="sr-val-sep">/</span>
        {max}
      </span>
    </div>
  );
}
