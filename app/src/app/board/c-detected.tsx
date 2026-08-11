import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction C — result, positive call. The surface IS the verdict: aedes drenches the screen.
export default function CDetected() {
  return (
    <SafeAreaView className="flex-1 bg-[#7E1B10]">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-medium text-[15px] text-[#F3C7C0]">← Result</Text>
          <Text className="font-mono text-[12px] text-[#F3C7C0]">
            19:42 · Titiwangsa
          </Text>
        </View>

        <View className="mt-16">
          <Text className="font-plex-bold text-[56px] leading-[60px] text-white">
            Aedes.
          </Text>
          <Text className="mt-3 font-plex text-[20px] leading-7 text-[#F3C7C0]">
            The mosquito that found you{'\n'}carries dengue.
          </Text>

          <View className="mt-10 flex-row items-baseline gap-3">
            <Text className="font-mono-medium text-[30px] text-white">88%</Text>
            <Text className="font-mono text-[13px] text-[#F3C7C0]">
              confident · female · Ae. aegypti
            </Text>
          </View>
          <View className="mt-3 h-[3px] w-full bg-[#9E3D30]">
            <View className="h-[3px] w-[88%] bg-white" />
          </View>

          <Text className="mt-10 font-plex text-[15px] leading-[22px] text-[#F3C7C0]">
            Logging this puts one more point on your district's map. Fourteen detections in 72
            hours is what sends a fogging truck.
          </Text>
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Pressable className="items-center rounded-[10px] bg-white py-4 active:opacity-90">
            <Text className="font-plex-semibold text-[17px] text-[#7E1B10]">
              Log detection
            </Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-plex-medium text-[15px] text-[#F3C7C0]">Discard</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
