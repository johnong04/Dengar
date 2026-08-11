import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type AbstainReadings,
  BAND_SNR_FLOOR_DB,
  MED_THRESHOLD,
  MSC_THRESHOLD,
} from '@/inference/gating';
import { useReducedMotion } from '@/lib/useReducedMotion';

type AbstainReason = 'no_mosquito' | 'not_confident' | 'too_noisy';

type ReadoutRow = {
  label: string;
  /** Mono value in ink — the number the instrument stands behind. */
  value: string;
  /** Mono suffix in muted — floor / qualifier. */
  suffix?: string;
  /** Bumps the value one scale step (17px, medium) — the row that explains this verdict. */
  prominent?: boolean;
};

type AbstainCopy = {
  headline: string;
  body: string;
  rows: (r: AbstainReadings) => ReadoutRow[];
  guidance: string;
};

// Readout values come from judge()'s AbstainReadings, serialized through the route params by the
// capture screen — the numbers the gates actually measured, absent when a gate never ran.
const score = (n: number | undefined) => (typeof n === 'number' && isFinite(n) ? n.toFixed(2) : '—');
const db = (n: number | undefined) => (typeof n === 'number' && isFinite(n) ? `${n.toFixed(1)} dB` : '—');
const AUDIO_ROW: ReadoutRow = { label: 'Audio kept', value: 'no', suffix: '· deleted on device' };

const ABSTAIN_COPY: Record<AbstainReason, AbstainCopy> = {
  no_mosquito: {
    headline: 'No mosquito\nin this recording',
    body: "The clip carried no wingbeat signature. Most recordings end here — a clean no is what keeps the map honest. Nothing was saved; nothing left your phone.",
    rows: (r) => [
      { label: 'Event score', value: score(r.medScore), suffix: `/ floor ${MED_THRESHOLD.toFixed(2)}` },
      {
        label: 'Band SNR',
        value: db(r.bandSnrDb),
        suffix: r.bandSnrDb >= BAND_SNR_FLOOR_DB ? '· usable' : undefined,
      },
      AUDIO_ROW,
    ],
    guidance: 'Get within 10 cm — under a glass is ideal',
  },
  not_confident: {
    headline: 'Wingbeat heard —\nspecies unresolved',
    body: "A mosquito was close enough to hear, but the species call didn't clear its floor. This is the one worth retrying — inside 10 cm the signature sharpens fast.",
    rows: (r) => [
      { label: 'Event score', value: score(r.medScore), suffix: '· passed' },
      {
        label: 'Species call',
        value: score(r.mscMax),
        suffix: `/ floor ${MSC_THRESHOLD.toFixed(2)}`,
        prominent: true,
      },
      AUDIO_ROW,
    ],
    guidance: 'Get closer — hold within 10 cm — and listen again',
  },
  too_noisy: {
    headline: 'Too loud here\nto hear a wingbeat',
    body: 'Background sound drowned the wingbeat band before the models could judge it. Refusing beats guessing — a wrong call here would put bad data on the map.',
    rows: (r) => [
      {
        label: 'Band SNR',
        value: db(r.bandSnrDb),
        suffix: `/ floor ${BAND_SNR_FLOOR_DB} dB`,
        prominent: true,
      },
      { label: 'Event score', value: score(r.medScore), suffix: '· not judged' },
      AUDIO_ROW,
    ],
    guidance: 'Move away from the fan, traffic or TV, then listen again',
  },
};

/** Route param → readings. Absent/garbled param (direct URL) renders honest dashes, never invents. */
function parseReadings(param: string | undefined): AbstainReadings {
  if (param) {
    try {
      const parsed = JSON.parse(param) as Partial<AbstainReadings>;
      if (typeof parsed === 'object' && parsed !== null)
        return { bandSnrDb: NaN, ...parsed } as AbstainReadings;
    } catch {
      // fall through to the empty reading set
    }
  }
  return { bandSnrDb: NaN };
}

function backToCapture() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** "#0231 · 21:07:45" — capture sequence + wall clock, fixed at mount. */
function useCaptureStamp(): string {
  const stamp = useRef<string | null>(null);
  if (stamp.current === null) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const seq = String(Math.floor((now.getTime() / 1000) % 10000)).padStart(4, '0');
    stamp.current = `#${seq} · ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  return stamp.current;
}

export default function Result() {
  const params = useLocalSearchParams<{ kind?: string; reason?: string; readings?: string }>();
  const reducedMotion = useReducedMotion();
  const stamp = useCaptureStamp();

  // slice 4: the detected verdict (species, confidence, detail) renders here.
  if (params.kind === 'detected') {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-5">
        <Text className="font-plex-semibold text-[20px] text-ink">Detected</Text>
        <Text className="mt-2 font-mono text-[13px] text-muted">verdict screen lands in slice 4</Text>
      </View>
    );
  }

  const reason = (params.reason ?? 'no_mosquito') as AbstainReason;
  const copy = ABSTAIN_COPY[reason] ?? ABSTAIN_COPY.no_mosquito;
  const rows = copy.rows(parseReadings(params.readings));
  // Verdict reveal: 240 ms fade. Under prefers-reduced-motion the entering animation is dropped
  // (reanimated also auto-disables it) — the screen appears as a plain crossfade-equivalent cut.
  const reveal = reducedMotion ? undefined : FadeIn.duration(240);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            onPress={backToCapture}
            accessibilityRole="button"
            accessibilityLabel="Back to capture"
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← Result</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-muted">{stamp}</Text>
        </View>

        {/* explicit flex style: className flex-1 is not applied reliably on reanimated views (web) */}
        <Animated.View entering={reveal} style={{ flex: 1 }}>
          {/* verdict */}
          <View className="mt-12">
            <Text className="font-plex-bold text-[38px] leading-[44px] text-ink">
              {copy.headline}
            </Text>
            <Text className="mt-4 font-plex text-[15px] leading-[22px] text-muted">{copy.body}</Text>
          </View>

          {/* the instrument says why, in its own units */}
          <View className="mt-12">
            {rows.map((row, i) => (
              <View
                key={row.label}
                className={`flex-row items-center justify-between border-t border-line py-3 ${
                  i === rows.length - 1 ? 'border-b' : ''
                }`}
              >
                <Text className="font-plex text-[15px] text-muted">{row.label}</Text>
                <Text
                  className={
                    row.prominent
                      ? 'font-mono-medium text-[17px] text-ink'
                      : 'font-mono text-[15px] text-ink'
                  }
                >
                  {row.value} {row.suffix ? <Text className="font-mono text-[15px] text-muted">{row.suffix}</Text> : null}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-1" />

          {/* next move */}
          <View className="gap-3 pb-4">
            <Text className="text-center font-plex text-[13px] text-muted">{copy.guidance}</Text>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="min-h-[52px] items-center justify-center rounded-[10px] bg-primary py-4 active:opacity-90"
            >
              <Text className="font-plex-semibold text-[17px] text-bg">Listen again</Text>
            </Pressable>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-muted">Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
