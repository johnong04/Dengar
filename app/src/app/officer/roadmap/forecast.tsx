import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoadmapHeader } from '@/components/RoadmapHeader';
import { useCopy } from '@/copy';
import { district, trend } from '@/data/district';
import { band, forecast } from '@/data/roadmap';

// v3 ROADMAP — PREDICTION TIMELINE (specs.md §5 v3: "7–14 day outbreak-risk forecast from detection
// density + rainfall").
//
// The chart is slice 13's vocabulary continued past `today`: the same measured detection bars, the
// same rainfall wash behind them, the same 1 px `today` rule and the same mono axis. What changes is
// what sits to the right of the rule — a BAND, not a line.
//
// Why a band, and why these two edges. A point forecast draws a number we cannot defend: specs §11
// item 3 lists "whether detection clusters predict human cases with enough lead time" as an OPEN
// hypothesis, so a confident path would be the chart lying about the state of the science. The band
// is bounded by two statements that are each one division off the measured series:
//   floor — the last 72 h rate simply holds.
//   ceiling — the measured 72 h-over-72 h growth runs for one MORE 72 h window, then holds.
// Nothing is compounded across the fortnight, so the ceiling is a bound and not a trajectory. Both
// edges, and their arithmetic, are printed under the chart in `src/data/roadmap.ts`'s own words.
//
// specs §10: we do not compete with D-MOSS on forecasting, we feed it. One line says so.
//
// No chart library (COMMON rule 1): the band is one absolutely-positioned View per day inside a flex
// slot, floor to ceiling, with 1 px edge rules — 14 slots abutting with no gap, so the fills read as
// one continuous region.

const CHART_H = 152;
const AXIS_W = 26;
const RAIN_W = 9;
const DET_W = 5;
/** Headroom above the ceiling so the band never touches the frame. */
const HEAD = 0.92;
/**
 * The rainfall series has its own unit and its own peak, so it needs its own scale — but it must
 * never out-rank the series the value axis belongs to. Capped at 55% of the frame: still readable
 * as shape and as context, never mistakable for the quantity being forecast.
 */
const RAIN_H = 0.55;

const PAST = trend.detections.length; // 14
const FUTURE = band.length; // +1…+14 d

/** value → pixels, on the ONE scale both the measured bars and the band are drawn against. */
const px = (v: number) => (v / forecast.scaleMax) * CHART_H * HEAD;

function Eyebrow({ children }: { children: string }) {
  return (
    <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
      {children}
    </Text>
  );
}

function LegendKey({ label, swatch }: { label: string; swatch: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {swatch}
      <Text className="font-mono text-[10px] text-o-muted">{label}</Text>
    </View>
  );
}

/** One derivation row: the edge's name, what it assumes, and the arithmetic that produces it. */
function EdgeRow({ name, assumption, math }: { name: string; assumption: string; math: string }) {
  return (
    <View className="border-t border-o-line py-2.5">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="font-plex-medium text-[13px] text-o-ink">{name}</Text>
        <Text className="shrink font-mono text-[11px] text-o-muted" numberOfLines={1}>
          {math}
        </Text>
      </View>
      <Text className="mt-[2px] font-plex text-[11px] text-o-muted">{assumption}</Text>
    </View>
  );
}

