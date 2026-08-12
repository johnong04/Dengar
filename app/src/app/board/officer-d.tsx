import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction D — MAP. Round 2: information carried by visual form, not sentences.
// Dominant primitive: GEOGRAPHY. A hand-composed district map surface fills the top ~55%;
// the directive rides over it as a compact bottom sheet. Wager: officers think in geography —
// "which streets does the truck drive down" is answered by looking, not reading.
//
// No svg, no charting lib (both are native modules; installing one costs a 1.5 h EAS rebuild).
// The whole map is absolutely-positioned <View>s over one container: rotated rects for the
// trunk road and river, bordered rects for blocks, borderRadius:999 circles for detections and
// the cluster ring. Palette is only the gated officer light column + alpha tints derived from it.

const LAND = '#F2F5F8';
const SURFACE = '#F2F5F8';
const ROAD = '#FFFFFF';
const WATER = '#DDE3EA';
const LINE = '#DDE3EA';
const INK = '#15181D';
const MUTED = '#556170';
const COBALT = '#1E56A0';
const ALERT = '#C63A2B';
const CAUTION = '#9A6B15';

type Block = { id: string; x: number; y: number; w: number; h: number; hot?: boolean };
const BLOCKS: Block[] = [
  { id: 'B1', x: 100, y: 86, w: 56, h: 80 },
  { id: 'B2', x: 162, y: 86, w: 56, h: 80 },
  { id: 'B3', x: 240, y: 86, w: 52, h: 80, hot: true },
  { id: 'B4', x: 298, y: 86, w: 66, h: 80, hot: true },
  { id: 'B5', x: 240, y: 200, w: 52, h: 104, hot: true },
  { id: 'B6', x: 298, y: 200, w: 66, h: 104 },
  { id: 'B7', x: 100, y: 200, w: 56, h: 104 },
  { id: 'B8', x: 162, y: 200, w: 56, h: 104 },
];
// unlabelled parcels — map texture south of the surveyed blocks, no data attached
const PARCELS = [
  { x: 100, y: 338, w: 56, h: 82 },
  { x: 162, y: 338, w: 56, h: 82 },
  { x: 240, y: 338, w: 52, h: 82 },
  { x: 298, y: 338, w: 66, h: 82 },
];

// age: 0 = under 24 h, 1 = 24–48 h, 2 = 48–72 h. Size and colour both carry recency.
type Dot = { x: number; y: number; age: 0 | 1 | 2 };
const DOTS: Dot[] = [
  // the 14 inside Blocks 3–5
  { x: 252, y: 104, age: 0 },
  { x: 268, y: 122, age: 0 },
  { x: 281, y: 100, age: 1 },
  { x: 258, y: 142, age: 0 },
  { x: 276, y: 152, age: 2 },
  { x: 312, y: 108, age: 0 },
  { x: 334, y: 126, age: 0 },
  { x: 352, y: 104, age: 1 },
  { x: 322, y: 146, age: 1 },
  { x: 344, y: 155, age: 2 },
  { x: 252, y: 216, age: 0 },
  { x: 272, y: 234, age: 0 },
  { x: 258, y: 258, age: 1 },
  { x: 276, y: 284, age: 2 },
  // the quieter watch area, and one lone report
  { x: 118, y: 232, age: 2 },
  { x: 136, y: 258, age: 2 },
  { x: 122, y: 282, age: 1 },
  { x: 186, y: 118, age: 2 },
];
const DOT_SIZE = [12, 9, 7];
const DOT_FILL = [ALERT, CAUTION, MUTED];

