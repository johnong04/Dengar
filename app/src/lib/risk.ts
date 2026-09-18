import type { Copy } from '@/copy';
import type { Tone } from '@/data/district';

/**
 * A neighbourhood's risk band, as the word a citizen actually wants plus the tokens that carry it.
 *
 * Lives here rather than inside `/area` because TWO screens state it now — the area screen and the
 * capture screen's footer row — and a citizen who reads "Watch" on one and "Raised" on the other
 * has been shown two different answers to the same question. One function, one source.
 *
 * Read off the seeded `tone` (design-system.md: "one number, one verdict, one action"), never off
 * an invented count threshold.
 *
 * `alert` does NOT become aedes-red here: red is reserved for a positive Aedes *verdict* on this
 * user's own capture (design-system.md rule 5). A neighbourhood risk band is not a verdict, so an
 * elevated area wears `caution` and a clear one wears `ok`. The WORD carries the level; the colour
 * carries only elevated-vs-clear.
 */
export type Risk = { word: string; text: string; dot: string };

export function riskOf(c: Copy): Record<Tone, Risk> {
  return {
    alert: { word: c.area.riskRaised, text: 'text-caution', dot: 'bg-caution' },
    caution: { word: c.area.riskWatch, text: 'text-caution', dot: 'bg-caution' },
    neutral: { word: c.area.riskLow, text: 'text-ok', dot: 'bg-ok' },
  };
}
