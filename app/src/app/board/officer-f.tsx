import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction F — SIGNAL. Round 2: information carried by visual form, not sentences.
// Dominant primitive: THE INSTRUMENT PANEL. One enormous numeral in a tick gauge, delta pills,
// one sparkline per watch area, and the directive as a single wide button-card.
// Wager: fastest glance-to-decision — an officer between site visits reads shapes, taps once.
//
// The gauge numeral is 14 detections / 72 h (specs.md §7 step 5), not an invented "risk score":
// §9 has no risk index and inventing one is a correctness defect. The arc encodes the state the
// spec does license — rising — as filled ticks running ok → caution → alert, no implied percentage.
//
// No svg: the arc is 28 <View>s, each in a full-bleed wrapper rotated about the centre so its
// child bar lands on the circumference. Sparklines are flex rows of variable-height Views.

const LINE = '#DDE3EA';
const SURFACE = '#F2F5F8';
const INK = '#15181D';
const MUTED = '#556170';
const COBALT = '#1E56A0';
const ALERT = '#C63A2B';
const CAUTION = '#9A6B15';
const OK = '#1F8A5D'; // 4.33:1 on white — shape fills only, never text

const TICKS = 28;
const FILLED = 21;
const SWEEP = 280;

function tickColor(i: number) {
  if (i >= FILLED) return LINE;
  if (i < 9) return OK;
  if (i < 16) return CAUTION;
  return ALERT;
}

function Spark({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data, 1);
  return (
    <View className="h-7 flex-1 flex-row items-end gap-[2px]">
      {data.map((v, i) => (
        <View
          key={i}
          className="flex-1"
          style={{
            height: Math.max(2, (v / max) * 28),
            borderRadius: 1,
            backgroundColor: v === 0 ? LINE : tone,
          }}
        />
      ))}
    </View>
  );
}

const WATCH = [
  {
    name: 'Taman Melati',
    data: [0, 1, 0, 1, 2, 1, 0, 2, 1, 2, 3, 4, 4, 6],
    tone: ALERT,
    value: '14',
    delta: '+6',
  },
  {
    name: 'Wangsa Maju',
    data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    tone: CAUTION,
    value: '3',
    delta: '+1',
  },
  {
    name: 'Danau Kota',
    data: [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    tone: MUTED,
    value: '0',
    delta: '11 h',
  },
];

export default function OfficerFSignal() {
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

      {/* ───────── the gauge ───────── */}
      <View className="flex-1 items-center justify-center">
        <View style={{ width: 248, height: 248, alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: TICKS }).map((_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                transform: [{ rotate: `${-SWEEP / 2 + (i * SWEEP) / (TICKS - 1)}deg` }],
              }}>
              <View
                style={{
                  width: i < FILLED ? 4 : 3,
                  height: i < FILLED ? 17 : 12,
                  borderRadius: 2,
                  backgroundColor: tickColor(i),
                }}
              />
            </View>
          ))}

          {/* centre readout */}
          <Text className="font-mono-medium text-[64px]" style={{ color: INK, lineHeight: 70 }}>
            14
          </Text>
          <Text className="mt-1 font-mono text-[13px]" style={{ color: MUTED }}>
            / 72 h
          </Text>
        </View>

        {/* the state, in the gauge's own gap */}
        <View
          className="-mt-3 flex-row items-center gap-2 rounded-full px-3 py-1"
          style={{ backgroundColor: ALERT }}>
          <Text className="font-mono-medium text-[11px] uppercase tracking-widest text-white">Rising</Text>
        </View>

        <View className="mt-3 flex-row items-baseline gap-2">
          <Text className="font-plex-semibold text-[17px]" style={{ color: INK }}>
            Taman Melati
          </Text>
          <Text className="font-mono text-[13px]" style={{ color: ALERT }}>
            B3–B5
          </Text>
        </View>
      </View>

      {/* delta pills + rainfall gauge */}
      <View className="mt-5 flex-row gap-2 px-5">
        {[
          { label: 'Detections', value: '6', delta: '+2', tone: ALERT },
          { label: 'Clusters', value: '1', delta: '+1', tone: ALERT },
          { label: 'Nodes', value: '23/26', delta: '−3', tone: MUTED },
        ].map((k) => (
          <View key={k.label} className="flex-1 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: SURFACE }}>
            <Text className="font-plex-medium text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>
              {k.label}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-1.5">
              <Text className="font-mono-medium text-[20px]" style={{ color: INK }}>
                {k.value}
              </Text>
              <Text className="font-mono text-[11px]" style={{ color: k.tone }}>
                {k.delta}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-2 flex-row items-center gap-3 px-5">
        <Text className="font-plex-medium text-[10px] uppercase tracking-wider" style={{ width: 34, color: MUTED }}>
          Rain
        </Text>
        <View className="h-6 flex-1 flex-row items-end gap-[3px]">
          {[2, 0, 0, 3, 1, 0, 0, 5, 2, 4, 6, 12, 16, 12].map((v, i) => (
            <View
              key={i}
              className="flex-1"
              style={{
                height: Math.max(2, (v / 16) * 24),
                borderRadius: 1,
                backgroundColor: v === 0 ? LINE : 'rgba(30,86,160,0.45)',
              }}
            />
          ))}
        </View>
        <Text className="font-mono-medium text-[13px]" style={{ color: COBALT }}>
          +40 mm
        </Text>
      </View>

      {/* ───────── watch areas ───────── */}
      <View className="mt-4 border-t px-5" style={{ borderColor: LINE }}>
        {WATCH.map((w) => (
          <View key={w.name} className="flex-row items-center gap-3 border-b py-4" style={{ borderColor: LINE }}>
            <Text className="font-plex-medium text-[13px]" style={{ width: 96, color: INK }}>
              {w.name}
            </Text>
            <Spark data={w.data} tone={w.tone} />
            <Text className="text-right font-mono-medium text-[15px]" style={{ width: 26, color: INK }}>
              {w.value}
            </Text>
            <View
              className="items-center rounded-full px-1.5 py-0.5"
              style={{
                width: 40,
                backgroundColor: SURFACE,
              }}>
              <Text className="font-mono text-[10px]" style={{ color: w.tone }}>
                {w.delta}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ───────── the directive, as the button ───────── */}
      <View className="mt-auto px-5 pb-5 pt-4">
        <Pressable className="flex-row items-center justify-between rounded-[10px] px-4 py-4" style={{ backgroundColor: COBALT }}>
          <View>
            <Text className="font-plex-semibold text-[20px] text-white">Fog within 48 h</Text>
            <Text className="mt-0.5 font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
              14 AUG 06:42
            </Text>
          </View>
          <View className="rounded-full bg-white px-3 py-2">
            <Text className="font-plex-semibold text-[13px]" style={{ color: COBALT }}>
              Acknowledge
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
