import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Block, FigureTag, RoadmapScreen, SimulatedTag } from '@/components/RoadmapChrome';
import { CLIP_SIZE, UPDATE_SIZE } from '@/lib/impact';
import { useReducedMotion } from '@/lib/useReducedMotion';
import tokens from '../../../tailwind.tokens.js';

/**
 * v3 — privacy / federated-learning status (specs §5 v3, first bullet).
 *
 * This is the screen that makes the airplane-mode shot (specs §7, §13 rule 5) legible as an
 * ARCHITECTURE rather than a stunt: the capture works offline because the model is on the phone,
 * and the only thing that would ever travel is a weight delta whose size does not depend on what
 * was recorded.
 *
 * Both payload sizes are `[modeled]` and derived on screen: the clip from the §4 audio contract
 * (16 kHz × 5.0 s × 4 B) and the update from §9's 927K-parameter model (927K × 4 B). Neither is a
 * figure anyone typed — `lib/impact.ts` computes the value and the arithmetic from one constant.
 *
 * The log rows are seeded and say so. Their *sizes are identical by construction*, which is the
 * point of the screen and is called out in the caption: a payload that varies with your recording
 * would be leaking something about it.
 */

/** Rounds are seeded (COMMON rule 8) — timestamps only, no invented counts or accuracies. */
const LOG = [
  { at: '11 Aug 2026 · 03:14', kind: 'model update only' },
  { at: '08 Aug 2026 · 03:07', kind: 'model update only' },
  { at: '05 Aug 2026 · 03:11', kind: 'model update only' },
];

/**
 * The local-training indicator. One breathing dot, 1.6 s — the idle-invitation tempo already law
 * for the capture instrument (§Motion). Geometry sits on `style`, NOT className: react-native-web
 * silently drops className on a reanimated Animated.View (see components/PulseRings.tsx).
 * Reduced motion: the dot holds at rest opacity, which is the whole state it was conveying.
 */
function TrainingDot({ still }: { still: boolean }) {
  const p = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(p);
    p.value = 0;
    if (still) return;
    p.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [still, p]);

  const style = useAnimatedStyle(() => ({
    opacity: still ? 0.9 : 0.45 + 0.55 * p.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: tokens.colors['ok-bright'],
        },
      ]}
    />
  );
}

function PayloadRow({
  direction,
  what,
  size,
  arithmetic,
}: {
  direction: string;
  what: string;
  size: string;
  arithmetic: string;
}) {
  return (
    <View className="flex-row items-start justify-between py-3">
      <View className="shrink pr-4">
        {/* `muted`, not `tint-trust-ink`: the mint token is documented as a label ON `tint-trust`
            (design-system.md §Tokens), and this block sits on `surface`. It is also a comparison,
            not a reassurance — colouring "would leave" mint would say the wrong thing. */}
        <Text className="font-mono text-[12px] uppercase text-muted">{direction}</Text>
        <Text className="mt-1 font-plex text-[16px] leading-6 text-ink">{what}</Text>
        <Text className="mt-1 font-mono text-[12px] text-muted">{arithmetic}</Text>
      </View>
      <View className="items-end">
        <Text className="font-mono-medium text-[17px] text-ink">{size}</Text>
        <View className="mt-1">
          <FigureTag tag="modeled" />
        </View>
      </View>
    </View>
  );
}

export default function RoadmapPrivacy() {
  const reducedMotion = useReducedMotion();

  return (
    <RoadmapScreen
      title="Privacy"
      self="privacy"
      headline={'Your audio never\nleft this device.'}
      standing="Not built yet. This is the architecture the offline capture already implies — written out, so you can check it rather than trust it."
    >
      <Block heading="what moves">
        <PayloadRow
          direction="stays here"
          what="The 5.0 s recording. Held long enough to read the wingbeat, then dropped."
          size={CLIP_SIZE.value}
          arithmetic={CLIP_SIZE.arithmetic}
        />
        <View className="h-px bg-line" />
        <PayloadRow
          direction="would leave"
          what="A model update — one number per model weight. No audio, no transcript, no fragment of one."
          size={UPDATE_SIZE.value}
          arithmetic={UPDATE_SIZE.arithmetic}
        />
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          Every update is the same size, because it is the same shape as the model. A payload that
          grew with what you recorded would be carrying something about it.
        </Text>
      </Block>

      <Block heading="on-device training" tint="trust">
        <View className="flex-row items-center gap-2 py-1">
          <TrainingDot still={reducedMotion} />
          <Text className="font-mono text-[13px] text-tint-trust-ink">
            waiting · runs while charging
          </Text>
        </View>
        <Text className="mt-2 font-plex text-[16px] leading-6 text-ink">
          The phone would train on its own recordings overnight and send only what it learned. The
          recordings stay where they were made.
        </Text>
      </Block>

      <Block heading="encrypted update log" tag={<SimulatedTag />}>
        {LOG.map((row, i) => (
          <View
            key={row.at}
            className={`flex-row items-center justify-between py-3 ${
              i === 0 ? '' : 'border-t border-line'
            }`}
          >
            <View className="shrink pr-4">
              <Text className="font-mono text-[13px] text-ink">{row.at}</Text>
              <Text className="mt-1 font-plex text-[15px] text-muted">sent: {row.kind}</Text>
            </View>
            <Text className="font-mono text-[15px] text-muted">{UPDATE_SIZE.value}</Text>
          </View>
        ))}
        <Text className="mt-2 font-mono text-[12px] text-muted">
          three seeded rounds · no round has run
        </Text>
      </Block>
    </RoadmapScreen>
  );
}