export default function RoadmapForecast() {
  const c = useCopy();
  return (
    <SafeAreaView className="flex-1 bg-o-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <RoadmapHeader
          title={c.officer.forecastTitle}
          kicker={c.officer.forecastKicker(district.name, forecast.horizonDays)}
        />

        {/* ── the readout ─────────────────────────────────────────────────────
            The band's plateau, stated as a range. There is deliberately no single headline number
            and no 0–100 risk score: a score needs a denominator §9 cannot source, which is exactly
            why officer-f's arc gauge was rejected. */}
        <View className="mt-4 px-5">
          <Eyebrow>{c.officer.perDayAt7}</Eyebrow>
          <View className="mt-1 flex-row items-baseline gap-2">
            <Text className="font-mono-medium text-[30px] text-o-ink">
              {forecast.basePerDay.toFixed(2)}
            </Text>
            <Text className="font-mono text-[20px] text-o-muted">–</Text>
            <Text className="font-mono-medium text-[30px] text-o-alert">
              {forecast.highPerDay.toFixed(1)}
            </Text>
            <Text className="font-plex text-[13px] text-o-muted">{c.officer.modelledRange}</Text>
          </View>
          <Text className="mt-1 font-plex text-[13px] text-o-muted">{c.officer.dmoss}</Text>
        </View>

        {/* ── the chart ───────────────────────────────────────────────────── */}
        <View className="mt-4 px-5">
          <View className="flex-row items-center gap-3.5">
            <LegendKey
              label={c.officer.legendDetections}
              swatch={<View className="h-2 w-2 rounded-[2px] bg-o-alert" />}
            />
            <LegendKey
              label={c.officer.legendRain}
              swatch={<View className="h-2 w-2 rounded-[2px] bg-o-primary-wash" />}
            />
            <LegendKey
              label={c.officer.legendBand}
              swatch={
                <View className="h-2 w-3 rounded-[1px] border border-o-alert bg-o-alert-ghost" />
              }
            />
          </View>

          <View className="mt-2.5 flex-row" style={{ height: CHART_H }}>
            {/* value axis — one scale for measured and modelled, so the band cannot be read at a
                flattering zoom the bars do not share */}
            <View className="justify-between pr-1.5" style={{ width: AXIS_W }}>
              <Text className="text-right font-mono text-[10px] text-o-muted">
                {Math.round(forecast.scaleMax)}
              </Text>
              <Text className="text-right font-mono text-[10px] text-o-muted">0</Text>
            </View>

            {/* measured: 14 days, rain behind, detections in front */}
            <View className="flex-row items-end" style={{ flex: PAST, height: CHART_H }}>
              {trend.detections.map((d, i) => (
                <View
                  key={`m${i}`}
                  className="flex-1 items-center justify-end"
                  style={{ height: CHART_H }}
                >
                  <View
                    className="absolute bottom-0 rounded-t-[2px] bg-o-primary-wash"
                    style={{
                      width: RAIN_W,
                      height: Math.max(1, (trend.rainMm[i] / trend.peak.rainMm) * CHART_H * RAIN_H),
                    }}
                  />
                  <View
                    className="rounded-t-[2px] bg-o-alert"
                    style={{ width: DET_W, height: Math.max(2, px(d)) }}
                  />
                </View>
              ))}
            </View>

            {/* today */}
            <View className="bg-o-ink" style={{ width: 1, height: CHART_H }} />

            {/* the band: floor → ceiling, one View per day, no gaps between slots. The two edge
                values ride inside the band at its plateau, so the chart states its own range and
                does not depend on the readout above it being in frame. */}
            <View className="flex-row items-end" style={{ flex: FUTURE, height: CHART_H }}>
              {band.map((b) => {
                const low = px(b.low);
                const high = px(b.high);
                return (
                  <View key={b.day} className="flex-1" style={{ height: CHART_H }}>
                    <View
                      className="border-y border-o-alert bg-o-alert-ghost"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: low,
                        height: Math.max(2, high - low),
                      }}
                    />
                  </View>
                );
              })}
              {/* Painted last so they sit over the fill. */}
              <Text
                className="font-mono-medium text-[10px] text-o-alert"
                style={{
                  position: 'absolute',
                  right: 3,
                  bottom: px(forecast.highPerDay) - 13,
                }}
              >
                {forecast.highPerDay.toFixed(1)}
              </Text>
              <Text
                className="font-mono text-[10px] text-o-muted"
                style={{
                  position: 'absolute',
                  right: 3,
                  bottom: px(forecast.basePerDay) + 3,
                }}
              >
                {forecast.basePerDay.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* axis */}
          <View className="flex-row">
            <View style={{ width: AXIS_W }} />
            <View className="h-[1px] flex-1 bg-o-line" />
          </View>
          <View className="mt-1.5 flex-row items-center">
            <View style={{ width: AXIS_W }} />
            <Text className="font-mono text-[10px] text-o-muted" style={{ flex: PAST }}>
              −{PAST} d
            </Text>
            <Text className="font-mono-medium text-[10px] text-o-ink">0</Text>
            <View className="flex-row justify-between" style={{ flex: FUTURE }}>
              <Text className="pl-1 font-mono text-[10px] text-o-muted">{c.officer.today}</Text>
              <Text className="font-mono text-[10px] text-o-muted">+{forecast.horizonDays} d</Text>
            </View>
          </View>
        </View>

        {/* ── inputs ──────────────────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <Eyebrow>{c.officer.inputs}</Eyebrow>
          <View className="mt-2 flex-row gap-2">
            <View className="flex-1 rounded-card bg-o-surface px-3 py-2.5">
              <Text className="font-plex text-[11px] text-o-muted">
                {c.officer.detectionDensity}
              </Text>
              <Text className="mt-[2px] font-mono-medium text-[15px] text-o-ink">
                {forecast.windowCount} / {forecast.windowHours} h
              </Text>
            </View>
            <View className="flex-1 rounded-card bg-o-surface px-3 py-2.5">
              <Text className="font-plex text-[11px] text-o-muted">
                {c.officer.rainfallSameWindow}
              </Text>
              <Text className="mt-[2px] font-mono-medium text-[15px] text-o-primary">
                +{forecast.rainMm} mm
              </Text>
            </View>
          </View>
          {/* Honest about HOW rainfall enters: it decides which edge you plan against. Multiplying
              the band by a rainfall coefficient would be an invented figure — §9 has none. */}
          <Text className="mt-2 font-plex text-[11px] text-o-muted">{c.officer.rainfallNote}</Text>
        </View>

        {/* ── how the band is drawn ───────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <Eyebrow>{c.officer.howBandDrawn}</Eyebrow>
          <View className="mt-1">
            <EdgeRow
              name={c.officer.floor}
              assumption={c.officer.floorAssumption}
              math={forecast.lowMath}
            />
            <EdgeRow
              name={c.officer.ceiling}
              assumption={c.officer.ceilingAssumption}
              math={forecast.highMath}
            />
          </View>
          <Text className="mt-2 font-plex text-[11px] text-o-muted">{c.officer.bandNote}</Text>
        </View>

        {/* ── what the band buys ──────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <View className="rounded-card bg-o-surface px-4 py-3">
            <Text className="font-plex-medium text-[15px] text-o-ink">
              {c.officer.caseNotification(forecast.leadDays.from, forecast.leadDays.to)}
            </Text>
            <Text className="mt-1 font-plex text-[13px] text-o-muted">
              {c.officer.caseNotificationNote}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
