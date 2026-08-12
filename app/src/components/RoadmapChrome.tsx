import { Link, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Copy, useCopy } from '@/copy';
import type { Figure } from '@/lib/impact';

/**
 * Shared chrome for the three v3 `/roadmap/*` screens.
 *
 * These screens describe capability the app DOES NOT HAVE (specs §5 v3, §8: "everything v3" is
 * simulated). specs §13 rule 3 makes concealing that disqualifying, so the framing is structural,
 * not a caption someone can forget: the `roadmap` marker and the "not built" line are arguments to
 * the wrapper, and there is no way to render one of these screens without them.
 *
 * Citizen register throughout — dark ground, `block`/`pill` radius, Plex Sans prose, mono for
 * numbers only. A v3 screen inherits its audience's language; it is not a third register
 * (design-system.md §Gate 2, "No gate 3").
 */

/** The quiet marker. Same shape as the `simulated` pill the node and officer screens already use. */
export function RoadmapMark() {
  const c = useCopy();
  return (
    <View className="rounded-pill bg-surface px-3 py-1">
      <Text className="font-mono text-[12px] text-muted">{c.roadmap.mark}</Text>
    </View>
  );
}

/** Block-level disclosure that the content below is seeded, not measured (COMMON rule 8). */
export function SimulatedTag() {
  const c = useCopy();
  return (
    <View className="rounded-pill bg-surface-raised px-2 py-1">
      <Text className="font-mono text-[12px] text-muted">{c.common.simulated}</Text>
    </View>
  );
}

/** `[cited]` / `[modeled]` — specs §13 rule 2. Every figure on these screens wears one. */
export function FigureTag({ tag }: { tag: Figure['tag'] }) {
  return <Text className="font-mono text-[12px] text-muted">[{tag}]</Text>;
}

/**
 * One figure with its derivation underneath. The arithmetic is never typed here — it arrives from
 * `lib/impact.ts` computed off the same constants as the value, so the two cannot disagree.
 */
export function FigureRow({ label, figure }: { label: string; figure: Figure }) {
  return (
    <View className="flex-row items-start justify-between py-3">
      <View className="shrink pr-4">
        <Text className="font-plex text-[16px] text-ink">{label}</Text>
        {figure.arithmetic !== '' && (
          <Text className="mt-1 font-mono text-[12px] text-muted">{figure.arithmetic}</Text>
        )}
      </View>
      <View className="items-end">
        <Text className="font-mono-medium text-[17px] text-ink">{figure.value}</Text>
        <View className="mt-1">
          <FigureTag tag={figure.tag} />
        </View>
      </View>
    </View>
  );
}

type ScreenProps = {
  /** Short name in the top row, beside the back affordance. */
  title: string;
  /** The screen's own headline, at the citizen 30 px step. */
  headline: string;
  /** One sentence saying plainly that this is not built. Required — see the file header. */
  standing: string;
  /** Which of the three roadmap routes this is, so the footer offers the other two. */
  self: 'privacy' | 'detail' | 'impact';
  children: ReactNode;
};

const SIBLINGS = {
  privacy: { href: '/roadmap/privacy' },
  detail: { href: '/roadmap/detail' },
  impact: { href: '/roadmap/impact' },
} as const;

const siblingLabel = (c: Copy, k: keyof typeof SIBLINGS) =>
  k === 'privacy'
    ? c.roadmap.privacyLabel
    : k === 'detail'
      ? c.roadmap.detailLabel
      : c.roadmap.impactLabel;

const ORDER = ['privacy', 'detail', 'impact'] as const;

function back() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function RoadmapScreen({ title, headline, standing, self, children }: ScreenProps) {
  const c = useCopy();
  const others = ORDER.filter((k) => k !== self);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel={c.roadmap.backFrom(title)}
            className="min-h-[44px] shrink justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← {title}</Text>
          </Pressable>
          <RoadmapMark />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-6 font-plex-bold text-[30px] leading-9 text-ink">{headline}</Text>
          <Text className="mt-3 font-plex text-[16px] leading-6 text-muted">{standing}</Text>

          {children}

          {/* the other two roadmap screens — the only navigation these screens own */}
          <View className="mt-8 flex-row gap-3">
            {others.map((k) => (
              <Link key={k} href={SIBLINGS[k].href} asChild>
                <Pressable
                  accessibilityRole="link"
                  className="min-h-[44px] flex-1 items-center justify-center rounded-pill bg-surface px-4 py-3 active:opacity-70"
                >
                  <Text className="font-plex-medium text-[15px] text-primary">
                    {siblingLabel(c, k)}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/** A filled grouped block — §Space & shape: group by surface, never by a hairline box. */
export function Block({
  heading,
  tag,
  children,
  tint,
}: {
  heading?: string;
  tag?: ReactNode;
  children: ReactNode;
  tint?: 'surface' | 'guide' | 'trust';
}) {
  const ground =
    tint === 'guide' ? 'bg-tint-guide' : tint === 'trust' ? 'bg-tint-trust' : 'bg-surface';
  const headingInk = tint === 'guide' ? 'text-tint-guide-mono' : 'text-muted';
  return (
    <View className={`mt-4 rounded-block px-5 py-4 ${ground}`}>
      {(heading || tag) && (
        <View className="mb-1 flex-row items-center justify-between">
          {heading ? (
            <Text className={`font-mono text-[12px] uppercase ${headingInk}`}>{heading}</Text>
          ) : (
            <View />
          )}
          {tag}
        </View>
      )}
      {children}
    </View>
  );
}
