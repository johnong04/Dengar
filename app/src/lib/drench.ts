/**
 * The verdict drench: a vertical gradient composed of 28 solid bands — a gradient without a
 * dependency (v2-full-COMMON rule 1 bans new packages; RN has no native linear-gradient).
 *
 * The two endpoints are read from `tailwind.tokens.js`, the single source of truth, so the screen
 * that renders the drench never writes a raw hex (COMMON rule 7). Interpolation is linear in sRGB
 * on purpose: the two stops are the same hue family, so a perceptual space would buy nothing
 * visible and the gated board was built this way.
 */
import tokens from '../../tailwind.tokens.js';

export const DRENCH_BANDS = 28;

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(c: readonly number[]): string {
  return '#' + c.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
}

const FROM = toRgb(tokens.drench['verdict-aedes-from']);
const TO = toRgb(tokens.drench['verdict-aedes-to']);

/** Top → bottom band colors. Index 0 is `verdict-aedes-from`, the last is `verdict-aedes-to`. */
export const DRENCH_STOPS: readonly string[] = Array.from({ length: DRENCH_BANDS }, (_, i) => {
  const t = i / (DRENCH_BANDS - 1);
  return toHex(FROM.map((from, k) => from + (TO[k] - from) * t));
});
