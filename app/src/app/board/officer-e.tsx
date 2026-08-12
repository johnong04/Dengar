import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction E — TREND. Round 2: information carried by visual form, not sentences.
// Dominant primitive: TIME. A 14-day detection chart with the rainfall series behind it, then the
// thing the whole pitch rests on drawn to scale — the 14–21 day gap between the acoustic signal
// and the clinical cases that trigger fogging today (specs.md §7 step 1). Plus an hour×day heat
// grid, because Aedes bites in daylight and that shows in the grid, not in a paragraph.
//
// No svg: bars are flex-row Views with computed heights; the gap bracket is 1 px Views; the heat
// grid is 28 tinted Views. Only the gated officer light column, plus alpha tints of cobalt/alert.

const LINE = '#DDE3EA';
const SURFACE = '#F2F5F8';
const INK = '#15181D';
const MUTED = '#556170';
const COBALT = '#1E56A0';
const ALERT = '#C63A2B';
const CAUTION = '#9A6B15';

// last 14 days. The final three sum to 14 — the cluster (specs.md §7 step 5).
const DETECTIONS = [0, 1, 0, 1, 2, 1, 0, 2, 1, 2, 3, 4, 4, 6];
// rainfall mm/day. The final three sum to +40.
const RAIN = [2, 0, 0, 3, 1, 0, 0, 5, 2, 4, 6, 12, 16, 12];
// where clinical cases would surface if we waited for them: +14 to +21 days.
const CASES = [1, 3, 6, 9, 11, 8, 5];

const CHART_H = 168;
const D_MAX = 6;
const R_MAX = 16;
const C_MAX = 11;

// hour band × weekday. Daylight-biting vector: the two middle bands carry it.
const HEAT = [
  [0, 0, 0, 1, 0, 0, 1], // 18–24
  [1, 0, 2, 2, 1, 3, 3], // 12–18
  [1, 2, 1, 3, 2, 4, 5], // 06–12
  [0, 0, 0, 0, 1, 0, 1], // 00–06
];
const HEAT_ROWS = ['18–24', '12–18', '06–12', '00–06'];
const HEAT_MAX = 5;

const SPARK_MELATI = [0, 1, 0, 1, 2, 1, 0, 2, 1, 2, 3, 4, 4, 6];
const SPARK_WANGSA = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
const SPARK_DANAU = [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0];

function Spark({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data, 1);
  return (
    <View className="h-6 flex-1 flex-row items-end gap-[2px]">
      {data.map((v, i) => (
        <View
          key={i}
          className="flex-1"
          style={{
            height: Math.max(2, (v / max) * 24),
            borderRadius: 1,
            backgroundColor: v === 0 ? LINE : tone,
          }}
        />
      ))}
    </View>
  );
}

