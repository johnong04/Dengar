import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction B — Directive. The instruction IS the screen: a cobalt command drench
// dominates, evidence is subordinate, everything else recedes below the fold.
// Wager: specs §7 step 5 — "an instruction, not a chart"; the frame the video cuts to.
// Cobalt, not alert red: red is the cluster's color, the directive is a command — cobalt
// reads as authority issuing, red would read as alarm still ringing.
export default function OfficerBDirective() {
  return (
    <SafeAreaView className="flex-1 bg-[#1E56A0]">
      <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow">
        {/* the directive drench */}
        <View className="bg-[#1E56A0] px-6 pb-7 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-semibold text-[15px] text-white">Dengar</Text>
            <Text className="font-mono text-[12px] text-[#D7E2F0]">TUE 12 AUG · 07:04</Text>
          </View>

          <Text className="mt-9 font-inter-medium text-[12px] uppercase tracking-[2px] text-[#D7E2F0]">
            Directive · Setapak district
          </Text>
          <Text className="mt-2 font-inter-bold text-[38px] leading-[44px] text-white">
            Fog within{'\n'}48 hours.
          </Text>
          <Text className="mt-3 font-inter-semibold text-[20px] text-white">
            Taman Melati · Blocks 3–5
          </Text>

          {/* evidence — subordinate, hairline-ruled */}
          <View className="mt-7 border-t border-[#4A77B7]">
            {[
              ['14 detections / 72 h', 'encounter + static node, on-device'],
              ['Rain +40 mm / 72 h', 'recorded, forecast holds'],
              ['Risk rising', 'cluster confirmed 06:40'],
            ].map(([k, v]) => (
              <View key={k} className="border-b border-[#4A77B7] py-3">
                <Text className="font-mono-medium text-[15px] text-white">{k}</Text>
                <Text className="mt-0.5 font-inter text-[12px] text-[#D7E2F0]">{v}</Text>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row items-baseline justify-between">
            <Text className="font-mono text-[12px] text-[#D7E2F0]">Issued 06:42</Text>
            <Text className="font-mono text-[12px] text-[#D7E2F0]">Expires 14 Aug 06:42</Text>
          </View>

          <Pressable className="mt-4 items-center rounded-[10px] bg-white py-4 active:bg-[#E8EEF6]">
            <Text className="font-inter-semibold text-[17px] text-[#1E56A0]">
              Acknowledge & dispatch
            </Text>
          </Pressable>
          <Text className="mt-2.5 text-center font-inter text-[12px] text-[#D7E2F0]">
            Acknowledgement is logged to the district register
          </Text>
        </View>

        {/* below the fold — everything else recedes */}
        <View className="flex-1 bg-white px-6 pb-6 pt-5">
          <View className="flex-row">
            <View className="flex-1">
              <Text className="font-mono-medium text-[17px] text-[#15181D]">6</Text>
              <Text className="mt-0.5 font-inter text-[11px] text-[#556170]">
                detections · +2
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-mono-medium text-[17px] text-[#15181D]">1</Text>
              <Text className="mt-0.5 font-inter text-[11px] text-[#556170]">active cluster</Text>
            </View>
            <View className="flex-1">
              <Text className="font-mono-medium text-[17px] text-[#15181D]">23/26</Text>
              <Text className="mt-0.5 font-inter text-[11px] text-[#556170]">nodes reporting</Text>
            </View>
          </View>

          <View className="mt-5 border-t border-[#DDE3EA]">
            <View className="flex-row items-baseline justify-between border-b border-[#DDE3EA] py-3">
              <View className="flex-1 pr-3">
                <Text className="font-inter-medium text-[14px] text-[#15181D]">
                  Wangsa Maju — watch
                </Text>
                <Text className="mt-0.5 font-inter text-[12px] text-[#556170]">
                  3 detections / 72 h, below cluster threshold
                </Text>
              </View>
              <Text className="font-mono text-[12px] text-[#556170]">06:10</Text>
            </View>
            <View className="flex-row items-baseline justify-between border-b border-[#DDE3EA] py-3">
              <View className="flex-1 pr-3">
                <Text className="font-inter-medium text-[14px] text-[#15181D]">
                  Static node offline — Danau Kota
                </Text>
                <Text className="mt-0.5 font-inter text-[12px] text-[#556170]">
                  no report for 11 h
                </Text>
              </View>
              <Text className="font-mono text-[12px] text-[#556170]">22:10</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
