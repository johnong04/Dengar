import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction A — abstain. The most-seen screen. Same dignity as detection:
// ink on the normal ground, instrument honesty about why, a clear next move. Never error styling.
export default function AAbstain() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-medium text-[15px] text-[#9AA3AD]">← Result</Text>
          <Text className="font-mono text-[12px] text-[#9AA3AD]">
            #0048 · 19:46:31
          </Text>
        </View>

        <View className="mt-14">
          <Text className="font-plex-bold text-[38px] leading-[44px] text-[#E9ECEF]">
            No mosquito{'\n'}in this recording
          </Text>
          <Text className="mt-4 font-plex text-[15px] leading-[22px] text-[#9AA3AD]">
            The clip carried no wingbeat signature. Most recordings don't — a clean no is what keeps
            the map honest.
          </Text>
        </View>

        {/* the instrument says why, in its own units */}
        <View className="mt-10">
          <View className="flex-row items-center justify-between border-t border-[#26292E] py-3.5">
            <Text className="font-plex text-[15px] text-[#9AA3AD]">
              Event score
            </Text>
            <Text className="font-mono text-[15px] text-[#E9ECEF]">
              0.21 <Text className="text-[#5C646E]">/ floor 0.50</Text>
            </Text>
          </View>
          <View className="flex-row items-center justify-between border-t border-[#26292E] py-3.5">
            <Text className="font-plex text-[15px] text-[#9AA3AD]">
              Band SNR
            </Text>
            <Text className="font-mono text-[15px] text-[#E9ECEF]">
              11.8 dB <Text className="text-[#5C646E]">· usable</Text>
            </Text>
          </View>
          <View className="flex-row items-center justify-between border-y border-[#26292E] py-3.5">
            <Text className="font-plex text-[15px] text-[#9AA3AD]">
              Audio kept
            </Text>
            <Text className="font-mono text-[15px] text-[#E9ECEF]">
              no <Text className="text-[#5C646E]">· deleted on device</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Text className="text-center font-plex text-[13px] text-[#5C646E]">
            Get within 10 cm — under a glass is ideal
          </Text>
          <Pressable className="items-center rounded-[10px] bg-[#4C9FE0] py-4 active:opacity-90">
            <Text className="font-plex-semibold text-[17px] text-[#0B0C0E]">
              Listen again
            </Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-plex-medium text-[15px] text-[#9AA3AD]">Done</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
