import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction A — Console. fleetmanagement-1's grammar miniaturized to a phone:
// KPI row with deltas up top, alert feed as dense hairline rows, directive as the emphasized row.
// Wager: familiar ops-tool credibility — an officer has seen this screen before and trusts it.
export default function OfficerAConsole() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        {/* top bar */}
        <View className="flex-row items-center justify-between border-b border-[#DDE3EA] px-5 pb-3 pt-4">
          <View>
            <Text className="font-plex-semibold text-[15px] text-[#15181D]">
              Dengar · District ops
            </Text>
            <Text className="mt-0.5 font-plex text-[12px] text-[#556170]">Setapak, Kuala Lumpur</Text>
          </View>
          <Text className="font-mono text-[12px] text-[#556170]">TUE 12 AUG · 07:04</Text>
        </View>

        {/* KPI row with deltas */}
        <View className="flex-row border-b border-[#DDE3EA]">
          <View className="flex-1 border-r border-[#DDE3EA] px-4 py-3">
            <Text className="font-plex-medium text-[11px] uppercase tracking-wide text-[#556170]">
              Detections
            </Text>
            <Text className="mt-1 font-mono-medium text-[24px] text-[#15181D]">6</Text>
            <Text className="mt-0.5 font-mono text-[12px] text-[#C63A2B]">+2 vs yesterday</Text>
          </View>
          <View className="flex-1 border-r border-[#DDE3EA] px-4 py-3">
            <Text className="font-plex-medium text-[11px] uppercase tracking-wide text-[#556170]">
              Clusters
            </Text>
            <Text className="mt-1 font-mono-medium text-[24px] text-[#15181D]">1</Text>
            <Text className="mt-0.5 font-mono text-[12px] text-[#C63A2B]">+1 this week</Text>
          </View>
          <View className="flex-1 px-4 py-3">
            <Text className="font-plex-medium text-[11px] uppercase tracking-wide text-[#556170]">
              Nodes up
            </Text>
            <Text className="mt-1 font-mono-medium text-[24px] text-[#15181D]">23/26</Text>
            <Text className="mt-0.5 font-mono text-[12px] text-[#556170]">3 offline</Text>
          </View>
        </View>

        {/* alert feed */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
          <Text className="font-plex-semibold text-[13px] uppercase tracking-wide text-[#556170]">
            Alert feed
          </Text>
          <Text className="font-mono text-[12px] text-[#556170]">4 open</Text>
        </View>

        {/* the emphasized row — active cluster + directive */}
        <View className="mx-5 rounded-[10px] bg-[#F2F5F8] px-4 py-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-[#C63A2B]" />
            <Text className="font-plex-semibold text-[13px] uppercase tracking-wide text-[#C63A2B]">
              Aedes cluster · active
            </Text>
          </View>
          <Text className="mt-2 font-plex-semibold text-[20px] text-[#15181D]">
            Taman Melati · Blocks 3–5
          </Text>
          <Text className="mt-1.5 font-mono text-[13px] leading-5 text-[#556170]">
            14 detections / 72 h · rain +40 mm · risk rising
          </Text>

          {/* block map strip */}
          <View className="mt-3 flex-row gap-1">
            {['1', '2', '3', '4', '5', '6', '7', '8'].map((b) => (
              <View
                key={b}
                className={`h-9 flex-1 items-center justify-center rounded-[4px] ${
                  b === '3' || b === '4' || b === '5' ? 'bg-[#C63A2B]' : 'bg-[#DDE3EA]'
                }`}>
                <Text
                  className={`font-mono text-[11px] ${
                    b === '3' || b === '4' || b === '5' ? 'text-white' : 'text-[#556170]'
                  }`}>
                  B{b}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-3 flex-row items-baseline justify-between border-t border-[#DDE3EA] pt-3">
            <Text className="font-plex-semibold text-[15px] text-[#15181D]">
              Directive: fog within 48 hours
            </Text>
            <Text className="font-mono text-[12px] text-[#556170]">by 14 Aug 06:42</Text>
          </View>
          <Pressable className="mt-3 items-center rounded-[10px] bg-[#1E56A0] py-3 active:bg-[#1A4B8D]">
            <Text className="font-plex-semibold text-[15px] text-white">
              Acknowledge & dispatch
            </Text>
          </Pressable>
        </View>

        {/* quieter rows */}
        <View className="mt-2 px-5">
          <View className="flex-row items-center gap-2 border-b border-[#DDE3EA] py-3.5">
            <View className="h-2 w-2 rounded-full bg-[#9A6B15]" />
            <View className="flex-1">
              <Text className="font-plex-medium text-[14px] text-[#15181D]">
                Wangsa Maju — watch
              </Text>
              <Text className="mt-0.5 font-mono text-[12px] text-[#556170]">
                3 detections / 72 h · below cluster threshold
              </Text>
            </View>
            <Text className="font-mono text-[12px] text-[#556170]">06:10</Text>
          </View>
          <View className="flex-row items-center gap-2 border-b border-[#DDE3EA] py-3.5">
            <View className="h-2 w-2 rounded-full bg-[#556170]" />
            <View className="flex-1">
              <Text className="font-plex-medium text-[14px] text-[#15181D]">
                Static node offline — Danau Kota
              </Text>
              <Text className="mt-0.5 font-mono text-[12px] text-[#556170]">
                no report for 11 h · battery unknown
              </Text>
            </View>
            <Text className="font-mono text-[12px] text-[#556170]">22:10</Text>
          </View>
          <View className="flex-row items-center gap-2 border-b border-[#DDE3EA] py-3.5">
            <View className="h-2 w-2 rounded-full bg-[#556170]" />
            <View className="flex-1">
              <Text className="font-plex-medium text-[14px] text-[#15181D]">
                Rainfall advisory — district-wide
              </Text>
              <Text className="mt-0.5 font-mono text-[12px] text-[#556170]">
                +40 mm / 72 h · forecast holds through Thu
              </Text>
            </View>
            <Text className="font-mono text-[12px] text-[#556170]">05:30</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
