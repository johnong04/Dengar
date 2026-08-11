import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction C — Verdict. Typographic, drenched results. The brand word IS the button.
// Wager: the strongest possible video frame; one screen = one answer.
export default function CCapture() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-center pt-4">
          <Text className="font-mono text-[12px] text-[#5C646E]">
            offline-ready · audio never leaves this phone
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Pressable className="h-[280px] w-[280px] items-center justify-center rounded-full border border-[#26292E] active:border-[#4C9FE0]">
            <Text className="font-plex-bold text-[44px] text-[#E9ECEF]">Dengar.</Text>
            <Text className="mt-1 font-plex text-[15px] text-[#9AA3AD]">
              press and hold it close
            </Text>
          </Pressable>

          <Text className="mt-12 max-w-[300px] text-center font-plex text-[15px] leading-[22px] text-[#9AA3AD]">
            A mosquito found you. Hold your phone to it — within a hand's width — and listen for
            five seconds.
          </Text>
        </View>

        <View className="items-center pb-6">
          <Text className="font-mono text-[12px] text-[#5C646E]">
            dengue is heard before it's felt
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
