/**
 * Stub for the future audio pass.
 *
 * Returns a stable callback you can call from button onClick / tab change /
 * value-tick handlers. The implementation today is a no-op; the goal is to
 * wire the call sites now so the audio engineer doesn't have to chase every
 * button when sounds are added later. Keep the cue vocabulary small and
 * domain-flavoured (ui-press, ui-tab, ui-confirm, ui-deny, alert).
 *
 * Cues:
 *   ui-press   — generic button click
 *   ui-tab     — tab change / route shift
 *   ui-confirm — primary affirmative action
 *   ui-deny    — denied / disabled / error
 *   ui-tick    — small numeric tick or focus shift
 *   alert      — alert toast
 */
import { useCallback } from 'react';

export type SfxCue =
  | 'ui-press'
  | 'ui-tab'
  | 'ui-confirm'
  | 'ui-deny'
  | 'ui-tick'
  | 'alert';

// Single shared no-op so React hook identity stays stable. When the audio
// engine lands, swap this implementation for one that resolves an
// AudioBuffer per cue and plays it through a shared AudioContext.
const noop = (_cue: SfxCue) => {
  // intentionally empty
};

export function useSfx() {
  return useCallback(noop, []);
}