export default function OfficerETrend() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* header */}
      <View className="flex-row items-center justify-between border-b px-5 pb-3 pt-4" style={{ borderColor: LINE }}>
        <Text className="font-plex-semibold text-[15px]" style={{ color: INK }}>
          Setapak
        </Text>
        <Text className="font-mono text-[12px]" style={{ color: MUTED }}>
          TUE 12 AUG · 07:04
        </Text>
      </View>

      {/* today's numbers */}
      <View className="flex-row border-b" style={{ borderColor: LINE }}>
        {[
          { label: 'Detections', value: '6', delta: '+2', tone: ALERT },
          { label: 'Clusters', value: '1', delta: '+1', tone: ALERT },
          { label: 'Nodes', value: '23/26', delta: '−3', tone: MUTED },
        ].map((k, i) => (
          <View
            key={k.label}
            className="flex-1 px-4 py-2.5"
            style={i < 2 ? { borderRightWidth: 1, borderColor: LINE } : undefined}>
            <Text className="font-plex-medium text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>
              {k.label}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-1.5">
              <Text className="font-mono-medium text-[22px]" style={{ color: INK }}>
                {k.value}
              </Text>
              <View className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: SURFACE }}>
                <Text className="font-mono text-[10px]" style={{ color: k.tone }}>
                  {k.delta}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* the directive, one emphasized strip */}
      <View className="mx-5 mt-4 flex-row overflow-hidden rounded-[10px]" style={{ backgroundColor: SURFACE }}>
        <View style={{ width: 4, backgroundColor: ALERT }} />
        <View className="flex-1 flex-row items-center justify-between gap-3 px-4 py-3.5">
          <View className="flex-1">
            <Text className="font-plex-semibold text-[17px]" style={{ color: INK }}>
              Fog within 48 h
            </Text>
            <Text className="mt-0.5 font-mono text-[12px]" style={{ color: ALERT }}>
              Taman Melati · B3–B5
            </Text>
          </View>
          <Pressable className="shrink-0 rounded-[10px] px-3.5 py-2.5" style={{ backgroundColor: COBALT }}>
            <Text className="font-plex-semibold text-[13px] text-white">Acknowledge</Text>
          </Pressable>
        </View>
      </View>

      {/* ───────── the time series ───────── */}
      <View className="mt-5 px-5">
        {/* legend */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: ALERT }} />
            <Text className="font-mono text-[10px]" style={{ color: MUTED }}>
              detections
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: 'rgba(30,86,160,0.30)' }} />
            <Text className="font-mono text-[10px]" style={{ color: MUTED }}>
              rain mm
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 2, borderWidth: 1, borderColor: ALERT }} />
            <Text className="font-mono text-[10px]" style={{ color: MUTED }}>
              cases
            </Text>
          </View>
        </View>

        {/* the 14–21 d bracket, drawn to the same scale as the bars below it */}
        <View className="mt-3 h-4 flex-row items-center">
          <View style={{ flex: 14 }} />
          <View className="flex-row items-center" style={{ flex: 7 }}>
            <View style={{ width: 1, height: 8, backgroundColor: ALERT }} />
            <View className="h-[1px] flex-1" style={{ backgroundColor: ALERT }} />
            <View className="rounded-full px-1.5 py-[1px]" style={{ backgroundColor: ALERT }}>
              <Text className="font-mono-medium text-[10px] text-white">14–21 d</Text>
            </View>
            <View className="h-[1px] flex-1" style={{ backgroundColor: ALERT }} />
            <View style={{ width: 1, height: 8, backgroundColor: ALERT }} />
          </View>
        </View>

        {/* bars: rain behind, detections in front, ghosted cases after today */}
        <View className="flex-row items-end" style={{ height: CHART_H }}>
          {DETECTIONS.map((d, i) => (
            <View key={`h${i}`} className="flex-1 items-center justify-end" style={{ height: CHART_H }}>
              <View className="w-full items-center justify-end" style={{ height: CHART_H }}>
                {/* rain, behind */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 15,
                    height: Math.max(1, (RAIN[i] / R_MAX) * CHART_H),
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    backgroundColor: 'rgba(30,86,160,0.22)',
                  }}
                />
                {/* detections, in front */}
                <View
                  style={{
                    bottom: 0,
                    width: 6,
                    height: Math.max(2, (d / D_MAX) * CHART_H),
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    backgroundColor: ALERT,
                  }}
                />
              </View>
            </View>
          ))}
          {/* today */}
          <View style={{ width: 1, height: CHART_H, backgroundColor: INK }} />
          {CASES.map((c, i) => (
            <View key={`f${i}`} className="flex-1 items-center justify-end" style={{ height: CHART_H }}>
              <View
                style={{
                  width: 13,
                  height: Math.max(3, (c / C_MAX) * CHART_H),
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  borderWidth: 1,
                  borderColor: ALERT,
                  backgroundColor: 'rgba(198,58,43,0.06)',
                }}
              />
            </View>
          ))}
        </View>

        {/* axis */}
        <View className="h-[1px] w-full" style={{ backgroundColor: LINE }} />
        <View className="mt-1.5 flex-row">
          <Text className="font-mono text-[10px]" style={{ flex: 14, color: MUTED }}>
            −14 d
          </Text>
          <Text className="font-mono-medium text-[10px]" style={{ color: INK }}>
            0
          </Text>
          <Text className="text-right font-mono text-[10px]" style={{ flex: 7, color: MUTED }}>
            +21 d
          </Text>
        </View>
      </View>

      {/* ───────── hour × day ───────── */}
      <View className="mt-5 px-5">
        {HEAT.map((row, r) => (
          <View key={HEAT_ROWS[r]} className="mb-[3px] flex-row items-center">
            <Text className="font-mono text-[10px]" style={{ width: 44, color: MUTED }}>
              {HEAT_ROWS[r]}
            </Text>
            {row.map((v, c) => (
              <View
                key={c}
                className="mr-[3px] flex-1"
                style={{
                  height: 30,
                  borderRadius: 3,
                  backgroundColor:
                    v === 0 ? SURFACE : `rgba(198,58,43,${(0.14 + (v / HEAT_MAX) * 0.86).toFixed(2)})`,
                }}
              />
            ))}
          </View>
        ))}
        <View className="flex-row">
          <View style={{ width: 44 }} />
          {['06', '07', '08', '09', '10', '11', '12'].map((d) => (
            <Text key={d} className="mr-[3px] flex-1 text-center font-mono text-[10px]" style={{ color: MUTED }}>
              {d}
            </Text>
          ))}
        </View>
      </View>

      {/* ───────── watch list, as sparklines ───────── */}
      <View className="mt-6 border-t px-5" style={{ borderColor: LINE }}>
        {[
          { name: 'Taman Melati', data: SPARK_MELATI, tone: ALERT, value: '14', delta: '+6' },
          { name: 'Wangsa Maju', data: SPARK_WANGSA, tone: CAUTION, value: '3', delta: '+1' },
          { name: 'Danau Kota', data: SPARK_DANAU, tone: MUTED, value: '0', delta: '11 h' },
        ].map((w) => (
          <View key={w.name} className="flex-row items-center gap-3 border-b py-4" style={{ borderColor: LINE }}>
            <Text className="font-plex-medium text-[13px]" style={{ width: 96, color: INK }}>
              {w.name}
            </Text>
            <Spark data={w.data} tone={w.tone} />
            <Text className="text-right font-mono-medium text-[13px]" style={{ width: 26, color: INK }}>
              {w.value}
            </Text>
            <Text className="text-right font-mono text-[11px]" style={{ width: 32, color: w.tone }}>
              {w.delta}
            </Text>
          </View>
        ))}
      </View>

    </SafeAreaView>
  );
}
