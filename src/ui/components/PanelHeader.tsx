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
  /**
   * Heading level. Each screen is one logical section, so panels
   * default to `h2`. Pass `h3` for nested panels inside a screen that
   * already owns its own `h2`.
   */
  as?: 'h2' | 'h3';
}

/**
 * Datapad-style panel header. Renders a small monospace tag like
 * `MARKET / FN03` paired with a thin status strip, matching the
 * in-universe ship console UI direction. The outer element is a real
 * heading (default `h2`) so screen-reader heading navigation continues
 * to land on each panel title.
 */
export function PanelHeader({ tag, code, status = 'ok', rightSlot, as = 'h2' }: Props) {
  const Heading = as;
  return (
    <Heading className="panel-header" data-status={status}>
      <span className="panel-header-strip" aria-hidden="true" />
      <span className="panel-header-label">
        <span className="panel-header-tag">{tag}</span>
        <span className="panel-header-sep">/</span>
        <span className="panel-header-code">{code}</span>
      </span>
      {rightSlot ? <span className="panel-header-right">{rightSlot}</span> : null}
    </Heading>
  );
}
