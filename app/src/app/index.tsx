import { Link, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelMeter } from '@/components/LevelMeter';
import { TabBar } from '@/components/TabBar';
import { PulseRings } from '@/components/PulseRings';
import { SyncChip } from '@/components/SyncChip';
import { useCopy } from '@/copy';
import { classify } from '@/inference/classify';
import type { Verdict } from '@/inference/gating';
import { createLevelSource, type LevelSource } from '@/lib/audioLevel';
import { useConnectivity } from '@/lib/connectivity';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useDetections } from '@/store/detections';
import { isOnboarded } from '@/store/onboarding';

const CAPTURE_SECONDS = 5.0;
const SAMPLE_RATE = 16000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Phase = 'idle' | 'listening' | 'analyzing';

function serialize(v: Verdict): Record<string, string> {
  if (v.kind === 'abstain')
    return { kind: v.kind, reason: v.reason, readings: JSON.stringify(v.readings) };
  return {
    kind: v.kind,
    species: v.species,
    confidence: String(v.confidence),
    ...(v.detail ? { detail: JSON.stringify(v.detail) } : {}),
  };
}

export default function Capture() {
  const c = useCopy();
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState(CAPTURE_SECONDS);
  const [source, setSource] = useState<LevelSource | null>(null);
  const reducedMotion = useReducedMotion();
  const detections = useDetections();
  const online = useConnectivity();

  // Session token: bumping it invalidates every async continuation of the previous session
  // (level-source resolution, classify result). This is what makes cancel and double-press safe.
  // First-run: read once, synchronously, before the first paint — no flash of capture, and the
  // redirect can never loop because /onboarding sets the flag before replacing back here.
  const [onboarded] = useState(() => isOnboarded());
  useEffect(() => {
    if (!onboarded) router.replace('/onboarding');
  }, [onboarded]);

  const sessionRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sourceRef = useRef<LevelSource | null>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const teardown = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sourceRef.current?.stop();
    sourceRef.current = null;
    setSource(null);
  }, []);

  useEffect(() => {
    return () => {
      sessionRef.current++;
      teardown();
    };
  }, [teardown]);

  const finish = useCallback(async (session: number) => {
    const verdict = await classify(new Float32Array(SAMPLE_RATE * CAPTURE_SECONDS));
    if (sessionRef.current !== session) return;
    router.push({ pathname: '/result', params: serialize(verdict) });
    setPhase('idle');
    setRemaining(CAPTURE_SECONDS);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current !== 'idle') return; // double-press cannot start a second session
    const session = ++sessionRef.current;
    setPhase('listening');
    setRemaining(CAPTURE_SECONDS);

    void createLevelSource().then((s) => {
      // Stale if the session changed or the countdown already ended while permission was pending.
      if (sessionRef.current !== session || intervalRef.current === null) {
        s.stop();
        return;
      }
      sourceRef.current = s;
      setSource(s);
    });

    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, CAPTURE_SECONDS - (Date.now() - startedAt) / 1000);
      setRemaining(left);
      if (left <= 0) {
        teardown();
        setPhase('analyzing');
        void finish(session);
      }
    }, 50);
  }, [teardown, finish]);

  const cancel = useCallback(() => {
    sessionRef.current++;
    teardown();
    setPhase('idle');
    setRemaining(CAPTURE_SECONDS);
  }, [teardown]);

  const now = Date.now();
  const thisWeek = detections.filter((d) => now - new Date(d.at).getTime() < WEEK_MS).length;
  const queued = detections.filter((d) => !d.synced).length;
  const tally = queued > 0 ? c.capture.tallyQueued(thisWeek, queued) : c.capture.tally(thisWeek);

  const listening = phase === 'listening';
  const analyzing = phase === 'analyzing';
  // The sync chip and the full mic label do not both fit at 390 px (horizontal-scroll floor).
  // While the chip is up, the label compresses to the trust half — the dot still carries mic state.
  const chipUp = !online || queued > 0;
  const micLabel = chipUp
    ? c.capture.micOnDevice
    : listening
      ? c.capture.micRecording
      : analyzing
        ? c.capture.micAnalyzing
        : c.capture.micReady;
  const enter = reducedMotion ? undefined : FadeIn.duration(180);

  // Dark ground only while the redirect to /onboarding lands (all hooks above have run).
  if (!onboarded) return <View className="flex-1 bg-bg" />;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* status row — fixed height so the sync chip appearing/disappearing never shifts layout */}
        <View className="mt-4 h-8 flex-row items-center justify-between">
          <Text className="font-plex-semibold text-[17px] text-ink">{c.common.brand}</Text>
          <View className="flex-row items-center gap-2">
            <SyncChip />
            {/* mic state on the trust tint: bright green = ready, blue = live, muted = closed */}
            <View className="flex-row items-center gap-2 rounded-pill bg-tint-trust px-3 py-1">
              <View
                className={`h-2 w-2 rounded-full ${listening ? 'bg-primary' : analyzing ? 'bg-muted' : 'bg-ok-bright'}`}
              />
              <Text className="font-mono text-[12px] text-tint-trust-ink">{micLabel}</Text>
            </View>
          </View>
        </View>

        {/* instrument — the flex-1 slack lives HERE, above the guidance block, so the guidance and
            the footer sit as one grouped foot instead of straddling a dead vertical gap */}
        <View className="flex-1 items-center justify-center">
          <PulseRings
            mode={phase}
            reducedMotion={reducedMotion}
            onPress={start}
            disabled={phase !== 'idle'}
            accessibilityLabel={c.capture.listenA11y}
          >
            {phase === 'idle' && (
              <Animated.View entering={enter} className="items-center">
                <Text className="font-plex-semibold text-[24px] text-bg">{c.capture.listen}</Text>
                <Text className="mt-1 font-mono text-[13px] text-bg">5.0 s</Text>
              </Animated.View>
            )}
            {listening && (
              <Animated.View entering={enter} className="items-center">
                <View className="flex-row items-end">
                  <Text className="font-mono-medium text-[38px] leading-[42px] text-bg">
                    {remaining.toFixed(1)}
                  </Text>
                  <Text className="mb-[6px] ml-1 font-mono text-[15px] text-bg">s</Text>
                </View>
                <View className="mt-3">
                  <LevelMeter source={source} variant="on-primary" />
                </View>
              </Animated.View>
            )}
            {analyzing && (
              <Animated.View entering={enter} className="items-center">
                <Text className="font-mono text-[13px] text-bg">{c.capture.analyzing}</Text>
              </Animated.View>
            )}
          </PulseRings>

          {phase === 'idle' && (
            <Animated.View entering={enter} className="items-center">
              {/* The one line under the instrument. Was 30px bold above a ~90px void and a
                  separate paragraph block — the centred-hero-plus-subtitle shape the research
                  names as an AI tell, and the void was the screen's worst feature at 390. */}
              <Text className="mt-7 text-center font-plex-semibold text-[21px] leading-7 text-ink">
                {c.capture.headline}
              </Text>
              <Text className="mt-2 text-center font-mono text-[12px] text-muted">
                {c.capture.guidanceSpec}
              </Text>
              {/* The tally belongs to the instrument, not to the foot. Pinned at the bottom it left
                  a ~130px void between the spec line and itself; here the screen reads as one
                  centred group with the shell framing it. */}
              <Text className="mt-5 text-center font-mono text-[13px] text-muted">{tally}</Text>
            </Animated.View>
          )}
          {listening && (
            <Animated.View entering={enter} className="items-center">
              <Pressable
                onPress={cancel}
                accessibilityRole="button"
                className="mt-8 min-h-[44px] items-center justify-center px-6 py-3 active:opacity-70"
              >
                <Text className="font-plex-medium text-[15px] text-muted">{c.capture.cancel}</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* static-node mode (specs §2's secondary capture) — one quiet line, never a second CTA */}
        <Link href="/node/setup" asChild>
          <Pressable
            accessibilityRole="link"
            className="mb-4 min-h-[44px] items-center justify-center active:opacity-70"
          >
            <Text className="font-plex text-[15px] text-muted">{c.capture.nodeInvite}</Text>
          </Pressable>
        </Link>
      </View>
      <TabBar />
    </SafeAreaView>
  );
}
