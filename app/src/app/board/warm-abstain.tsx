import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// WARMTH REVISION — the no_mosquito abstain. Same content as the shipped screen
// (app/src/app/result.tsx, ABSTAIN_COPY.no_mosquito): every number and the §2 framing are kept.
// The warmth moves, in the order they matter on the screen users see most:
//   · the reassurance sentence is lifted out of the paragraph into a mint block — a stated good
//     outcome, not a consolation buried in prose
//   · the three readouts sit in ONE filled surface (radius 20) with soft dividers; the event score
//     gets a track so "0.21 against a 0.50 floor" is visible, not just parsed
//   · prose is plex 16/25 in warm ink and warm muted; mono keeps only the measured values
//   · the retry guidance is a sand pill, the button is soft-cornered — an invitation, not an alarm
// Board artifact: raw hex, static, self-contained.
export default function WarmAbstain() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to capture"
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-[#B5ABA1]">← Result</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-[#B5ABA1]">#2322 · 07:52:02</Text>
        </View>

        {/* verdict */}
        <View className="mt-8">
          <Text className="font-plex-bold text-[34px] leading-[42px] text-[#F4EFE9]">
            No mosquito{'\n'}in this recording
          </Text>
          <Text className="mt-4 font-plex text-[16px] leading-[25px] text-[#B5ABA1]">
            The clip carried no wingbeat signature. Most recordings end here — a clean no is what
            keeps the map honest.
          </Text>
        </View>

        {/* the reassurance, stated rather than implied */}
        <View className="mt-5 rounded-[20px] bg-[#7BE0AE2E] px-5 py-4">
          <View className="flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-[#7BE0AE]" />
            <Text className="font-mono text-[12px] text-[#8FE7BC]">nothing kept</Text>
          </View>
          <Text className="mt-2 font-plex text-[16px] leading-[24px] text-[#F4EFE9]">
            Nothing was saved; nothing left your phone.
          </Text>
        </View>

        {/* what the instrument measured — one surface, soft dividers, values in mono */}
        <View className="mt-5 rounded-[20px] bg-[#18191A] px-5 py-1">
          <View className="py-4">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-plex text-[15px] text-[#B5ABA1]">Event score</Text>
              <Text className="font-mono-medium text-[17px] text-[#F4EFE9]">
                0.21 <Text className="font-mono text-[14px] text-[#B5ABA1]">/ floor 0.50</Text>
              </Text>
            </View>
            {/* the reading against its floor, made visible */}
            <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#FFFFFF14]">
              <View className="h-full w-[42%] rounded-full bg-[#FFC46B]" />
            </View>
          </View>

          <View className="h-px bg-[#FFFFFF12]" />
          <View className="flex-row items-baseline justify-between py-4">
            <Text className="font-plex text-[15px] text-[#B5ABA1]">Band SNR</Text>
            <Text className="font-mono text-[15px] text-[#F4EFE9]">
              18.4 dB <Text className="font-mono text-[15px] text-[#B5ABA1]">· usable</Text>
            </Text>
          </View>

          <View className="h-px bg-[#FFFFFF12]" />
          <View className="flex-row items-baseline justify-between py-4">
            <Text className="font-plex text-[15px] text-[#B5ABA1]">Audio kept</Text>
            <Text className="font-mono text-[15px] text-[#F4EFE9]">
              no <Text className="font-mono text-[15px] text-[#B5ABA1]">· deleted on device</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1" />

        {/* next move */}
        <View className="items-center gap-3 pb-4">
          <View className="rounded-full bg-[#FFC46B33] px-4 py-2">
            <Text className="font-plex text-[13px] text-[#FFDFA8]">
              Get within 10 cm — under a glass is ideal
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            className="min-h-[56px] w-full items-center justify-center rounded-[20px] bg-[#4C9FE0] py-4 active:bg-[#63AFE8]"
          >
            <Text className="font-plex-semibold text-[17px] text-[#0B0C0E]">Listen again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="min-h-[44px] w-full items-center justify-center py-2 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-[#B5ABA1]">Done</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
