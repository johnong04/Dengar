import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Officer direction C — Ledger. The district's day as a chronological operational log:
// mono timestamps, entries typed by kind, the directive as the newest entry demanding action.
// Wager: audit-trail seriousness — nothing looks like a dashboard, everything looks like
// evidence. A register a health inspector could be cross-examined on.

const TAG_COLOR: Record<string, string> = {
  DIRECTIVE: '#C63A2B',
  CLUSTER: '#C63A2B',
  RAINFALL: '#1E56A0',
  DETECTION: '#1E56A0',
  WATCH: '#9A6B15',
  NODE: '#556170',
};

function Entry({
  time,
  tag,
  children,
}: {
  time: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row border-b border-[#DDE3EA] py-3">
      <Text className="w-[48px] pt-0.5 font-mono text-[12px] text-[#556170]">{time}</Text>
      <View className="w-3" />
      <View className="flex-1">
        <Text
          className="font-mono-medium text-[11px] tracking-[1px]"
          style={{ color: TAG_COLOR[tag] }}>
          {tag}
        </Text>
        {children}
      </View>
    </View>
  );
}

export default function OfficerCLedger() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        {/* register head */}
        <View className="border-b-2 border-[#15181D] pb-3 pt-4">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-plex-semibold text-[17px] text-[#15181D]">
              District register — Setapak
            </Text>
            <Text className="font-mono text-[12px] text-[#556170]">DENGAR</Text>
          </View>
          <Text className="mt-1 font-mono text-[12px] text-[#556170]">
            Tuesday 12 August 2026 · page 1 of 1
          </Text>
        </View>

        {/* day totals — the KPI strip as register carry-forward */}
        <View className="flex-row justify-between border-b border-[#DDE3EA] py-2.5">
          <Text className="font-mono text-[12px] text-[#556170]">
            detections <Text className="font-mono-medium text-[#15181D]">6</Text> (prev 4)
          </Text>
          <Text className="font-mono text-[12px] text-[#556170]">
            clusters <Text className="font-mono-medium text-[#15181D]">1</Text>
          </Text>
          <Text className="font-mono text-[12px] text-[#556170]">
            nodes <Text className="font-mono-medium text-[#15181D]">23/26</Text>
          </Text>
        </View>

        {/* newest entry — the directive, demanding action */}
        <View className="mt-4 border border-[#15181D] p-4">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-mono-medium text-[11px] tracking-[1px] text-[#C63A2B]">
              06:42 · DIRECTIVE
            </Text>
            <Text className="font-mono-medium text-[11px] tracking-[1px] text-[#C63A2B]">
              ACK PENDING
            </Text>
          </View>
          <Text className="mt-2 font-plex-semibold text-[20px] leading-7 text-[#15181D]">
            Fog within 48 hours — Taman Melati, Blocks 3–5.
          </Text>
          <Text className="mt-2 font-mono text-[13px] leading-5 text-[#556170]">
            14 detections / 72 h · rain +40 mm · risk rising{'\n'}expires 14 Aug 06:42
          </Text>
          <Pressable className="mt-3.5 items-center border border-[#1E56A0] bg-[#1E56A0] py-3 active:bg-[#1A4B8D]">
            <Text className="font-plex-semibold text-[15px] text-white">
              Acknowledge & dispatch
            </Text>
          </Pressable>
          <Text className="mt-2 text-center font-mono text-[11px] text-[#556170]">
            № 2026-0812-01 · acknowledgement is entered below, timestamped
          </Text>
        </View>

        {/* the day, newest first */}
        <View className="mt-4">
          <Entry time="06:40" tag="CLUSTER">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              Taman Melati confirmed active. 14 detections in 72 h across Blocks 3–5.
            </Text>
          </Entry>
          <Entry time="06:15" tag="RAINFALL">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              +40 mm recorded over 72 h, district-wide. Breeding risk rising.
            </Text>
          </Entry>
          <Entry time="06:10" tag="WATCH">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              Wangsa Maju: 3 detections / 72 h. Below cluster threshold, monitoring.
            </Text>
          </Entry>
          <Entry time="05:52" tag="DETECTION">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              Encounter capture, Taman Melati Block 4. Aedes, identified on-device.
            </Text>
          </Entry>
        </View>

        {/* previous day rule */}
        <View className="mt-5 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-[#DDE3EA]" />
          <Text className="font-mono text-[11px] tracking-[1px] text-[#556170]">MON 11 AUG</Text>
          <View className="h-px flex-1 bg-[#DDE3EA]" />
        </View>

        <View className="mt-1">
          <Entry time="22:10" tag="NODE">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              Static node Danau Kota stopped reporting. Last contact 22:10.
            </Text>
          </Entry>
          <Entry time="18:34" tag="DETECTION">
            <Text className="mt-1 font-plex text-[14px] leading-5 text-[#15181D]">
              Encounter capture, Taman Melati Block 3. Aedes, identified on-device.
            </Text>
          </Entry>
        </View>

        <Text className="mt-4 font-mono text-[11px] text-[#556170]">
          Register is append-only. Corrections are entered as new lines.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
