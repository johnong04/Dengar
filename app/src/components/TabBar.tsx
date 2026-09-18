import { usePathname, useRouter } from 'expo-router';
import { List, Map, Mic } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCopy } from '@/copy';
import tokens from '../../tailwind.tokens.js';

/**
 * The citizen shell: Listen / Area / History.
 *
 * Why a component and not an expo-router `Tabs` navigator: moving `index`, `area` and `history`
 * into a `(tabs)` group renames three live routes and trips the Metro-misses-a-new-route-directory
 * hazard on Windows, days before a demo. This renders the same bar with the same behaviour and
 * touches no route. If the app ever needs real per-tab state, promote it to a navigator then.
 *
 * Active state is FILL + INK + a dot — never a pill sliding across the bar, which is the 2026 nav
 * cliché (docs/design/research-2026-mobile.md §2). Labels stay: ours are not universal glyphs, and
 * icon-only bars fail recognition for anything that is not home/search/profile (§1).
 *
 * The three icons were hand-built from `View`s because an icon library was banned — a rule written
 * for NATIVE modules and wrongly applied to JS-only ones (plan 23 §why we never fixed it). They are
 * now lucide, which is the same 1.5–2 px stroke set the rest of the app uses, so the bar stops
 * being the only place in the app with bespoke glyph geometry.
 *
 * Weight carries the active state, not colour alone: stroke 1.75 → 2.25, muted → ink. Colours come
 * from tokens via className on plain Views; a reanimated Animated.View drops className on
 * react-native-web, which is why the dot's colour is inline.
 */

const TABS = [
  { href: '/', key: 'listen' },
  { href: '/area', key: 'area' },
  { href: '/history', key: 'history' },
] as const;

const DUR = 150;
const EASE = Easing.bezier(0.05, 0.7, 0.1, 1); // emphasized-decelerate (M3)

/**
 * The three destinations, as icons. Semantic, never decorative: the microphone IS the capture
 * action, the map IS the neighbourhood view, the list IS the log of detections. An icon that only
 * repeats its label is noise (docs/design/research-2026-mobile.md §3).
 */
const ICON = { listen: Mic, area: Map, history: List } as const;

/**
 * An SVG stroke is a PROP, not a className, so icon colour cannot come through Tailwind. It comes
 * from `tailwind.tokens.js` instead — the same file the config spreads — so "no raw hex in screens"
 * still holds and an icon can never drift from the palette.
 */
const INK = tokens.colors.ink;
const MUTED = tokens.colors.muted;

function TabIcon({ name, active }: { name: keyof typeof ICON; active: boolean }) {
  const Glyph = ICON[name];
  return (
    <Glyph size={22} color={active ? INK : MUTED} strokeWidth={active ? 2.25 : 1.75} />
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
          <TabIcon name={t.key} active={pathname === t.href} />
        </Tab>
      ))}
    </View>
  );
}
