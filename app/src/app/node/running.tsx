import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCopy } from '@/copy';
import { useReducedMotion } from '@/lib/useReducedMotion';
import tokens from '../../../tailwind.tokens.js';

/**
 * The "leave this phone here" state — a static node at work (specs.md §2, secondary mode).
 *
 * Read across a room, not at arm's length: this is the only screen in the app whose viewer is
 * metres away, and it is a video shot. Hence the detection count at 56 px — the SECOND sanctioned
 * use of the top of the type scale (design-system.md §Type reserves 56 for the verdict word; this
 * is the documented exception, and the reason is the same one: it is the single number the screen
 * exists to deliver). Everything else stays inside the scale: 34 for the two secondary readouts,
 * 30 for the instruction, 13/12 mono for labels.
 *
 * The counter is SEEDED, not real (COMMON rule 8): the `simulated` marker in the status row is not
 * decoration, it is the disclosure.
 */

/**
 * Simulated detection cadence — one arrival every 8 s, so the count visibly moves within a shot.
 * A real node does NOT run at this rate: the sanctioned scenario is 14 detections over 72 h
 * (specs §9). The compression is therefore disclosed on screen as `simulated · demo speed`, not
 * just `simulated` — a bare count ticking this fast would imply a rate §9 cannot source, which is
 * the same class of defect as inventing the figure outright (COMMON rules 3 and 8).
 */
const TICK_MS = 8000;
/** Battery: starts here and loses a point every 2 min of elapsed time. */
const BATTERY_START = 84;
const BATTERY_MINUTES_PER_POINT = 2;

const RING = 264;

// Read through the single palette source so no hex literal enters a screen file.
const RIM = {
  position: 'absolute' as const,
  width: RING,
  height: RING,
  borderRadius: RING / 2,
  borderWidth: 1,
  borderColor: tokens.colors.primary,
  pointerEvents: 'none' as const,
};

/**
 * Live-mic rims — the capture instrument's `listening` motion, unchanged and law (§Motion): 0.9 s,
 * scale 1→1.06, opacity .35→0, two rims phase-offset by half the loop. Faster and smaller than the
 * idle breath is what reads as "the microphone is open".
 *
 * Geometry lives on `style`, NOT className: react-native-web silently drops className on a
 * reanimated Animated.View, which once left both rims at 0×0 with no border — an animation running
 * on nothing, invisible for six slices (see components/PulseRings.tsx).
 */
function ListeningHalo({ still, children }: { still: boolean; children: React.ReactNode }) {
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(p1);
    cancelAnimation(p2);
    p1.value = 0;
    p2.value = 0;
    if (still) return;
    const pulse = () =>
      withRepeat(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }), -1, false);
    p1.value = pulse();
    p2.value = withDelay(450, pulse());
  }, [still, p1, p2]);

  const ring1 = useAnimatedStyle(() =>
    still
      ? { opacity: 0.35, transform: [{ scale: 1 }] }
      : { opacity: 0.35 * (1 - p1.value), transform: [{ scale: 1 + 0.06 * p1.value }] },
  );
  const ring2 = useAnimatedStyle(() =>
    still
      ? { opacity: 0 }
      : { opacity: 0.35 * (1 - p2.value), transform: [{ scale: 1 + 0.06 * p2.value }] },
  );

  return (
    <View className="items-center justify-center" style={{ width: RING, height: RING }}>
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[264px] w-[264px] rounded-full bg-halo-outer"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute h-[224px] w-[224px] rounded-full bg-halo-inner"
      />
      <Animated.View testID="node-rim-1" style={[ring1, RIM]} />
      <Animated.View testID="node-rim-2" style={[ring2, RIM]} />
      <View className="items-center justify-center">{children}</View>
    </View>
  );
}

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function NodeRunning() {
  const c = useCopy();
  const [elapsed, setElapsed] = useState(0);
  const [detections, setDetections] = useState(0);
  const reducedMotion = useReducedMotion();
  const startedAt = useRef(Date.now());

  // One wall-clock timer drives elapsed; detections derive from it, so a background tab that
  // throttles timers still resumes with a consistent count instead of a stalled one.
  useEffect(() => {
    const id = setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(Math.floor(ms / 1000));
      setDetections(Math.floor(ms / TICK_MS));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const battery = Math.max(0, BATTERY_START - Math.floor(elapsed / 60 / BATTERY_MINUTES_PER_POINT));

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* status row — app mark, and the honest disclosure that the count is seeded */}
        <View className="mt-4 h-8 flex-row items-center justify-between">
          <Text className="font-plex-semibold text-[17px] text-ink">{c.common.brand}</Text>
          <View className="rounded-pill bg-surface px-3 py-1">
            <Text className="font-mono text-[12px] text-muted">{c.node.demoSpeed}</Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          {/* listening state, on the trust tint — the same chip the capture screen uses */}
          <View className="mb-8 flex-row items-center gap-2 rounded-pill bg-tint-trust px-4 py-2">
            <View className="h-2 w-2 rounded-full bg-ok-bright" />
            <Text className="font-mono text-[13px] text-tint-trust-ink">{c.node.listening}</Text>
          </View>

          <ListeningHalo still={reducedMotion}>
            <Text className="font-mono-medium text-[56px] leading-[62px] text-ink">
              {detections}
            </Text>
            <Text className="mt-1 font-plex-medium text-[15px] text-muted">
              {detections === 1 ? c.node.detection : c.node.detections}
            </Text>
          </ListeningHalo>
        </View>

        {/* The instruction belongs to the FOOT, not to the instrument: with the vertical slack
            above (capture's pattern), the headline, the readouts and the stop action read as one
            grouped base instead of straddling a dead gap. */}
        <Text className="mb-6 text-center font-plex-bold text-[30px] leading-9 text-ink">
          {c.node.leaveHere}
        </Text>

        {/* the two glanceable readouts — one filled block, hairline divider inside it */}
        <View className="mb-3 flex-row rounded-block bg-surface-raised px-5 py-4">
          <View className="flex-1 items-center">
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">
              {clock(elapsed)}
            </Text>
            <Text className="mt-1 font-mono text-[13px] text-muted">{c.node.elapsed}</Text>
          </View>
          <View className="w-px bg-line" />
          <View className="flex-1 items-center">
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">{battery}%</Text>
            <Text className="mt-1 font-mono text-[13px] text-muted">{c.node.battery}</Text>
          </View>
        </View>

        {/* stop — the only action, sized to be pressed without reading it. Not `primary`: blue is
            the capture control, and the node's exit should not out-shout the work it interrupts. */}
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          className="mb-4 min-h-[60px] items-center justify-center rounded-pill bg-surface-raised py-4 active:opacity-90"
        >
          <Text className="font-plex-semibold text-[20px] text-ink">{c.node.stop}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
