import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction B — abstain. Reassuring, plain-language, zero blame. Not styled as an error.
export default function BAbstain() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-inter-medium text-[15px] text-[#1E56A0]">← Back</Text>
          <Text className="font-inter text-[13px] text-[#556170]">Result</Text>
        </View>

        <View className="mt-10 rounded-[20px] bg-[#F2F5F8] p-6">
          <Text className="font-inter-bold text-[24px] leading-8 text-[#15181D]">
            No mosquito heard this time
          </Text>
          <Text className="mt-2 font-inter text-[15px] leading-[22px] text-[#556170]">
            That's the most common result — it usually means the mosquito was too far from the
            microphone. Nothing was saved.
          </Text>
        </View>

        <Text className="mt-8 font-inter-semibold text-[15px] text-[#15181D]">
          What helps
        </Text>
        <View className="mt-2">
          {[
            'Get closer than 10 cm — right up to it',
            'Trap it under a glass first if you can',
            'Move away from fans, traffic and TV noise',
          ].map((t) => (
            <View key={t} className="flex-row items-start gap-3 border-b border-[#DDE3EA] py-3">
              <View className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#1E56A0]" />
              <Text className="flex-1 font-inter text-[15px] leading-[22px] text-[#3A4453]">
                {t}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Pressable className="items-center rounded-[12px] bg-[#1E56A0] py-4 active:bg-[#1A4B8D]">
            <Text className="font-inter-semibold text-[17px] text-white">Try again</Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-inter-medium text-[15px] text-[#556170]">Done</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
