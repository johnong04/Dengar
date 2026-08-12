import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * Static-node placement flow — specs.md §2's SECONDARY capture mode.
 *
 * The whole screen exists to teach one geometry: a retired phone face-up, roughly a hand's width
 * above a passive lure. That is not a styling detail — it is the exact arrangement the published
 * accuracy was measured under (MosquitoSong+'s outdoor variant put the microphone 5 cm above a
 * BG-Counter trap), which is why this mode can borrow that accuracy at all. Copy is written to
 * §2's language table: a node is a PLACED SENSOR. It hears what arrives at the spot it sits on.
 * Nothing here may suggest the phone covers a room.
 *
 * Citizen warm register (design-system.md): filled grouped surfaces at `block` radius, `tint-guide`
 * for the instructions, `tint-trust` for the privacy claim, mono for machine strings only.
 */

type Step = {
  /** Mono index — a machine string, so mono is legal here (§Type). */
  index: string;
  text: string;
};

const STEPS: Step[] = [
  {
    index: '01',
    text: 'Find the lure: standing water, or a dark container in the shade. Aedes comes to it on its own.',
  },
  {
    index: '02',
    text: 'Lay the phone face-up a hand’s width above the water — 5 cm, the geometry the accuracy was measured at.',
  },
  {
    index: '03',
    text: 'Leave it on the charger. Dusk through dawn is the strongest window.',
  },
];

export default function NodeSetup() {
  const reducedMotion = useReducedMotion();
  const enter = reducedMotion ? undefined : FadeIn.duration(180);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row — same status row grammar as capture */}
        <View className="mt-3 h-8 flex-row items-center justify-between">
          <Text className="font-plex-semibold text-[17px] text-ink">Dengar</Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            className="min-h-[44px] justify-center pl-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">Back</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          <Animated.View entering={enter}>
            <Text className="mt-3 font-mono text-[12px] uppercase tracking-widest text-muted">
              static node · second capture mode
            </Text>
            <Text className="mt-2 font-plex-bold text-[30px] leading-9 text-ink">
              Give an old phone{'\n'}a second job
            </Text>
            <Text className="mt-4 font-plex text-[16px] leading-6 text-muted">
              Almost every house has a dead phone in a drawer. Plugged in beside a breeding site, it
              becomes a permanent listening post at no hardware cost.
            </Text>

            {/* placement — the guidance grammar: warm light on the dark instrument */}
            <View className="mt-4 rounded-block bg-tint-guide px-5 py-4">
              {STEPS.map((s, i) => (
                <View key={s.index}>
                  {i > 0 && <View className="my-3 h-px bg-line" />}
                  <View className="flex-row">
                    <Text className="mt-[3px] w-8 font-mono text-[13px] text-tint-guide-mono">
                      {s.index}
                    </Text>
                    <Text className="flex-1 font-plex text-[16px] leading-6 text-tint-guide-ink">
                      {s.text}
                    </Text>
                  </View>
                </View>
              ))}
              <Text className="mt-2 font-mono text-[12px] text-tint-guide-mono">
                ≈5 cm above the lure · mains power
              </Text>
            </View>

            {/* the honest sentence: a placed sensor, never room coverage (§2) */}
            <Text className="mt-2 font-plex text-[15px] leading-5 text-muted">
              A node hears what arrives at the spot you put it on — one place, not a room.
            </Text>

            {/* privacy — the trust tint, same claim and same block as onboarding and abstain */}
            <View className="mt-2 rounded-block bg-tint-trust px-5 py-4">
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-ok-bright" />
                <Text className="font-mono text-[12px] text-tint-trust-ink">privacy</Text>
              </View>
              <Text className="mt-2 font-plex text-[16px] leading-6 text-ink">
                Every clip is judged on this phone, then deleted. No audio is uploaded — only a
                count and a species, once you’re online.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* primary action — pinned under the scroll so it is never the thing that scrolls away */}
        <Pressable
          onPress={() => router.push('/node/running')}
          accessibilityRole="button"
          className="mb-4 mt-2 min-h-[52px] items-center justify-center rounded-pill bg-primary py-4 active:opacity-90"
        >
          <Text className="font-plex-semibold text-[17px] text-bg">Start the node</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
