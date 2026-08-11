import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rows = [
  ['Sex', 'female', '0.93'],
  ['Taxon', 'Ae. aegypti', '0.81'],
  ['Band SNR', '14.2 dB', ''],
  ['Location', 'Titiwangsa, KL', '±120 m'],
  ['Recorded', 'today 19:42', 'queued'],
] as const;

// Direction A — result, positive call. Aedes-red is reserved for exactly this.
export default function ADetected() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-medium text-[15px] text-[#9AA3AD]">← Result</Text>
          <Text className="font-mono text-[12px] text-[#9AA3AD]">
            #0047 · 19:42:07
          </Text>
        </View>

        {/* verdict */}
        <View className="mt-14">
          <Text className="font-plex-bold text-[56px] leading-[60px] text-[#FF5C49]">
            Aedes
          </Text>
          <Text className="mt-1 font-plex text-[20px] text-[#E9ECEF]">
            wingbeat signature detected
          </Text>

          <View className="mt-8 flex-row items-baseline justify-between">
            <Text className="font-mono-medium text-[30px] text-[#E9ECEF]">0.88</Text>
            <Text className="font-mono text-[12px] text-[#9AA3AD]">
              confidence · floor 0.70
            </Text>
          </View>
          <View className="mt-2 h-[3px] w-full bg-[#26292E]">
            <View className="h-[3px] w-[88%] bg-[#FF5C49]" />
          </View>
        </View>

        {/* readout rows */}
        <View className="mt-10">
          {rows.map(([k, v, note]) => (
            <View key={k} className="flex-row items-center justify-between border-t border-[#26292E] py-3.5">
              <Text className="font-plex text-[15px] text-[#9AA3AD]">{k}</Text>
              <View className="flex-row items-baseline gap-2">
                <Text className="font-mono text-[15px] text-[#E9ECEF]">{v}</Text>
                {note ? (
                  <Text className="font-mono text-[12px] text-[#5C646E]">{note}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-4">
          <Pressable className="items-center rounded-[10px] bg-[#4C9FE0] py-4 active:opacity-90">
            <Text className="font-plex-semibold text-[17px] text-[#0B0C0E]">
              Log detection
            </Text>
          </Pressable>
          <Pressable className="items-center py-2">
            <Text className="font-plex-medium text-[15px] text-[#9AA3AD]">Discard</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
