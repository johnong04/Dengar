import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type AbstainReadings,
  BAND_SNR_FLOOR_DB,
  MED_THRESHOLD,
  MSC_THRESHOLD,
  type Species,
  type SpeciesDetail,
} from '@/inference/gating';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { add as addDetection } from '@/store/detections';

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

/** Route param → detail. Absent/garbled → undefined; per-field optional, nothing invented. */
function parseDetail(param: string | undefined): SpeciesDetail | undefined {
  if (!param) return undefined;
  try {
    const parsed = JSON.parse(param) as SpeciesDetail;
    if (typeof parsed !== 'object' || parsed === null) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

/** Route param → confidence in [0, 1], or undefined. A garbled param never invents a number. */
function parseConfidence(param: string | undefined): number | undefined {
  const n = Number(param);
  return isFinite(n) && n >= 0 && n <= 1 ? n : undefined;
}

/** taxon/sex/gravid rows — each independently optional (specs.md §6); absent fields render nothing. */
function detailRows(detail: SpeciesDetail | undefined): ReadoutRow[] {
  const rows: ReadoutRow[] = [];
  if (detail?.taxon?.name && typeof detail.taxon.confidence === 'number')
    rows.push({ label: 'Species', value: detail.taxon.name, suffix: `· ${score(detail.taxon.confidence)}` });
  if (detail?.sex?.value && typeof detail.sex.confidence === 'number')
    rows.push({ label: 'Sex', value: detail.sex.value, suffix: `· ${score(detail.sex.confidence)}` });
  if (detail?.gravid && typeof detail.gravid.confidence === 'number')
    rows.push({
      label: 'Gravid',
      value: detail.gravid.value ? 'yes' : 'no',
      suffix: `· ${score(detail.gravid.confidence)}`,
    });
  return rows;
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

type DetectedParams = { species?: string; confidence?: string; detail?: string };

/**
 * The detected verdict. Aedes drenches the surface verdict-red (the one place red is allowed);
 * not_aedes stays on the quiet dark ground — red is rationed to the vector alone.
 */
function Detected({
  params,
  reducedMotion,
  stamp,
}: {
  params: DetectedParams;
  reducedMotion: boolean;
  stamp: string;
}) {
  const species: Species | undefined =
    params.species === 'aedes' || params.species === 'not_aedes' ? params.species : undefined;
  const confidence = parseConfidence(params.confidence);
  const detail = parseDetail(params.detail);
  const rows = detailRows(detail);

  // Log must write exactly one record: the ref blocks a second press synchronously, the state
  // disables the control. Discard never writes.
  const loggedRef = useRef(false);
  const [logged, setLogged] = useState(false);
  const canLog = species !== undefined && confidence !== undefined;
  const log = () => {
    if (loggedRef.current || !canLog) return;
    loggedRef.current = true;
    setLogged(true);
    addDetection({
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      species,
      confidence,
      ...(detail ? { detail } : {}),
      synced: false,
    });
    router.replace('/');
  };
  const discard = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // Verdict reveal: 240 ms drench-in. Under reduced motion the entering animation is dropped —
  // the surface appears as a plain crossfade-equivalent cut.
  const reveal = reducedMotion ? undefined : FadeIn.duration(240);

  if (species === 'aedes') {
    const pct = Math.round(confidence! * 100);
    const context = [
      'confident',
      detail?.sex?.value,
      detail?.taxon?.name?.replace(/^Aedes\s+/, 'Ae. '),
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <View className="flex-1 bg-bg">
        {/* explicit flex style + inner plain View for the drench: className styles are not applied
            reliably on reanimated views (web), so the red lives on a regular View */}
        <Animated.View entering={reveal} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-verdict-aedes">
            <View className="flex-1 px-5">
              {/* top row */}
              <View className="flex-row items-center justify-between pt-4">
                <Pressable
                  onPress={discard}
                  accessibilityRole="button"
                  accessibilityLabel="Back to capture"
                  className="min-h-[44px] justify-center pr-6 active:opacity-70"
                >
                  <Text className="font-plex-medium text-[15px] text-verdict-aedes-soft">
                    ← Result
                  </Text>
                </Pressable>
                <Text className="font-mono text-[12px] text-verdict-aedes-soft">{stamp}</Text>
              </View>

              {/* verdict */}
              <View className="mt-12">
                <Text className="font-plex-bold text-[56px] leading-[60px] text-white">Aedes.</Text>
                <Text className="mt-3 font-plex text-[20px] leading-7 text-verdict-aedes-soft">
                  The mosquito that found you{'\n'}carries dengue.
                </Text>

                <View className="mt-8 flex-row items-baseline gap-3">
                  <Text className="font-mono-medium text-[30px] text-white">{pct}%</Text>
                  <Text className="font-mono text-[13px] text-verdict-aedes-soft">{context}</Text>
                </View>
                <View className="mt-3 h-[3px] w-full bg-verdict-aedes-line">
                  <View className="h-full bg-white" style={{ width: `${pct}%` }} />
                </View>

                {/* fine-grained heads — rows exist only when a head reported (specs.md §6) */}
                {rows.length > 0 && (
                  <View className="mt-8">
                    {rows.map((row, i) => (
                      <View
                        key={row.label}
                        className={`flex-row items-center justify-between border-t border-verdict-aedes-line py-3 ${
                          i === rows.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <Text className="font-plex text-[15px] text-verdict-aedes-soft">
                          {row.label}
                        </Text>
                        <Text className="font-mono text-[15px] text-white">
                          {row.value}{' '}
                          <Text className="font-mono text-[15px] text-verdict-aedes-soft">
                            {row.suffix}
                          </Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text className="mt-8 font-plex text-[15px] leading-[22px] text-verdict-aedes-soft">
                  Logging this puts one more point on your district's map. Fourteen detections in 72
                  hours is what sends a fogging truck.
                </Text>
              </View>

              <View className="flex-1" />

              {/* next move */}
              <View className="gap-3 pb-4">
                <Pressable
                  onPress={log}
                  disabled={logged}
                  accessibilityRole="button"
                  className="min-h-[52px] items-center justify-center rounded-[10px] bg-white py-4 active:opacity-90 disabled:opacity-60"
                >
                  <Text className="font-plex-semibold text-[17px] text-verdict-aedes">
                    Log detection
                  </Text>
                </Pressable>
                <Pressable
                  onPress={discard}
                  disabled={logged}
                  accessibilityRole="button"
                  className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
                >
                  <Text className="font-plex-medium text-[15px] text-verdict-aedes-soft">
                    Discard
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    );
  }

  // not_aedes: quiet ground, never red. (Garbled species never reaches here — Result() routes it
  // to the abstain fallback.)
  const quietRows: ReadoutRow[] = [
    {
      label: 'Species call',
      value: confidence !== undefined ? score(confidence) : '—',
      suffix: confidence !== undefined ? `/ floor ${MSC_THRESHOLD.toFixed(2)}` : undefined,
      prominent: true,
    },
    ...rows,
    AUDIO_ROW,
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            onPress={discard}
            accessibilityRole="button"
            accessibilityLabel="Back to capture"
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← Result</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-muted">{stamp}</Text>
        </View>

        <Animated.View entering={reveal} style={{ flex: 1 }}>
          {/* verdict */}
          <View className="mt-12">
            <Text className="font-plex-bold text-[38px] leading-[44px] text-ink">
              Not a dengue{'\n'}vector
            </Text>
            <Text className="mt-4 font-plex text-[15px] leading-[22px] text-muted">
              The wingbeat was clear enough to judge, and it isn't an Aedes. Logging it still helps
              your district's map — knowing where the vector isn't is data too.
            </Text>
          </View>

          {/* the instrument says why, in its own units */}
          <View className="mt-12">
            {quietRows.map((row, i) => (
              <View
                key={row.label}
                className={`flex-row items-center justify-between border-t border-line py-3 ${
                  i === quietRows.length - 1 ? 'border-b' : ''
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
                  {row.value}{' '}
                  {row.suffix ? (
                    <Text className="font-mono text-[15px] text-muted">{row.suffix}</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-1" />

          {/* next move */}
          <View className="gap-3 pb-4">
            {canLog && (
              <Pressable
                onPress={log}
                disabled={logged}
                accessibilityRole="button"
                className="min-h-[52px] items-center justify-center rounded-[10px] bg-primary py-4 active:opacity-90 disabled:opacity-60"
              >
                <Text className="font-plex-semibold text-[17px] text-bg">Log detection</Text>
              </Pressable>
            )}
            <Pressable
              onPress={discard}
              disabled={logged}
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-muted">Discard</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

export default function Result() {
  const params = useLocalSearchParams<{
    kind?: string;
    reason?: string;
    readings?: string;
    species?: string;
    confidence?: string;
    detail?: string;
  }>();
  const reducedMotion = useReducedMotion();
  const stamp = useCaptureStamp();

  // A detected verdict must name a species the instrument can stand behind. A garbled species
  // param (hand-typed URL) falls through to the no_mosquito abstain with honest dashes — the
  // not_aedes layout would falsely claim "the wingbeat was clear enough to judge".
  if (params.kind === 'detected' && (params.species === 'aedes' || params.species === 'not_aedes'))
    return <Detected params={params} reducedMotion={reducedMotion} stamp={stamp} />;

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
