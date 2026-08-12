import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Copy, useCopy } from '@/copy';
import {
  type AbstainReadings,
  BAND_SNR_FLOOR_DB,
  MED_THRESHOLD,
  MSC_THRESHOLD,
  type Species,
  type SpeciesDetail,
} from '@/inference/gating';
import { DRENCH_STOPS } from '@/lib/drench';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { add as addDetection } from '@/store/detections';

type AbstainReason = 'no_mosquito' | 'not_confident' | 'too_noisy';

/** A reading measured against a floor — rendered as a fill track so the score is seen, not parsed. */
type Fill = { value: number; floor: number };

type ReadoutRow = {
  label: string;
  /** Mono value in ink — the number the instrument stands behind. */
  value: string;
  /** Mono suffix in muted — floor / qualifier. */
  suffix?: string;
  /** Bumps the value one scale step (17px, medium) — the row that explains this verdict. */
  prominent?: boolean;
  /** The gating reading: draws a fill track under the row, value against its floor. */
  fill?: Fill;
};

type AbstainCopy = {
  headline: string;
  body: string;
  rows: (r: AbstainReadings) => ReadoutRow[];
  guidance: string;
};

// Readout values come from judge()'s AbstainReadings, serialized through the route params by the
// capture screen — the numbers the gates actually measured, absent when a gate never ran.
const score = (n: number | undefined) =>
  typeof n === 'number' && isFinite(n) ? n.toFixed(2) : '—';
const db = (n: number | undefined) =>
  typeof n === 'number' && isFinite(n) ? `${n.toFixed(1)} dB` : '—';
/** No reading → no track. A gate that never ran gets a dash, never an invented bar. */
const fillOf = (n: number | undefined, floor: number): Fill | undefined =>
  typeof n === 'number' && isFinite(n) ? { value: n, floor } : undefined;

const audioRow = (c: Copy): ReadoutRow => ({
  label: c.result.audioKept,
  value: c.result.audioKeptValue,
  suffix: c.result.audioKeptSuffix,
});

// The privacy claim, promoted out of the body paragraph into its own trust block — the warm board's
// single best move, and abstain is ~90% of what a user ever sees. It stands on every abstain and on
// no other screen: an abstain writes nothing, so "nothing was saved" is unconditionally true here,
// while a detected verdict CAN be logged.

/**
 * Threshold values keep their `toFixed` formatting — they are the numbers the gates actually
 * compared against, and `/ floor 0.50` must read the same in both languages or the readout stops
 * matching the fill track drawn under it.
 */
