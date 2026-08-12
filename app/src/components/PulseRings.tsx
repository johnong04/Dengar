import { type ReactNode, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import tokens from '../../tailwind.tokens.js';

/**
 * The Listen instrument. Warm-board geometry (design-system.md §Warm revision): the hairline rings
 * became two FILLED halo rings (`halo-outer` 264 / `halo-inner` 224) around a saturated `primary`
 * disc (184) — light gathering on the one control, instead of three thin outlines.
 *
 * Motion is unchanged and is law (§Motion): two phase-offset primary rims scale 1→1.12 and fade
 * 0.35→0 over 1.6 s while idle; listening tightens the loop (0.9 s, 1→1.06) — faster and smaller
 * reads as "live". Analyzing: the mic is closed, so the live-mic pulse stops — the rims hold static
 * while the center copy carries the state.
 *
 * Reduced motion: no animation at all — a single static primary rim at rest opacity.
 */
type Props = {
  mode: 'idle' | 'listening' | 'analyzing';
  reducedMotion: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children: ReactNode;
};

const RING = 264;

// Token value read through the single palette source, so no hex literal enters a screen file.
const RIM = {
  position: 'absolute' as const,
  width: RING,
  height: RING,
  borderRadius: RING / 2,
  borderWidth: 1,
  borderColor: tokens.colors.primary,
  pointerEvents: 'none' as const,
};

export function PulseRings({
  mode,
  reducedMotion,
  onPress,
  disabled,
  accessibilityLabel,
  children,
}: Props) {
  const tight = mode === 'listening';
  const duration = tight ? 900 : 1600;
  const scaleTo = tight ? 1.06 : 1.12;
  // Idle breathes (invitation), listening tightens (live mic). Analyzing pulses nothing: the mic
  // is closed, and a moving ring over "reading wingbeat" would claim a liveness that isn't there.
  const still = reducedMotion || mode === 'analyzing';

  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(p1);
    cancelAnimation(p2);
    p1.value = 0;
    p2.value = 0;
    if (still) return;
    const pulse = () =>
      withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.cubic) }), -1, false);
    p1.value = pulse();
    p2.value = withDelay(duration / 2, pulse());
  }, [duration, still, p1, p2]);

  const ring1 = useAnimatedStyle(() =>
    still
      ? { opacity: 0.35, transform: [{ scale: 1 }] }
      : {
          opacity: 0.35 * (1 - p1.value),
          transform: [{ scale: 1 + (scaleTo - 1) * p1.value }],
        },
  );
  const ring2 = useAnimatedStyle(() =>
    still
      ? { opacity: 0 }
      : {
          opacity: 0.35 * (1 - p2.value),
          transform: [{ scale: 1 + (scaleTo - 1) * p2.value }],
        },
  );

  return (
    <View className="items-center justify-center" style={{ width: RING, height: RING }}>
      {/* filled halos — the depth the warm board replaced the hairlines with */}
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[264px] w-[264px] rounded-full bg-halo-outer"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[224px] w-[224px] rounded-full bg-halo-inner"
      />
      {/* breathing rims — drawn over the halos so they read as they expand past the outer edge.
          Geometry lives in `style`, NOT className: react-native-web silently drops className on a
          reanimated Animated.View (same trap documented at result.tsx's drench), which left both
          rims at 0×0 with no border — an animation running on nothing. */}
      <Animated.View style={[ring1, RIM]} />
      <Animated.View style={[ring2, RIM]} />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="h-[184px] w-[184px] items-center justify-center rounded-full bg-primary active:opacity-90"
      >
        {children}
      </Pressable>
    </View>
  );
}
