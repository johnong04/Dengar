import { Link } from 'expo-router';
import { Text, View } from 'react-native';

// PLACEHOLDER — slice 2 replaces this with the real capture home.
export default function CaptureHome() {
  return (
    <View className="flex-1 bg-bg px-5 py-16">
      <Text className="font-plex-bold text-3xl text-ink">Dengar</Text>
      <View className="flex-1 items-center justify-center">
        <View className="h-56 w-56 rounded-full border border-line bg-surface" />
      </View>
      <Link href={'/board' as never} className="py-2">
        <Text className="font-mono text-sm text-faint">design board →</Text>
      </Link>
    </View>
  );
}
