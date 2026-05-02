interface Props {
  /** Short uppercase identifier shown left of the slash, e.g. "MARKET". */
  tag: string;
  /** Function code shown right of the slash, e.g. "FN03". */
  code: string;
  /**
   * Status colour. 'ok' is muted neon green (nominal), 'warn' is amber
   * (caution), 'alert' is muted red (critical), 'idle' is grey.
   */
  status?: 'ok' | 'warn' | 'alert' | 'idle';
  /** Optional right-aligned text, e.g. a live count or rate. */
  rightSlot?: React.ReactNode;
  /** Heading level. Defaults to h2. */
  as?: 'h2' | 'h3';
}

const STATUS_TEXT: Record<NonNullable<Props['status']>, string> = {
  ok: 'NOMINAL',
  warn: 'CAUTION',
  alert: 'ALERT',
  idle: 'IDLE',
};

/**
 * Datapad-style panel header. Renders a small monospace tag like
 * `MARKET / FN03` paired with a status strip + dot, status text, and
 * an optional right-aligned slot. The outer element is a real heading
 * so screen-reader heading navigation continues to land on each panel.
 */
export function PanelHeader({ tag, code, status = 'ok', rightSlot, as = 'h2' }: Props) {
  const Heading = as;
  return (
    <Heading className="panel-header" data-status={status}>
      <span className="panel-header-strip" aria-hidden="true" />
      <span className="panel-header-dot" aria-hidden="true" />
      <span className="panel-header-label">
        <span className="panel-header-tag">{tag}</span>
        <span className="panel-header-sep">/</span>
        <span className="panel-header-code">{code}</span>
      </span>
      <span className="panel-header-status" aria-hidden="true">{STATUS_TEXT[status]}</span>
      {rightSlot ? <span className="panel-header-right">{rightSlot}</span> : null}
    </Heading>
  );
}
