import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const details = [
  ['Sex', 'Female (93%)'],
  ['Species', 'Aedes aegypti (81%)'],
  ['Where', 'Titiwangsa, Kuala Lumpur'],
  ['When', 'Today, 7:42 PM'],
] as const;

// Direction B — result, positive call.
export default function BDetected() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-inter-medium text-[15px] text-[#1E56A0]">← Back</Text>
          <Text className="font-inter text-[13px] text-[#556170]">Result</Text>
        </View>

        <View className="mt-10 rounded-[20px] bg-[#F2F5F8] p-6">
          <View className="flex-row items-center gap-2.5">
            <View className="h-3 w-3 rounded-full bg-[#C63A2B]" />
            <Text className="font-inter-semibold text-[13px] text-[#C63A2B]">
              DENGUE VECTOR
            </Text>
          </View>
          <Text className="mt-3 font-inter-bold text-[30px] leading-9 text-[#15181D]">
            Aedes identified
          </Text>
          <Text className="mt-2 font-inter text-[15px] leading-[22px] text-[#556170]">
            The mosquito that found you is a dengue carrier. Your report helps target fogging in
            your neighbourhood.
          </Text>

          <View className="mt-6 flex-row items-baseline justify-between">
            <Text className="font-inter text-[13px] text-[#556170]">Confidence</Text>
            <Text className="font-inter-bold text-[17px] text-[#15181D]">88%</Text>
          </View>
          <View className="mt-2 h-2 w-full rounded-full bg-[#DDE3EA]">
            <View className="h-2 w-[88%] rounded-full bg-[#1E56A0]" />
          </View>
        </View>

        <View className="mt-8">
          {details.map(([k, v]) => (
            <View key={k} className="flex-row items-center justify-between border-b border-[#DDE3EA] py-3.5">
              <Text className="font-inter text-[15px] text-[#556170]">{k}</Text>
              <Text className="font-inter-medium text-[15px] text-[#15181D]">{v}</Text>
            </View>
          ))}
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Pressable className="items-center rounded-[12px] bg-[#1E56A0] py-4 active:bg-[#1A4B8D]">
            <Text className="font-inter-semibold text-[17px] text-white">Send report</Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-inter-medium text-[15px] text-[#556170]">Discard</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
