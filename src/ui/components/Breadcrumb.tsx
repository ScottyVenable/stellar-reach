interface Props {
  /** Section name shown in display caps, e.g. "MARKET". */
  section: string;
  /** One-line context help / tagline shown after the section name. */
  help?: string;
  /** Optional right-aligned tag, e.g. function code "FN03". */
  tag?: string;
}

/**
 * Small breadcrumb / contextual help strip rendered at the top of every
 * desktop screen viewport. On mobile the breadcrumb still renders; the
 * extra context line helps players orient themselves on small screens
 * where the section icon is the only other label.
 */
export function Breadcrumb({ section, help, tag }: Props) {
  return (
    <div className="breadcrumb" aria-label="Section context">
      <span className="crumb-section">{section}</span>
      {help ? (
        <>
          <span className="crumb-sep">/</span>
          <span className="crumb-help">{help}</span>
        </>
      ) : null}
      <span className="crumb-spacer" />
      {tag ? <span className="crumb-tag">{tag}</span> : null}
    </div>
  );
}
