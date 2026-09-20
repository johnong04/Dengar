import { useEffect, useRef, useState } from 'react';
import { Easing, FadeIn, type EntryExitAnimationFunction } from 'react-native-reanimated';

import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * THE MOTION SYSTEM — every duration, curve and stagger in the app.
 *
 * design-system.md §Motion (amended 2026-09-21) is the law this file implements. The entrance ban
 * is lifted; the requirement that motion come from ONE system is not. A screen that invents its own
 * timing is a defect in exactly the way an invented spacing scale is — six screens each guessing
 * 200-ish milliseconds is what makes an app feel assembled rather than designed.
 *
 * Two things this file exists to make impossible:
 *
 * 1. A screen animating at a duration nobody chose.
 * 2. An entrance that ignores `prefers-reduced-motion`. Every helper here takes the reduced flag
 *    and collapses to a plain crossfade — so honouring it is the default path, not a thing each
 *    screen has to remember.
 */

/**
 * Durations, ms. Named for what they DO, never for how long they are: a name like `MS_240` tells
 * the next reader nothing about whether their new animation belongs in it.
 */
export const DUR = {
  /** A control acknowledging a press. Below ~120 ms reads as instant, which is what a press is. */
  press: 120,
  /** A thing changing state in place — a tab going active, a chip swapping. */
  state: 180,
  /** A piece of content arriving. The default for anything entering a screen. */
  enter: 320,
  /** A screen's hero element. The verdict word, the instrument. */
  hero: 420,
  /** A figure counting to its value. Long enough to read as counting, short enough not to wait. */
  count: 700,
  /** The verdict set piece, end to end. The ONLY thing allowed to reach the 900 ms budget. */
  verdict: 900,
} as const;

/**
 * Curves, from Material 3. `emphasizedDecelerate` is the one that makes an entrance feel like an
 * object arriving rather than a value interpolating: it starts fast and settles slowly, which is
 * what mass does.
 */
export const EASE = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasizedDecelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
  emphasizedAccelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
} as const;

/**
 * Stagger step, ms — the gap between consecutive items in a list or series.
 *
 * Deliberately small. The instinct is to reach for 80–100 ms because each item then reads
 * individually; the result is a 14-bar chart taking 1.4 s to draw, which is the entrance that feels
 * like waiting. At 45 ms a series reads as ONE gesture sweeping across, which is the intent.
 */
export const STAGGER = 45;

/** Cap on a stagger's total span, ms. Past this, items share a slot rather than extending the run. */
const STAGGER_CAP = 560;

/**
 * Delay for item `i` of `count`. Compresses automatically once the series is long enough to blow
 * the cap — so a 3-row list and a 28-cell heat grid both finish inside the budget without either
 * caller doing arithmetic.
 */
export function staggerDelay(i: number, count = 0): number {
  const step = count > 1 ? Math.min(STAGGER, STAGGER_CAP / (count - 1)) : STAGGER;
  return Math.round(i * step);
}

/**
 * The standard entrance: rise and fade, or a plain crossfade under reduced motion.
 *
 * `undefined` is returned for the no-animation case rather than a zero-duration animation, because
 * reanimated skips the entering machinery entirely when the prop is absent.
 */
export function enter(
  reduced: boolean,
  opts: { delay?: number; duration?: number; rise?: number } = {},
): EntryExitAnimationFunction | undefined {
  const { delay = 0, duration = DUR.enter, rise = 10 } = opts;
  if (reduced) return FadeIn.duration(DUR.state).delay(delay) as unknown as EntryExitAnimationFunction;
  return FadeIn.duration(duration)
    .delay(delay)
    .easing(EASE.emphasizedDecelerate)
    .withInitialValues({ transform: [{ translateY: rise }] }) as unknown as EntryExitAnimationFunction;
}

/** `enter`, already wired to the reduced-motion preference. The form screens should reach for. */
export function useEnter() {
  const reduced = useReducedMotion();
  return (opts?: { delay?: number; duration?: number; rise?: number }) => enter(reduced, opts);
}

/**
 * A figure counting up to `value`.
 *
 * Why a hook and not a reanimated shared value: the target is TEXT, and reanimated cannot drive the
 * children of a `<Text>` off the UI thread — it would need a re-render per frame either way. This
 * runs on `requestAnimationFrame`, which react-native-web and RN both provide, and re-renders only
 * the one small component that calls it.
 *
 * Reduced motion, or a non-finite value, returns the final figure immediately. So does a value that
 * changes mid-flight: it re-targets from where it is rather than snapping back to zero.
 */
export function useCountUp(value: number, opts: { duration?: number; delay?: number } = {}): number {
  const { duration = DUR.count, delay = 0 } = opts;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const from = useRef(0);

  useEffect(() => {
    if (reduced || !Number.isFinite(value)) {
      setShown(value);
      return;
    }
    const start = from.current;
    let raf = 0;
    let t0 = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      // Ease-out cubic. A LINEAR count is the tell that a number is being animated at you rather
      // than settling: it arrives at its value at full speed and stops dead.
      const eased = 1 - Math.pow(1 - p, 3);
      const next = start + (value - start) * eased;
      from.current = next;
      setShown(next);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };

    timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timer) clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration, delay, reduced]);

  return shown;
}

/**
 * A 0→1 progress ramp on the same clock as `useCountUp`, for anything that is not a number: a bar
 * filling, a series of bars growing, a gradient washing in.
 *
 * Shares the count's easing deliberately — a bar and the figure above it must arrive together, and
 * two curves that are nearly the same read as one of them lagging.
 */
export function useRamp(opts: { duration?: number; delay?: number; enabled?: boolean } = {}): number {
  const { duration = DUR.count, delay = 0, enabled = true } = opts;
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced || !enabled ? 1 : 0);

  useEffect(() => {
    if (reduced || !enabled) {
      setP(1);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / duration);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [duration, delay, reduced, enabled]);

  return p;
}
