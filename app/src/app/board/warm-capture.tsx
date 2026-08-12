import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// WARMTH REVISION — capture home. Same content as the shipped screen (app/src/app/index.tsx,
// idle phase); the register is unchanged (dark field instrument) and the execution is warmed:
//   · warm ink #F4EFE9 / warm muted #B5ABA1 replace the cool #E9ECEF / #9AA3AD
//   · the hairline rings become filled halos + one saturated disc — the one big friendly control
//   · guidance moves off the bare ground into a sand-tinted block (radius 20), the airquality-2 move
//   · mono is demoted to data only (spec line, tally); plex carries all prose, one step larger
// Board artifact: raw hex, static, self-contained.
export default function WarmCapture() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        {/* status row — the state chip is a filled pill now, not a bare dot on black */}
        <View className="mt-4 h-8 flex-row items-center justify-between">
          <Text className="font-plex-semibold text-[17px] text-[#F4EFE9]">Dengar</Text>
          <View className="flex-row items-center gap-2 rounded-full bg-[#35B98129] px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-[#7BE0AE]" />
            <Text className="font-mono text-[12px] text-[#8FE7BC]">mic ready · on-device</Text>
          </View>
        </View>

        {/* instrument — concentric soft fills (depth) instead of hairlines (diagram) */}
        <View className="flex-1 items-center justify-center">
          <View className="h-[288px] w-[288px] items-center justify-center rounded-full bg-[#4C9FE014]">
            <View className="h-[236px] w-[236px] items-center justify-center rounded-full bg-[#4C9FE029]">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Listen for 5 seconds"
                className="h-[180px] w-[180px] items-center justify-center rounded-full bg-[#4C9FE0] active:bg-[#63AFE8]"
              >
                <Text className="font-plex-semibold text-[24px] text-[#0B0C0E]">Listen</Text>
                <Text className="mt-1 font-mono text-[13px] text-[#0B0C0E]">5.0 s</Text>
              </Pressable>
            </View>
          </View>

          <Text className="mt-9 text-center font-plex-bold text-[30px] leading-[38px] text-[#F4EFE9]">
            Identify the mosquito{'\n'}that found you
          </Text>

          {/* guidance block — filled, soft-cornered, warm. Grouping by surface, not by rule. */}
          <View className="mt-6 w-full rounded-[20px] bg-[#FFC46B33] px-5 py-5">
            <Text className="text-center font-plex text-[16px] leading-[24px] text-[#FFDFA8]">
              Hold your phone within 10 cm.{'\n'}Trapped under a glass works best.
            </Text>
            <Text className="mt-4 text-center font-mono text-[12px] text-[#D3C6B2]">
              16 kHz · mono · band-SNR gate armed
            </Text>
          </View>
        </View>

        {/* footer — a raised surface row, not a hairline */}
        <View className="mb-4 flex-row items-center justify-between rounded-[20px] bg-[#18191A] px-5 py-4">
          <Text className="font-plex-medium text-[16px] text-[#F4EFE9]">History</Text>
          <Text className="font-mono text-[13px] text-[#B5ABA1]">3 this week</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