export default function OfficerDMap() {
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

      {/* today's numbers — numerals, delta pills, three words of label */}
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
              <View
                className="rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: SURFACE }}>
                <Text className="font-mono text-[10px]" style={{ color: k.tone }}>
                  {k.delta}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ───────── the map surface ───────── */}
      <View className="flex-1 overflow-hidden" style={{ backgroundColor: LAND }}>
        {/* street grid */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 70, height: 7, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 182, height: 10, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 316, height: 7, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 428, height: 7, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 84, width: 9, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 226, width: 8, backgroundColor: ROAD }} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 292, width: 6, backgroundColor: ROAD }} />
        {/* trunk road, off-grid */}
        <View
          style={{
            position: 'absolute',
            left: -60,
            top: 466,
            width: 520,
            height: 11,
            backgroundColor: ROAD,
            transform: [{ rotate: '-11deg' }],
          }}
        />
        {/* river */}
        <View
          style={{
            position: 'absolute',
            left: -70,
            top: 508,
            width: 560,
            height: 38,
            backgroundColor: WATER,
            transform: [{ rotate: '-7deg' }],
          }}
        />

        {/* parcels */}
        {PARCELS.map((p, i) => (
          <View
            key={`p${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
            }}
          />
        ))}

        {/* cluster ring — the one thing the eye lands on */}
        <View
          style={{
            position: 'absolute',
            left: 196,
            top: 74,
            width: 214,
            height: 214,
            borderRadius: 107,
            borderWidth: 2,
            borderColor: ALERT,
            backgroundColor: 'rgba(198,58,43,0.05)',
          }}
        />

        {/* blocks */}
        {BLOCKS.map((b) => (
          <View
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: b.hot ? ALERT : LINE,
              backgroundColor: b.hot ? 'rgba(198,58,43,0.12)' : '#FFFFFF',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: 4,
            }}>
            <Text className="font-mono text-[9px]" style={{ color: b.hot ? INK : MUTED }}>
              {b.id}
            </Text>
          </View>
        ))}

        {/* detections */}
        {DOTS.map((d, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: DOT_SIZE[d.age],
              height: DOT_SIZE[d.age],
              borderRadius: 999,
              backgroundColor: DOT_FILL[d.age],
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
            }}
          />
        ))}

        {/* legend — dots, then numerals only */}
        <View
          className="flex-row items-center gap-3 rounded-full border px-2.5 py-1.5"
          style={{ position: 'absolute', left: 16, top: 12, backgroundColor: '#FFFFFF', borderColor: LINE }}>
          {[
            [ALERT, '< 24 h'],
            [CAUTION, '48 h'],
            [MUTED, '72 h'],
          ].map(([c, l]) => (
            <View key={l} className="flex-row items-center gap-1.5">
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: c }} />
              <Text className="font-mono text-[10px]" style={{ color: MUTED }}>
                {l}
              </Text>
            </View>
          ))}
        </View>

        {/* rainfall, as a filled gauge not a sentence */}
        <View
          className="rounded-full border px-2.5 py-1.5"
          style={{ position: 'absolute', right: 16, top: 12, backgroundColor: '#FFFFFF', borderColor: LINE }}>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-plex-medium text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>
              Rain
            </Text>
            <Text className="font-mono-medium text-[11px]" style={{ color: COBALT }}>
              +40 mm
            </Text>
          </View>
          <View className="mt-1 flex-row items-end gap-[3px]">
            {[6, 9, 14, 20, 26, 22].map((h, i) => (
              <View
                key={i}
                style={{ width: 6, height: h, borderRadius: 1, backgroundColor: 'rgba(30,86,160,0.35)' }}
              />
            ))}
          </View>
        </View>

        {/* pins */}
        <View
          className="flex-row items-center gap-2 rounded-full px-2.5 py-1"
          style={{ position: 'absolute', left: 214, top: 46, backgroundColor: ALERT }}>
          <Text className="font-plex-semibold text-[11px] text-white">Taman Melati</Text>
          <Text className="font-mono-medium text-[11px] text-white">14</Text>
        </View>
        <View
          className="flex-row items-center gap-2 rounded-full border px-2.5 py-1"
          style={{ position: 'absolute', left: 96, top: 306, backgroundColor: '#FFFFFF', borderColor: LINE }}>
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: CAUTION }} />
          <Text className="font-plex-medium text-[11px]" style={{ color: INK }}>
            Wangsa Maju
          </Text>
          <Text className="font-mono text-[11px]" style={{ color: MUTED }}>
            3
          </Text>
        </View>
        <View
          className="flex-row items-center gap-2 rounded-full border px-2.5 py-1"
          style={{ position: 'absolute', left: 32, top: 116, backgroundColor: '#FFFFFF', borderColor: LINE }}>
          <View style={{ width: 7, height: 7, borderRadius: 999, borderWidth: 1.5, borderColor: MUTED }} />
          <Text className="font-plex-medium text-[11px]" style={{ color: MUTED }}>
            Danau Kota
          </Text>
          <Text className="font-mono text-[11px]" style={{ color: MUTED }}>
            11 h
          </Text>
        </View>

        {/* ───────── directive sheet, over the map ───────── */}
        <View
          className="px-5 pb-5 pt-4"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderTopWidth: 1,
            borderColor: LINE,
          }}>
          <View className="flex-row items-baseline justify-between">
            <View className="flex-row items-center gap-2">
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: ALERT }} />
              <Text className="font-plex-semibold text-[17px]" style={{ color: INK }}>
                Taman Melati
              </Text>
            </View>
            <Text className="font-mono-medium text-[13px]" style={{ color: ALERT }}>
              14 / 72 h
            </Text>
          </View>

          {/* block-level targeting, as a shape */}
          <View className="mt-3 flex-row gap-1">
            {[
              ['B1', 0],
              ['B2', 0],
              ['B3', 1],
              ['B4', 1],
              ['B5', 1],
              ['B6', 0],
              ['B7', 0],
              ['B8', 0],
            ].map(([id, hot]) => (
              <View
                key={id as string}
                className="h-8 flex-1 items-center justify-center rounded-[4px]"
                style={{ backgroundColor: hot ? ALERT : LINE }}>
                <Text className="font-mono text-[10px]" style={{ color: hot ? '#FFFFFF' : MUTED }}>
                  {id}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row items-baseline justify-between">
            <Text className="font-plex-semibold text-[20px]" style={{ color: INK }}>
              Fog within 48 h
            </Text>
            <Text className="font-mono text-[12px]" style={{ color: MUTED }}>
              14 AUG 06:42
            </Text>
          </View>

          <Pressable
            className="mt-3 items-center rounded-[10px] py-3.5"
            style={{ backgroundColor: COBALT }}>
            <Text className="font-plex-semibold text-[15px] text-white">Acknowledge</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
