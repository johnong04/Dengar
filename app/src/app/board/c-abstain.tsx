import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction C — abstain. Drenched in the seed hue's own deep indigo-grey: a quiet answer,
// visually as committed as the red one. Abstain gets the same treatment as detection.
export default function CAbstain() {
  return (
    <SafeAreaView className="flex-1 bg-[#1A2030]">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-medium text-[15px] text-[#9FA9BF]">← Result</Text>
          <Text className="font-mono text-[12px] text-[#9FA9BF]">
            19:46 · Titiwangsa
          </Text>
        </View>

        <View className="mt-16">
          <Text className="font-plex-bold text-[56px] leading-[60px] text-white">
            Quiet.
          </Text>
          <Text className="mt-3 font-plex text-[20px] leading-7 text-[#B8C1D4]">
            No wingbeat in this recording.
          </Text>

          <Text className="mt-10 font-plex text-[15px] leading-[22px] text-[#9FA9BF]">
            Most recordings end here — the mosquito was likely too far from the microphone. Nothing
            was saved, nothing left your phone.
          </Text>

          <View className="mt-10 flex-row items-baseline gap-3">
            <Text className="font-mono-medium text-[30px] text-white">0.21</Text>
            <Text className="font-mono text-[13px] text-[#9FA9BF]">
              event score · needs 0.50
            </Text>
          </View>
          <View className="mt-3 h-[3px] w-full bg-[#333D52]">
            <View className="h-[3px] w-[21%] bg-white" />
          </View>
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Text className="text-center font-plex text-[13px] text-[#9FA9BF]">
            Closer helps — a hand's width or less
          </Text>
          <Pressable className="items-center rounded-[10px] bg-white py-4 active:opacity-90">
            <Text className="font-plex-semibold text-[17px] text-[#1A2030]">
              Listen again
            </Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-plex-medium text-[15px] text-[#9FA9BF]">Done</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
