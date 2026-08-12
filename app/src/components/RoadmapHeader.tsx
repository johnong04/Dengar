import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { district } from '@/data/district';

// Header for the v3 ROADMAP screens (specs.md §5 v3 — aspirational, frontend only, clearly framed
// as roadmap). Same grammar as the officer home and cluster detail: back chevron, name, mono stamp,
// one hairline — so a roadmap screen is unmistakably the same product, and unmistakably not shipped.
//
// TWO markers, always, on every roadmap screen:
//   `roadmap · v3` — caution-toned, because this screen describes capability we have not built.
//   `simulated`    — the seeded-data marker every officer surface already carries (COMMON rule 8).
// They sit on their own row rather than inline with the title: at 390 px an inline pair pushes the
// mono stamp off the right edge, and a marker that scrolls out of frame is not a marker.

export function RoadmapHeader({ title, kicker }: { title: string; kicker: string }) {
  const router = useRouter();
  return (
    <View className="border-b border-o-line pb-3">
      <View className="flex-row items-center pl-1 pr-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          // Deep-linked (a screenshot run, a shared URL) there is no history to pop, so fall back
          // to the officer home. `/officer/index` is how expo-router's generated href union spells
          // that route while `officer/_layout` is a Stack.
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/officer/index'))}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
        >
          <Text className="font-plex-medium text-[22px] text-o-primary">‹</Text>
        </Pressable>
        <Text className="flex-1 font-plex-semibold text-[17px] text-o-ink">{title}</Text>
        <Text className="font-mono text-[11px] text-o-muted">{district.stamp}</Text>
      </View>
      <View className="flex-row items-center gap-2 pl-5 pr-5">
        <View className="rounded-pill bg-o-surface px-2 py-[2px]">
          <Text className="font-mono text-[10px] text-o-caution">roadmap · v3</Text>
        </View>
        {district.simulated ? (
          <View className="rounded-pill bg-o-surface px-2 py-[2px]">
            <Text className="font-mono text-[10px] text-o-muted">simulated</Text>
          </View>
        ) : null}
        <Text className="flex-1 font-plex text-[11px] text-o-muted" numberOfLines={1}>
          {kicker}
        </Text>
      </View>
    </View>
  );
}