function abstainCopy(c: Copy): Record<AbstainReason, AbstainCopy> {
  return {
    no_mosquito: {
      headline: c.result.noMosquitoHeadline,
      body: c.result.noMosquitoBody,
      rows: (r) => [
        {
          label: c.result.eventScore,
          value: score(r.medScore),
          suffix: c.result.floor(MED_THRESHOLD.toFixed(2)),
          fill: fillOf(r.medScore, MED_THRESHOLD),
        },
        {
          label: c.result.bandSnr,
          value: db(r.bandSnrDb),
          suffix: r.bandSnrDb >= BAND_SNR_FLOOR_DB ? c.result.usable : undefined,
        },
        audioRow(c),
      ],
      guidance: c.result.noMosquitoGuidance,
    },
    not_confident: {
      headline: c.result.notConfidentHeadline,
      body: c.result.notConfidentBody,
      rows: (r) => [
        { label: c.result.eventScore, value: score(r.medScore), suffix: c.result.passed },
        {
          label: c.result.speciesCall,
          value: score(r.mscMax),
          suffix: c.result.floor(MSC_THRESHOLD.toFixed(2)),
          prominent: true,
          fill: fillOf(r.mscMax, MSC_THRESHOLD),
        },
        audioRow(c),
      ],
      guidance: c.result.notConfidentGuidance,
    },
    too_noisy: {
      headline: c.result.tooNoisyHeadline,
      body: c.result.tooNoisyBody,
      rows: (r) => [
        {
          label: c.result.bandSnr,
          value: db(r.bandSnrDb),
          suffix: c.result.floor(`${BAND_SNR_FLOOR_DB} dB`),
          prominent: true,
          fill: fillOf(r.bandSnrDb, BAND_SNR_FLOOR_DB),
        },
        { label: c.result.eventScore, value: score(r.medScore), suffix: c.result.notJudged },
        audioRow(c),
      ],
      guidance: c.result.tooNoisyGuidance,
    },
  };
}

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
function detailRows(detail: SpeciesDetail | undefined, c: Copy): ReadoutRow[] {
  const rows: ReadoutRow[] = [];
  if (detail?.taxon?.name && typeof detail.taxon.confidence === 'number')
    rows.push({
      label: c.result.species,
      value: detail.taxon.name,
      suffix: `· ${score(detail.taxon.confidence)}`,
    });
  if (detail?.sex?.value && typeof detail.sex.confidence === 'number')
    rows.push({
      label: c.result.sex,
      value: c.result.sexValue(detail.sex.value),
      suffix: `· ${score(detail.sex.confidence)}`,
    });
  if (detail?.gravid && typeof detail.gravid.confidence === 'number')
    rows.push({
      label: c.result.gravid,
      value: detail.gravid.value ? c.common.yes : c.common.no,
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

/**
 * The gating reading as a bar: fill = value / floor, clamped. Below the floor it is `caution`
 * (design-system.md: "sub-floor reading, gauge fill below threshold"); at or above it is `ok`.
 * This is what turns "0.21 / floor 0.50" from a sentence to be parsed into a distance to be seen.
 */
function FillTrack({ fill }: { fill: Fill }) {
  const ratio = Math.max(0, Math.min(1, fill.value / fill.floor));
  const passed = fill.value >= fill.floor;
  return (
    <View className="mt-3 h-1 w-full overflow-hidden rounded-pill bg-line">
      <View
        className={`h-full rounded-pill ${passed ? 'bg-ok' : 'bg-caution'}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </View>
  );
}

/** The readouts, grouped in one filled surface with hairline dividers INSIDE it (never around it). */
function Readouts({ rows }: { rows: ReadoutRow[] }) {
  return (
    <View className="mt-6 rounded-block bg-surface px-5">
      {rows.map((row, i) => (
        <View key={row.label} className={i === 0 ? 'py-4' : 'border-t border-line py-4'}>
          <View className="flex-row items-center justify-between">
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
          {row.fill ? <FillTrack fill={row.fill} /> : null}
        </View>
      ))}
    </View>
  );
}

/** The promoted privacy claim: cool trust tint, mono tag, prose in ink. Abstain screens only. */
function TrustBlock({ c }: { c: Copy }) {
  return (
    <View className="mt-6 rounded-block bg-tint-trust px-5 py-4">
      <View className="flex-row items-center gap-2">
        <View className="h-1.5 w-1.5 rounded-full bg-ok-bright" />
        <Text className="font-mono text-[12px] text-tint-trust-ink">{c.result.trustTag}</Text>
      </View>
      <Text className="mt-2 font-plex text-[16px] leading-6 text-ink">{c.result.trustLine}</Text>
    </View>
  );
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
  c,
}: {
  params: DetectedParams;
  reducedMotion: boolean;
  stamp: string;
  c: Copy;
}) {
  const species: Species | undefined =
    params.species === 'aedes' || params.species === 'not_aedes' ? params.species : undefined;
  const confidence = parseConfidence(params.confidence);
  const detail = parseDetail(params.detail);
  const rows = detailRows(detail, c);

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
      c.result.confident,
      detail?.sex?.value ? c.result.sexValue(detail.sex.value) : undefined,
      detail?.taxon?.name?.replace(/^Aedes\s+/, 'Ae. '),
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <View className="flex-1 bg-verdict-aedes">
        {/* explicit flex style: className styles are not applied reliably on reanimated views (web),
            so the drench lives on plain Views underneath */}
        <Animated.View entering={reveal} style={{ flex: 1 }}>
          {/* the drench: 28 solid bands from → to, a vertical gradient with no dependency */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
          >
            {DRENCH_STOPS.map((band, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: band }} />
            ))}
          </View>

          <SafeAreaView className="flex-1">
            <View className="flex-1 px-5">
              {/* top row */}
              <View className="flex-row items-center justify-between pt-4">
                <Pressable
                  onPress={discard}
                  accessibilityRole="button"
                  accessibilityLabel={c.common.backToCapture}
                  className="min-h-[44px] justify-center pr-6 active:opacity-70"
                >
                  <Text className="font-plex-medium text-[15px] text-verdict-aedes-soft">
                    ← {c.result.back}
                  </Text>
                </Pressable>
                <Text className="font-mono text-[12px] text-verdict-aedes-soft">{stamp}</Text>
              </View>

              {/* verdict */}
              <View className="mt-12">
                <Text className="font-plex-bold text-[56px] leading-[60px] text-warm-white">
                  {c.result.aedesVerdict}
                </Text>
                <Text className="mt-3 font-plex text-[20px] leading-7 text-verdict-aedes-soft">
                  {c.result.aedesBody}
                </Text>

                {/* confidence gauge — a pill on a sunken track, the one number that carries weight */}
                <View className="mt-8 flex-row items-baseline gap-3">
                  <Text className="font-mono-medium text-[30px] text-warm-white">{pct}%</Text>
                  <Text className="font-mono text-[13px] text-verdict-aedes-soft">{context}</Text>
                </View>
                <View className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-verdict-aedes-track">
                  <View
                    className="h-full rounded-pill bg-warm-white"
                    style={{ width: `${pct}%` }}
                  />
                </View>

                {/* fine-grained heads, recessed — rows exist only when a head reported (specs §6) */}
                {rows.length > 0 && (
                  <View className="mt-8 rounded-block bg-verdict-aedes-sunken px-5">
                    {rows.map((row, i) => (
                      <View
                        key={row.label}
                        className={`flex-row items-center justify-between py-4 ${
                          i === 0 ? '' : 'border-t border-verdict-aedes-line'
                        }`}
                      >
                        <Text className="font-plex text-[15px] text-verdict-aedes-soft">
                          {row.label}
                        </Text>
                        <Text className="font-mono text-[15px] text-warm-white">
                          {row.value}{' '}
                          <Text className="font-mono text-[15px] text-verdict-aedes-soft">
                            {row.suffix}
                          </Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* the stakes, raised */}
                <View className="mt-4 rounded-block bg-verdict-aedes-raised px-5 py-4">
                  <Text className="font-mono text-[12px] text-verdict-aedes-soft">
                    {c.result.whyThisMatters}
                  </Text>
                  <Text className="mt-2 font-plex text-[16px] leading-6 text-warm-white">
                    {c.result.aedesStakes}
                  </Text>
                </View>
              </View>

              <View className="flex-1" />

              {/* next move */}
              <View className="gap-3 pb-4">
                <Pressable
                  onPress={log}
                  disabled={logged}
                  accessibilityRole="button"
                  className="min-h-[52px] items-center justify-center rounded-pill bg-warm-white py-4 active:opacity-90 disabled:opacity-60"
                >
                  <Text className="font-plex-semibold text-[17px] text-verdict-aedes-deep">
                    {c.result.logDetection}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={discard}
                  disabled={logged}
                  accessibilityRole="button"
                  className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
                >
                  <Text className="font-plex-medium text-[15px] text-verdict-aedes-soft">
                    {c.result.discard}
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
  // to the abstain fallback.) No trust block: this verdict CAN be logged, so "nothing was saved"
  // would be a claim the screen cannot keep.
  const quietRows: ReadoutRow[] = [
    {
      label: c.result.speciesCall,
      value: confidence !== undefined ? score(confidence) : '—',
      suffix: confidence !== undefined ? c.result.floor(MSC_THRESHOLD.toFixed(2)) : undefined,
      prominent: true,
      fill: fillOf(confidence, MSC_THRESHOLD),
    },
    ...rows,
    audioRow(c),
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            onPress={discard}
            accessibilityRole="button"
            accessibilityLabel={c.common.backToCapture}
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← {c.result.back}</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-muted">{stamp}</Text>
        </View>

        <Animated.View entering={reveal} style={{ flex: 1 }}>
          {/* verdict */}
          <View className="mt-8">
            <Text className="font-plex-bold text-[34px] leading-10 text-ink">
              {c.result.notAedesHeadline}
            </Text>
            <Text className="mt-4 font-plex text-[16px] leading-6 text-muted">
              {c.result.notAedesBody}
            </Text>
          </View>

          {/* the instrument says why, in its own units */}
          <Readouts rows={quietRows} />

          <View className="flex-1" />

          {/* next move */}
          <View className="gap-3 pb-4">
            {canLog && (
              <Pressable
                onPress={log}
                disabled={logged}
                accessibilityRole="button"
                className="min-h-[52px] items-center justify-center rounded-pill bg-primary py-4 active:opacity-90 disabled:opacity-60"
              >
                <Text className="font-plex-semibold text-[17px] text-bg">
                  {c.result.logDetection}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={discard}
              disabled={logged}
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-muted">{c.result.discard}</Text>
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
  const c = useCopy();

  // A detected verdict must name a species the instrument can stand behind. A garbled species
  // param (hand-typed URL) falls through to the no_mosquito abstain with honest dashes — the
  // not_aedes layout would falsely claim "the wingbeat was clear enough to judge".
  if (params.kind === 'detected' && (params.species === 'aedes' || params.species === 'not_aedes'))
    return <Detected params={params} reducedMotion={reducedMotion} stamp={stamp} c={c} />;

  const abstain = abstainCopy(c);
  const reason = (params.reason ?? 'no_mosquito') as AbstainReason;
  const copy = abstain[reason] ?? abstain.no_mosquito;
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
            accessibilityLabel={c.common.backToCapture}
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← {c.result.back}</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-muted">{stamp}</Text>
        </View>

        {/* explicit flex style: className flex-1 is not applied reliably on reanimated views (web) */}
        <Animated.View entering={reveal} style={{ flex: 1 }}>
          {/* verdict */}
          <View className="mt-8">
            <Text className="font-plex-bold text-[34px] leading-10 text-ink">{copy.headline}</Text>
            <Text className="mt-4 font-plex text-[16px] leading-6 text-muted">{copy.body}</Text>
          </View>

          {/* the privacy claim, out of the paragraph and into its own block */}
          <TrustBlock c={c} />

          {/* the instrument says why, in its own units */}
          <Readouts rows={rows} />

          <View className="flex-1" />

          {/* next move */}
          <View className="gap-3 pb-4">
            <View className="items-center">
              <Text className="rounded-pill bg-tint-guide px-4 py-2 text-center font-plex text-[13px] text-tint-guide-ink">
                {copy.guidance}
              </Text>
            </View>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="min-h-[52px] items-center justify-center rounded-pill bg-primary py-4 active:opacity-90"
            >
              <Text className="font-plex-semibold text-[17px] text-bg">{c.result.listenAgain}</Text>
            </Pressable>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-muted">{c.result.done}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
