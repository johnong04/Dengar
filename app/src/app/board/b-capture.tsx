import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction B — Public Clinic. Pure white, cobalt, Inter. MOH-adjacent institutional trust.
// Wager: familiarity reads as deployable-tomorrow.
export default function BCapture() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-inter-bold text-[17px] text-[#1E56A0]">Dengar</Text>
          <Text className="font-inter-medium text-[13px] text-[#556170]">
            BM · <Text className="text-[#15181D]">EN</Text>
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Pressable className="h-[196px] w-[196px] items-center justify-center rounded-full bg-[#1E56A0] active:bg-[#1A4B8D]">
            <View className="h-4 w-4 rounded-full border-2 border-white" />
            <Text className="mt-3 font-inter-semibold text-[17px] text-white">
              Hold & listen
            </Text>
            <Text className="mt-0.5 font-inter text-[13px] text-[#B9CBE4]">
              5 seconds
            </Text>
          </Pressable>

          <Text className="mt-10 text-center font-inter-bold text-[22px] leading-7 text-[#15181D]">
            Found a mosquito?
          </Text>
          <Text className="mt-2 max-w-[280px] text-center font-inter text-[15px] leading-[22px] text-[#556170]">
            Hold your phone close to it — within 10 cm — and keep still.
          </Text>

          {/* a real sequence, so numbers are earned */}
          <View className="mt-9 w-full rounded-[12px] bg-[#F2F5F8] px-5 py-4">
            {[
              ['1', 'Trap it if you can — a glass or cup works'],
              ['2', 'Hold the phone right up to it'],
              ['3', 'Stay still while it listens'],
            ].map(([n, t]) => (
              <View key={n} className="flex-row items-center gap-3 py-1.5">
                <Text className="w-4 font-inter-semibold text-[13px] text-[#1E56A0]">{n}</Text>
                <Text className="font-inter text-[14px] text-[#3A4453]">{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="items-center pb-4">
          <Text className="font-inter-medium text-[14px] text-[#1E56A0]">
            Have an old phone? Set up a static node →
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
