import { forwardRef } from 'react';
import { type PressableProps, type View, type ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { APressable } from '@/components/animated';
import { DUR, EASE } from '@/lib/motion';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * A control that acknowledges being touched.
 *
 * Every Pressable in the app used `active:opacity-70` — a class that does nothing until the press
 * completes and has no motion in it at all. The result is an app where tapping feels like nothing
 * happened until the next screen appears, which is the single most common reason a competent
 * prototype reads as a prototype.
 *
 * What lands here instead: the control dips in scale and lifts in opacity on press-in, and settles
 * back on press-out, both at `DUR.press`. 0.97 is deliberate — a bigger dip reads as a toy button,
 * a smaller one is invisible on a phone screen at arm's length.
 *
 * `scaleFrom` exists for large surfaces: a full-width sheet button scaled to 0.97 moves its edges
 * ~5 px, which reads as the whole panel wobbling. Big controls take 0.985.
 *
 * ── Two things that are easy to get wrong here ──────────────────────────────────────────────────
 *
 * 1. IT IS BUILT ON `APressable`, NOT ON `Animated.createAnimatedComponent(Pressable)`.
 *    react-native-web drops `className` on an unregistered animated component, so a control keeps
 *    its behaviour and silently loses its background, padding and layout — on the shipping target
 *    only. `components/animated.tsx` registers it with NativeWind's `cssInterop`; that file carries
 *    the full account.
 *
 * 2. Reduced motion removes the SCALE, not the feedback. A user who asked for less motion still
 *    needs to know their tap registered, so the opacity change stays.
 */
export type PressProps = PressableProps & {
  scaleFrom?: number;
  style?: ViewStyle;
};

export const Press = forwardRef<View, PressProps>(function Press(
  { scaleFrom = 0.97, style, children, ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    opacity: 1 - p.value * 0.25,
    transform: [{ scale: reduced ? 1 : 1 - p.value * (1 - scaleFrom) }],
  }));

  return (
    <APressable
      ref={ref as never}
      onPressIn={(e) => {
        p.value = withTiming(1, { duration: DUR.press, easing: EASE.standard });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = withTiming(0, { duration: DUR.press, easing: EASE.standard });
        rest.onPressOut?.(e);
      }}
      {...rest}
      style={[style, animated]}
    >
      {children}
    </APressable>
  );
});
