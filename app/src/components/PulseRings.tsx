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
 *
 * Reduced motion: no scale at all — a single static ring shifts opacity slowly instead.
 */
type Props = {
  mode: 'idle' | 'listening';
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

  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const dim = useSharedValue(0.35);

  useEffect(() => {
    cancelAnimation(p1);
    cancelAnimation(p2);
    cancelAnimation(dim);
    if (reducedMotion) {
      p1.value = 0;
      p2.value = 0;
      dim.value = 0.35;
      dim.value = withRepeat(
        withTiming(0.12, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      return;
    }
    const pulse = () =>
      withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.cubic) }), -1, false);
    p1.value = 0;
    p2.value = 0;
    p1.value = pulse();
    p2.value = withDelay(duration / 2, pulse());
  }, [duration, reducedMotion, p1, p2, dim]);

  const ring1 = useAnimatedStyle(() =>
    reducedMotion
      ? { opacity: dim.value, transform: [{ scale: 1 }] }
      : {
          opacity: 0.35 * (1 - p1.value),
          transform: [{ scale: 1 + (scaleTo - 1) * p1.value }],
        },
  );
  const ring2 = useAnimatedStyle(() =>
    reducedMotion
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
