import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCopy } from '@/copy';

/**
 * The citizen shell: Listen / Area / History.
 *
 * Why a component and not an expo-router `Tabs` navigator: moving `index`, `area` and `history`
 * into a `(tabs)` group renames three live routes and trips the Metro-misses-a-new-route-directory
 * hazard on Windows, days before a demo. This renders the same bar with the same behaviour and
 * touches no route. If the app ever needs real per-tab state, promote it to a navigator then.
 *
 * Active state is FILL + INK + a dot — never a pill sliding across the bar, which is the 2026 nav
 * cliché (docs/design/research-2026-mobile.md §2). Icons are composed from Views; there is no icon
 * library and adding one is banned. Colours come from tokens via className — plain Views keep it;
 * only a reanimated Animated.View drops className, which is why the dot's colour is inline.
 */

const TABS = [
  { href: '/', key: 'listen' },
  { href: '/area', key: 'area' },
  { href: '/history', key: 'history' },
] as const;

const DUR = 150;
const EASE = Easing.bezier(0.05, 0.7, 0.1, 1); // emphasized-decelerate (M3)

/** Concentric ring — the capture instrument in miniature. */
function ListenIcon({ active }: { active: boolean }) {
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View
        className={active ? 'border-ink' : 'border-muted'}
        style={{ width: 20, height: 20, borderRadius: 10, borderWidth: active ? 2 : 1.5 }}
      />
      <View
        className={active ? 'bg-ink' : 'border-muted'}
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: active ? 0 : 1.5,
        }}
      />
    </View>
  );
}

/** Rounded block with a located dot — ground, and something on it. */
function AreaIcon({ active }: { active: boolean }) {
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View
        className={active ? 'border-ink bg-surface-raised' : 'border-muted'}
        style={{ width: 20, height: 18, borderRadius: 5, borderWidth: active ? 2 : 1.5 }}
      />
      <View
        className={active ? 'bg-ink' : 'bg-muted'}
        style={{ position: 'absolute', top: 8, left: 13, width: 6, height: 6, borderRadius: 3 }}
      />
    </View>
  );
}

/** Three stacked rules — a list, read as records. */
function HistoryIcon({ active }: { active: boolean }) {
  const h = active ? 2.5 : 2;
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View style={{ gap: 4 }}>
        {[20, 20, 13].map((w, i) => (
          <View
            key={i}
            className={active ? 'bg-ink' : 'bg-muted'}
            style={{ width: w, height: h, borderRadius: 1 }}
          />
        ))}
      </View>
    </View>
  );
}

function Tab({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const dot = useSharedValue(active ? 1 : 0);
  dot.value = withTiming(active ? 1 : 0, { duration: DUR, easing: EASE });
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dot.value,
    transform: [{ scale: 0.6 + dot.value * 0.4 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      // 49pt content row (iOS HIG). The whole cell is the target, comfortably over 44.
      style={{ flex: 1, height: 49, alignItems: 'center', justifyContent: 'center', gap: 2 }}
    >
      {children}
      <Text className={`font-plex-medium text-[10px] ${active ? 'text-ink' : 'text-muted'}`}>
        {label}
      </Text>
      {/* Geometry AND colour on `style`: react-native-web drops className on an Animated.View. */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#4C9FE0', // token `primary` — inline because className is dropped here
          },
          dotStyle,
        ]}
      />
    </Pressable>
  );
}

export function TabBar() {
  const c = useCopy();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const labels: Record<string, string> = {
    listen: c.nav.listen,
    area: c.nav.area,
    history: c.nav.history,
  };
  const icons: Record<string, (a: boolean) => React.ReactNode> = {
    listen: (a) => <ListenIcon active={a} />,
    area: (a) => <AreaIcon active={a} />,
    history: (a) => <HistoryIcon active={a} />,
  };

  return (
    <View
      className="flex-row border-line bg-bg"
      style={{ borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: insets.bottom }}
    >
      {TABS.map((t) => (
        <Tab
          key={t.key}
          label={labels[t.key]}
          active={pathname === t.href}
          // replace, not push: tabs are peers, and pushing would stack Listen on Listen.
          onPress={() => pathname !== t.href && router.replace(t.href as never)}
        >
          {icons[t.key](pathname === t.href)}
        </Tab>
      ))}
    </View>
  );
}
