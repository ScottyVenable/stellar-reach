interface Props {
  /** Short uppercase identifier shown left of the slash, e.g. "MARKET". */
  tag: string;
  /** Function code shown right of the slash, e.g. "FN03". */
  code: string;
  /**
   * Status strip colour. 'ok' is muted neon green (nominal),
   * 'warn' is amber (caution), 'alert' is muted red (critical).
   */
  status?: 'ok' | 'warn' | 'alert';
  /** Optional right-aligned text, e.g. a live count or rate. */
  rightSlot?: React.ReactNode;
}

/**
 * Datapad-style panel header. Renders a small monospace tag like
 * `MARKET / FN03` paired with a thin status strip, matching the
 * in-universe ship console UI direction.
 */
export function PanelHeader({ tag, code, status = 'ok', rightSlot }: Props) {
  return (
    <div className="panel-header" data-status={status}>
      <span className="panel-header-strip" aria-hidden="true" />
      <span className="panel-header-label">
        <span className="panel-header-tag">{tag}</span>
        <span className="panel-header-sep">/</span>
        <span className="panel-header-code">{code}</span>
      </span>
      {rightSlot ? <span className="panel-header-right">{rightSlot}</span> : null}
    </div>
  );
}
