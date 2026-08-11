import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { markOnboarded } from '@/store/onboarding';

type Beat = {
  kicker: string;
  heading: string;
  paragraphs: string[];
  /** The positioning line, set apart from the body. */
  line?: string;
};

const BEATS: Beat[] = [
  {
    kicker: 'why dengar exists',
    heading: 'Fogging arrives two\nto three weeks late',
    paragraphs: [
      'Case-triggered fogging chases reports of people already sick — the vector moved in weeks before. But the mosquito announces itself first, in the whine you already know.',
    ],
    line: 'Dengue is heard before it’s felt.',
  },
  {
    kicker: 'how it works',
    heading: 'Wingbeats are\nspecies-specific',
    paragraphs: [
      'Every mosquito species beats its wings at its own frequency — a signature your phone’s microphone can read.',
      'Hold your phone within 10 cm — a hand’s width. That sounds close, but Aedes hunts humans: the mosquito that found you is already in range. Five seconds, judged on the phone.',
    ],
  },
  {
    kicker: 'privacy',
    heading: 'Analyzed here,\nnever uploaded',
    paragraphs: [
      'The recording is judged on your phone and never leaves it. When Dengar can’t make a confident call, the clip is deleted. Everything works in airplane mode.',
    ],
  },
  {
    kicker: 'one permission',
    heading: 'The microphone\nis the instrument',
    paragraphs: [
      'Dengar records only when you press Listen — five seconds, judged on the phone. The microphone is how a wingbeat is read; without it the instrument is silent.',
    ],
  },
];

const MIC_BEAT = BEATS.length - 1;

type MicState = 'idle' | 'requesting' | 'denied';

/**
 * Permission primer: ask the browser for the mic, then release it immediately — capture opens its
 * own stream when Listen is pressed. The native permission call arrives with the audio dep behind
 * this same button.
 */
async function requestMicPermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export default function Onboarding() {
  const [beat, setBeat] = useState(0);
  const [mic, setMic] = useState<MicState>('idle');
  const reducedMotion = useReducedMotion();
  const requestingRef = useRef(false);

  const finish = () => {
    markOnboarded();
    router.replace('/');
  };

  const allowMic = async () => {
    if (requestingRef.current) return;
    requestingRef.current = true;
    setMic('requesting');
    const granted = await requestMicPermission();
    requestingRef.current = false;
    if (granted) finish();
    else setMic('denied');
  };

  const { kicker, heading, paragraphs, line } = BEATS[beat];
  const onMicBeat = beat === MIC_BEAT;
  const enter = reducedMotion ? undefined : FadeIn.duration(180);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-semibold text-[15px] text-ink">Dengar</Text>
          <Pressable
            onPress={finish}
            accessibilityRole="button"
            className="min-h-[44px] justify-center pl-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">Skip</Text>
          </Pressable>
        </View>

        {/* beat content — key remounts the view so each step fades in */}
        <Animated.View key={beat} entering={enter} style={{ flex: 1 }}>
          <View className="mt-12">
            <Text className="font-mono text-[12px] uppercase tracking-widest text-muted">
              {kicker}
            </Text>
            <Text className="mt-3 font-plex-bold text-[30px] leading-9 text-ink">{heading}</Text>
            {paragraphs.map((p) => (
              <Text key={p} className="mt-4 font-plex text-[15px] leading-[22px] text-muted">
                {p}
              </Text>
            ))}
            {line && (
              <Text className="mt-8 font-plex-semibold text-[20px] leading-7 text-ink">{line}</Text>
            )}
          </View>

          <View className="flex-1" />

          {/* denied: a calm state, not an error */}
          {onMicBeat && mic === 'denied' && (
            <Animated.View entering={enter}>
              <View className="mb-6 border-t border-line pt-4">
                <Text className="font-plex text-[15px] leading-[22px] text-muted">
                  Microphone access was declined, so Dengar can{'’'}t read a wingbeat yet. You
                  can enable it in Settings whenever you{'’'}re ready — the rest of the app
                  works without it.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* progress + action */}
          <View className="gap-3 pb-4">
            <View className="mb-2 flex-row items-center justify-center gap-2">
              {BEATS.map((b, i) => (
                <View
                  key={b.kicker}
                  className={`h-1.5 w-1.5 rounded-full ${i === beat ? 'bg-ink' : 'bg-line'}`}
                />
              ))}
            </View>

            {!onMicBeat && (
              <Pressable
                onPress={() => setBeat(beat + 1)}
                accessibilityRole="button"
                className="min-h-[52px] items-center justify-center rounded-[10px] bg-primary py-4 active:opacity-90"
              >
                <Text className="font-plex-semibold text-[17px] text-bg">Continue</Text>
              </Pressable>
            )}

            {onMicBeat && mic !== 'denied' && (
              <Pressable
                onPress={allowMic}
                disabled={mic === 'requesting'}
                accessibilityRole="button"
                className="min-h-[52px] items-center justify-center rounded-[10px] bg-primary py-4 active:opacity-90 disabled:opacity-60"
              >
                <Text className="font-plex-semibold text-[17px] text-bg">Allow microphone</Text>
              </Pressable>
            )}

            {onMicBeat && mic === 'denied' && (
              <Pressable
                onPress={finish}
                accessibilityRole="button"
                className="min-h-[52px] items-center justify-center rounded-[10px] bg-surface active:opacity-90"
              >
                <Text className="font-plex-semibold text-[17px] text-ink">Continue anyway</Text>
              </Pressable>
            )}

            {beat > 0 && (
              <Pressable
                onPress={() => {
                  setMic('idle');
                  setBeat(beat - 1);
                }}
                accessibilityRole="button"
                className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
              >
                <Text className="font-plex-medium text-[15px] text-muted">Back</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
