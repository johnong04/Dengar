import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Direction A — Field Instrument. Dark ground, hairlines, mono readouts.
// Wager: judges trust an instrument more than an app.
export default function ACapture() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B0C0E]">
      <View className="flex-1 px-5">
        {/* status bar row */}
        <View className="flex-row items-center justify-between pt-4">
          <Text className="font-plex-semibold text-[15px] text-[#E9ECEF]">Dengar</Text>
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-[#35B981]" />
            <Text className="font-mono text-[12px] text-[#9AA3AD]">
              mic ready · on-device
            </Text>
          </View>
        </View>

        {/* instrument core */}
        <View className="flex-1 items-center justify-center">
          <View className="h-[264px] w-[264px] items-center justify-center rounded-full border border-[#26292E]">
            <View className="h-[224px] w-[224px] items-center justify-center rounded-full border border-[#26292E]">
              <Pressable className="h-[184px] w-[184px] items-center justify-center rounded-full bg-[#141619] active:bg-[#1A1D21]">
                <View className="h-3 w-3 rounded-full bg-[#4C9FE0]" />
                <Text className="mt-3 font-plex-semibold text-[17px] text-[#E9ECEF]">
                  Listen
                </Text>
                <Text className="mt-1 font-mono text-[12px] text-[#9AA3AD]">
                  5.0 s
                </Text>
              </Pressable>
            </View>
          </View>

          <Text className="mt-10 text-center font-plex-semibold text-[24px] leading-8 text-[#E9ECEF]">
            Identify the mosquito{'\n'}that found you
          </Text>
          <Text className="mt-3 text-center font-plex text-[15px] leading-[22px] text-[#9AA3AD]">
            Hold your phone within 10 cm.{'\n'}Trapped under a glass works best.
          </Text>

          <Text className="mt-8 font-mono text-[12px] text-[#5C646E]">
            16 kHz · mono · band-SNR gate armed
          </Text>
        </View>

        {/* footer */}
        <View className="border-t border-[#26292E] pb-4">
          <View className="flex-row items-center justify-between py-4">
            <Text className="font-plex-medium text-[15px] text-[#E9ECEF]">History</Text>
            <Text className="font-mono text-[13px] text-[#9AA3AD]">
              3 this week · 2 queued offline
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
