import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { activeCluster, district, heat, kpis, trend, watchAreas, type Tone } from '@/data/district';

// Officer HOME — Trend (gated direction officer-e, plus John's two amendments).
//
// The screen's centre is one chart that states the pitch as a shape: 14 days of rising detections
// with the rainfall series behind them at its own scale, a `today` rule, an explicit axis break,
// then HOLLOW bars at +14…+21 d for the clinical cases that dispatch fogging today. The bracket
// and the legend both name that series `projected`, and a caption says it is not measured.
//
// No chart library and no svg (COMMON rule 1): bars are variable-height Views inside flex slots,
// the rainfall series is an absolutely-positioned wider View behind each detection bar, the axis
// break is two 1px Views under `transform: rotate`, the heat grid is 28 Views whose alpha comes
// from `opacity` on an `o-alert` ground (so the ramp composites over the real parent without any
// hand-written rgba), and the bracket is 1px rules either side of a pill.
//
// Tokens only — every color is a named officer token from tailwind.tokens.js.

const CHART_H = 144;
const RAIN_W = 15;
const DET_W = 6;
const GHOST_W = 12;
const HEAT_CELL_H = 26;
const HEAT_LABEL_W = 42;

const PAST_DAYS = trend.detections.length; // 14
const FUTURE_DAYS = trend.projectedCases.length; // +14…+21 d inclusive

/** Semantic tone → officer token. Kept literal so the Tailwind scanner sees every class. */
const TONE_TEXT: Record<Tone, string> = {
  alert: 'text-o-alert',
  caution: 'text-o-caution',
  neutral: 'text-o-muted',
};
const TONE_BG: Record<Tone, string> = {
  alert: 'bg-o-alert',
  caution: 'bg-o-caution',
  neutral: 'bg-o-muted',
};

