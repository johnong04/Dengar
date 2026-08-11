import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

// ponytail: board menu, throwaway. Dies when the board is gated and real routes land.
const ROUTES = [
  ['A — Field Instrument', ['/board/a-capture', '/board/a-detected', '/board/a-abstain']],
  ['B — Public Clinic', ['/board/b-capture', '/board/b-detected', '/board/b-abstain']],
  ['C — Verdict', ['/board/c-capture', '/board/c-detected', '/board/c-abstain']],
] as const;

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-[#0B0C0E]" contentContainerClassName="px-5 py-16 gap-8">
      <Text className="font-plex-bold text-3xl text-[#E9ECEF]">Dengar — board</Text>
      {ROUTES.map(([title, routes]) => (
        <View key={title} className="gap-2">
          <Text className="font-plex-semibold text-lg text-[#9AA3AD]">{title}</Text>
          {routes.map((r) => (
            <Link key={r} href={r as never} className="py-1">
              <Text className="font-mono text-base text-[#4C9FE0]">{r}</Text>
            </Link>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
