import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// WARMTH REVISION — the Aedes result. The drench wager is kept: the surface IS the verdict.
// Same content as the shipped screen (app/src/app/result.tsx, Detected/aedes) — every number and
// the §2 framing intact. What changes is that the red now has depth and craft instead of being one
// flat fill with hairlines drawn on it:
//   · a real top-to-bottom gradient ground (#8E2317 → #59110A) — light gathers at the verdict
//   · the confidence bar is 8 px and pill-round with a warm-white fill, an instrument gauge
//   · the head readouts sit in a recessed block, the stakes paragraph in a raised one — two levels
//     of depth carry the grouping that hairlines used to
//   · the primary action is warm white (#FFF3EC), not pure white: authority without glare at night
// Board artifact: raw hex, static, self-contained.

// 28 solid bands = a gradient without adding a dependency.
const TOP = [0x9a, 0x29, 0x19];
const BOTTOM = [0x4e, 0x0f, 0x08];
const BANDS = Array.from({ length: 28 }, (_, i) => {
  const t = i / 27;
  const c = TOP.map((v, k) => Math.round(v + (BOTTOM[k] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
});

export default function WarmDetected() {
  return (
    <View className="flex-1 bg-[#4E0F08]">
      {/* gradient ground — behind the safe areas too, so the drench has no seam */}
      <View className="absolute inset-0">
        {BANDS.map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-5">
          {/* top row */}
          <View className="flex-row items-center justify-between pt-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to capture"
              className="min-h-[44px] justify-center pr-6 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-[#F6D2C9]">← Result</Text>
            </Pressable>
            <Text className="font-mono text-[12px] text-[#F6D2C9]">#2631 · 07:57:11</Text>
          </View>

          {/* verdict */}
          <View className="mt-10">
            <Text className="font-plex-bold text-[56px] leading-[60px] text-[#FFFFFF]">Aedes.</Text>
            <Text className="mt-3 font-plex text-[20px] leading-[29px] text-[#F6D2C9]">
              The mosquito that found you{'\n'}carries dengue.
            </Text>
          </View>

          {/* confidence — a gauge, not a hairline */}
          <View className="mt-8">
            <View className="flex-row items-baseline gap-3">
              <Text className="font-mono-medium text-[30px] text-[#FFFFFF]">91%</Text>
              <Text className="font-mono text-[13px] text-[#F6D2C9]">
                confident · female · Ae. aegypti
              </Text>
            </View>
            <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#00000047]">
              <View className="h-full w-[91%] rounded-full bg-[#FFF3EC]" />
            </View>
          </View>

          {/* the fine-grained heads — recessed surface, soft dividers */}
          <View className="mt-7 rounded-[20px] bg-[#00000038] px-5 py-1">
            <View className="flex-row items-baseline justify-between py-3.5">
              <Text className="font-plex text-[15px] text-[#F6D2C9]">Species</Text>
              <Text className="font-mono text-[15px] text-[#FFFFFF]">
                Aedes aegypti <Text className="font-mono text-[15px] text-[#F6D2C9]">· 0.84</Text>
              </Text>
            </View>
            <View className="h-px bg-[#FFFFFF24]" />
            <View className="flex-row items-baseline justify-between py-3.5">
              <Text className="font-plex text-[15px] text-[#F6D2C9]">Sex</Text>
              <Text className="font-mono text-[15px] text-[#FFFFFF]">
                female <Text className="font-mono text-[15px] text-[#F6D2C9]">· 0.93</Text>
              </Text>
            </View>
            <View className="h-px bg-[#FFFFFF24]" />
            <View className="flex-row items-baseline justify-between py-3.5">
              <Text className="font-plex text-[15px] text-[#F6D2C9]">Gravid</Text>
              <Text className="font-mono text-[15px] text-[#FFFFFF]">
                yes <Text className="font-mono text-[15px] text-[#F6D2C9]">· 0.70</Text>
              </Text>
            </View>
          </View>

          {/* the stakes — raised surface, one level above the drench */}
          <View className="mt-4 rounded-[20px] bg-[#FFFFFF1A] px-5 py-4">
            <Text className="font-mono text-[12px] text-[#F6D2C9]">why this matters</Text>
            <Text className="mt-2 font-plex text-[15px] leading-[23px] text-[#FFFFFF]">
              Logging this puts one more point on your district's map. Fourteen detections in 72
              hours is what sends a fogging truck.
            </Text>
          </View>

          <View className="flex-1" />

          {/* next move */}
          <View className="gap-3 pb-4">
            <Pressable
              accessibilityRole="button"
              className="min-h-[56px] items-center justify-center rounded-[20px] bg-[#FFF3EC] py-4 active:opacity-90"
            >
              <Text className="font-plex-semibold text-[17px] text-[#5E120A]">Log detection</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center py-2 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-[#F6D2C9]">Discard</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