function Eyebrow({ children }: { children: string }) {
  return (
    <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">{children}</Text>
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

function Spark({ data, tone }: { data: readonly number[]; tone: Tone }) {
  const max = Math.max(...data, 1);
  return (
    <View className="h-6 flex-1 flex-row items-end gap-[2px]">
      {data.map((v, i) => (
        <View
          key={i}
          className={`flex-1 rounded-[1px] ${v === 0 ? 'bg-o-line' : TONE_BG[tone]}`}
          style={{ height: Math.max(2, (v / max) * 24) }}
        />
      ))}
    </View>
  );
}

export default function OfficerHome() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-o-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* ── district header ───────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between border-b border-o-line px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2">
            <Text className="font-plex-semibold text-[17px] text-o-ink">{district.name}</Text>
            {district.simulated ? (
              <View className="rounded-pill bg-o-surface px-2 py-[2px]">
                <Text className="font-mono text-[10px] text-o-muted">simulated</Text>
              </View>
            ) : null}
          </View>
          <Text className="font-mono text-[11px] text-o-muted">{district.stamp}</Text>
        </View>

        {/* ── KPI trio ──────────────────────────────────────────────────── */}
        <View className="flex-row border-b border-o-line">
          {kpis.map((k, i) => (
            <View
              key={k.key}
              className={`flex-1 px-4 py-2.5 ${i < kpis.length - 1 ? 'border-r border-o-line' : ''}`}>
              <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
                {k.label}
              </Text>
              <View className="mt-1 flex-row items-baseline gap-1.5">
                <Text className="font-mono-medium text-[22px] text-o-ink">{k.value}</Text>
                <View className="rounded-pill bg-o-surface px-1.5 py-[1px]">
                  <Text className={`font-mono text-[11px] ${TONE_TEXT[k.tone]}`}>{k.delta}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── the directive ─────────────────────────────────────────────────
            John's amendment 1: officer-f's weight — a wide cobalt button-card, so the next action
            is unmistakable. Amendment 2: the banned red border-left stripe is gone; urgency is
            carried by the cobalt ground itself and by the alert-toned figures elsewhere. */}
        <View className="mx-5 mt-4 flex-row items-center gap-3 rounded-card bg-o-primary px-4 py-3.5">
          <View className="flex-1">
            {/* specs.md §1's directive, verbatim in intent: "fog here, within 48 hours". */}
            <Text className="font-plex-semibold text-[17px] text-o-bg">Fog within 48 h</Text>
            <Text numberOfLines={1} className="mt-[3px] font-mono text-[11px] text-o-surface">
              {activeCluster.area} · {activeCluster.blocks}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAcknowledged(true)}
            className="min-h-[44px] shrink-0 justify-center rounded-card bg-o-bg px-4"
            style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
            <Text className="text-center font-plex-semibold text-[13px] text-o-primary">
              {acknowledged ? 'Acknowledged' : 'Acknowledge'}
            </Text>
          </Pressable>
        </View>

        {/* ── the 14-day chart ──────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <View className="flex-row items-center justify-between">
            <Eyebrow>Trend</Eyebrow>
            <View className="flex-row items-center gap-3.5">
              <LegendKey label="detections" swatch={<View className="h-2 w-2 rounded-[2px] bg-o-alert" />} />
              <LegendKey
                label="rain mm"
                swatch={<View className="h-2 w-2 rounded-[2px] bg-o-primary-wash" />}
              />
              <LegendKey
                label="cases · projected"
                swatch={
                  <View className="h-2 w-2 rounded-[2px] border border-o-alert bg-o-alert-ghost" />
                }
              />
            </View>
          </View>

          {/* bracket row: `today` label over the measured span, the 14–21 d bracket over the ghosts */}
          <View className="mt-2.5 h-4 flex-row items-center">
            <Text
              className="pr-1.5 text-right font-mono text-[10px] text-o-muted"
              style={{ flex: PAST_DAYS }}>
              today
            </Text>
            <View style={{ width: 1 }} />
            <View style={{ width: 18 }} />
            <View className="flex-row items-center" style={{ flex: FUTURE_DAYS }}>
              <View className="h-2 w-[1px] bg-o-alert" />
              <View className="h-[1px] flex-1 bg-o-alert" />
              <View className="rounded-pill bg-o-alert px-1.5 py-[1px]">
                <Text className="font-mono-medium text-[10px] text-o-bg">
                  {trend.leadDays.from}–{trend.leadDays.to} d
                </Text>
              </View>
              <View className="h-[1px] flex-1 bg-o-alert" />
              <View className="h-2 w-[1px] bg-o-alert" />
            </View>
          </View>

          {/* the bars */}
          <View className="flex-row items-end" style={{ height: CHART_H }}>
            {/* measured: rain behind, detections in front */}
            <View className="flex-row items-end" style={{ flex: PAST_DAYS, height: CHART_H }}>
              {trend.detections.map((d, i) => (
                <View key={`m${i}`} className="flex-1 items-center justify-end" style={{ height: CHART_H }}>
                  <View
                    className="absolute bottom-0 rounded-t-[2px] bg-o-primary-wash"
                    style={{
                      width: RAIN_W,
                      height: Math.max(1, (trend.rainMm[i] / trend.peak.rainMm) * CHART_H),
                    }}
                  />
                  <View
                    className="rounded-t-[2px] bg-o-alert"
                    style={{
                      width: DET_W,
                      height: Math.max(2, (d / trend.peak.detections) * CHART_H),
                    }}
                  />
                </View>
              ))}
            </View>

            {/* today */}
            <View className="bg-o-ink" style={{ width: 1, height: CHART_H }} />

            {/* axis break — the 13 unobserved days are not drawn, and the break says so */}
            <View className="items-center justify-end" style={{ width: 18, height: CHART_H }}>
              <View className="h-4 w-3 items-center justify-center">
                <View
                  className="absolute h-4 w-[1px] bg-o-muted"
                  style={{ left: 3, transform: [{ rotate: '20deg' }] }}
                />
                <View
                  className="absolute h-4 w-[1px] bg-o-muted"
                  style={{ right: 3, transform: [{ rotate: '20deg' }] }}
                />
              </View>
            </View>

            {/* projected: hollow, so it can never read as measured */}
            <View className="flex-row items-end" style={{ flex: FUTURE_DAYS, height: CHART_H }}>
              {trend.projectedCases.map((c, i) => (
                <View key={`p${i}`} className="flex-1 items-center justify-end" style={{ height: CHART_H }}>
                  <View
                    className="rounded-t-[2px] border border-o-alert bg-o-alert-ghost"
                    style={{
                      width: GHOST_W,
                      // 0.94 leaves the 14–21 d bracket air above the peak.
                      height: Math.max(4, (c / trend.peak.projectedCases) * CHART_H * 0.94),
                    }}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* axis */}
          <View className="h-[1px] w-full bg-o-line" />
          <View className="mt-1.5 flex-row items-center">
            <Text className="font-mono text-[10px] text-o-muted" style={{ flex: PAST_DAYS }}>
              −{PAST_DAYS} d
            </Text>
            <Text className="font-mono-medium text-[10px] text-o-ink">0</Text>
            <View style={{ width: 18 }} />
            <View className="flex-row justify-between" style={{ flex: FUTURE_DAYS }}>
              <Text className="font-mono text-[10px] text-o-muted">+{trend.leadDays.from} d</Text>
              <Text className="font-mono text-[10px] text-o-muted">+{trend.leadDays.to} d</Text>
            </View>
          </View>
          <Text className="mt-1 text-right font-mono text-[10px] text-o-muted">projected, not measured</Text>
        </View>

        {/* ── hour × day ────────────────────────────────────────────────── */}
        <View className="mt-4 px-5">
          <Eyebrow>Hour × day</Eyebrow>
          <View className="mt-2">
            {heat.values.map((row, r) => (
              <View key={heat.rows[r]} className="mb-[3px] flex-row items-center gap-[3px]">
                <Text className="font-mono text-[10px] text-o-muted" style={{ width: HEAT_LABEL_W }}>
                  {heat.rows[r]}
                </Text>
                {row.map((v, c) =>
                  v === 0 ? (
                    <View
                      key={c}
                      className="flex-1 rounded-[3px] bg-o-surface"
                      style={{ height: HEAT_CELL_H }}
                    />
                  ) : (
                    <View
                      key={c}
                      className="flex-1 rounded-[3px] bg-o-alert"
                      style={{ height: HEAT_CELL_H, opacity: 0.14 + (v / heat.max) * 0.86 }}
                    />
                  ),
                )}
              </View>
            ))}
            <View className="flex-row gap-[3px]">
              <View style={{ width: HEAT_LABEL_W }} />
              {heat.cols.map((d) => (
                <Text key={d} className="flex-1 text-center font-mono text-[10px] text-o-muted">
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── watch areas ───────────────────────────────────────────────── */}
        <View className="mt-4 border-t border-o-line px-5 pt-3">
          <Eyebrow>Watch areas</Eyebrow>
          {watchAreas.map((w) => (
            /* The cast drops out in slice 14, when /officer/cluster/[id] exists and typed routes
               know the path. Until then a tap lands on not-found — the href is already correct. */
            <Link key={w.id} href={`/officer/cluster/${w.id}` as Href} asChild>
              <Pressable
                accessibilityRole="link"
                className="min-h-[52px] flex-row items-center gap-3 border-b border-o-line py-3"
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
                <Text className="font-plex-medium text-[13px] text-o-ink" style={{ width: 92 }}>
                  {w.name}
                </Text>
                <Spark data={w.spark} tone={w.tone} />
                <Text
                  className="text-right font-mono-medium text-[13px] text-o-ink"
                  style={{ width: 24 }}>
                  {w.count}
                </Text>
                <Text className={`text-right font-mono text-[11px] ${TONE_TEXT[w.tone]}`} style={{ width: 30 }}>
                  {w.delta}
                </Text>
                <Text className="font-mono text-[13px] text-o-muted">›</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
