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

/**
 * The Listen instrument: the board's 3-ring geometry (264 / 224 / 184) with the design-system
 * breathing pulse. Two phase-offset primary rings scale 1→1.12 and fade 0.35→0 over 1.6 s while
 * idle; listening tightens the loop (0.9 s, 1→1.06) — faster and smaller reads as "live".
 * Analyzing: the mic is closed, so the live-mic pulse stops — rings hold static while the center
 * copy carries the state.
 *
 * Reduced motion: no animation at all — a single static primary ring at rest opacity.
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
      <Animated.View
        style={[ring1, { pointerEvents: 'none' }]}
        className="absolute h-[264px] w-[264px] rounded-full border border-primary"
      />
      <Animated.View
        style={[ring2, { pointerEvents: 'none' }]}
        className="absolute h-[264px] w-[264px] rounded-full border border-primary"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[264px] w-[264px] rounded-full border border-line"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[224px] w-[224px] rounded-full border border-line"
      />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="h-[184px] w-[184px] items-center justify-center rounded-full bg-surface active:opacity-80"
      >
        {children}
      </Pressable>
    </View>
  );
}
