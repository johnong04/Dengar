import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// PLACEHOLDER — a later slice renders the real param-driven verdict states here.
export default function Result() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-bg px-5">
      <Text className="font-plex-semibold text-xl text-ink">Result</Text>
      <Text className="mt-2 font-mono text-base text-muted">{kind ?? 'no kind param'}</Text>
    </View>
  );
}
