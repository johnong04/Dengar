import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabBar } from '@/components/TabBar';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SyncChip } from '@/components/SyncChip';
import { type Copy, useCopy } from '@/copy';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { type Detection, useDetections } from '@/store/detections';

const score = (n: number) => n.toFixed(2);
const pad = (n: number) => String(n).padStart(2, '0');

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "today 19:42" / "yesterday 06:58" / "11 Aug 21:42" — relative where it reads, dated where it must. */
function timeLabel(iso: string, c: Copy): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  if (sameDay(d, now)) return `${c.history.today} ${hm}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return `${c.history.yesterday} ${hm}`;
  return `${d.getDate()} ${c.history.months[d.getMonth()]} ${hm}`;
}

/** Full stamp for the expanded readout: "11 Aug 2026 · 21:42". */
function fullStamp(iso: string, c: Copy): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${c.history.months[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * "female · Aedes aegypti" — only the heads that reported (specs.md §6). The sex token is mapped
 * through the lookup (the taxon name is a proper noun and is not); the collapsed row and the
 * expanded readout must not print it in two different languages.
 */
function detailInline(d: Detection, c: Copy): string | null {
  const parts = [
    d.detail?.sex?.value ? c.result.sexValue(d.detail.sex.value) : undefined,
    d.detail?.taxon?.name,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

type ReadoutRow = { label: string; value: string; suffix?: string };

/**
 * What the collapsed row does NOT already say. Confidence is deliberately absent: the collapsed row
 * shows it at the same size in the same font, and repeating it made the expansion read as padding.
 */
function readoutRows(d: Detection, c: Copy): ReadoutRow[] {
  const rows: ReadoutRow[] = [];
  if (d.detail?.taxon?.name && typeof d.detail.taxon.confidence === 'number')
    rows.push({
      label: c.history.species,
      value: d.detail.taxon.name,
      suffix: `· ${score(d.detail.taxon.confidence)}`,
    });
  if (d.detail?.sex?.value && typeof d.detail.sex.confidence === 'number')
    rows.push({
      label: c.history.sex,
      value: c.result.sexValue(d.detail.sex.value),
      suffix: `· ${score(d.detail.sex.confidence)}`,
    });
  if (d.detail?.gravid && typeof d.detail.gravid.confidence === 'number')
    rows.push({
      label: c.history.gravid,
      value: d.detail.gravid.value ? c.common.yes : c.common.no,
      suffix: `· ${score(d.detail.gravid.confidence)}`,
    });
  rows.push({ label: c.history.recordedRow, value: fullStamp(d.at, c) });
  rows.push({
    label: c.history.sync,
    value: d.synced ? c.history.synced : c.history.queuedOffline,
  });
  return rows;
}

function backToCapture() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function Row({
  detection,
  first,
  expanded,
  onPress,
  reducedMotion,
}: {
  detection: Detection;
  first: boolean;
  expanded: boolean;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const c = useCopy();
  const aedes = detection.species === 'aedes';
  const inline = detailInline(detection, c);
  const rows = readoutRows(detection, c);
  const enter = reducedMotion ? undefined : FadeIn.duration(180);

  return (
    <View className={first ? '' : 'border-t border-line'}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-[52px] flex-row items-center justify-between py-4 active:opacity-70"
      >
        <View className="shrink pr-4">
          <View className="flex-row items-center">
            {/* the one red allowed outside the drench: the vector's mark in the log */}
            {aedes && <View className="mr-2 h-2 w-2 rounded-full bg-alert" />}
            <Text className="font-plex-medium text-[16px] text-ink">
              {aedes ? c.history.aedes : c.history.notAedes}
            </Text>
            {!detection.synced && (
              <View className="ml-2 rounded-pill bg-surface-raised px-2 py-1">
                <Text className="font-mono text-[12px] text-caution">{c.history.queued}</Text>
              </View>
            )}
          </View>
          {inline && <Text className="mt-1 font-plex text-[13px] text-muted">{inline}</Text>}
        </View>
        <View className="items-end">
          <Text className="font-mono-medium text-[17px] text-ink">
            {score(detection.confidence)}
          </Text>
          <Text className="mt-1 font-mono text-[12px] text-muted">
            {timeLabel(detection.at, c)}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={enter} className="pb-4">
          {/* depth 2 inside the list surface — the full readout the row stands behind */}
          <View className="rounded-block bg-surface-raised px-4">
            {rows.map((row, i) => (
              <View
                key={row.label}
                className={`flex-row items-center justify-between py-3 ${
                  i === 0 ? '' : 'border-t border-line'
                }`}
              >
                <Text className="font-plex text-[15px] text-muted">{row.label}</Text>
                <Text className="font-mono text-[15px] text-ink">
                  {row.value}
                  {row.suffix ? (
                    <Text className="font-mono text-[15px] text-muted"> {row.suffix}</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function History() {
  const c = useCopy();
  const detections = useDetections();
  const reducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Store order is insertion order; the log reads newest-first regardless.
  const ordered = [...detections].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* top row */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            onPress={backToCapture}
            accessibilityRole="button"
            accessibilityLabel={c.common.backToCapture}
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← {c.history.back}</Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <SyncChip />
            <Text className="font-mono text-[12px] text-muted">
              {c.history.recorded(ordered.length)}
            </Text>
          </View>
        </View>

        {ordered.length === 0 ? (
          // Empty log teaches what the log is for — a beginning, not a failure state.
          <View className="flex-1 items-center justify-center pb-16">
            <Text className="text-center font-plex-semibold text-[20px] leading-7 text-ink">
              {c.history.emptyHeadline}
            </Text>
            <Text className="mt-3 text-center font-plex text-[16px] leading-6 text-muted">
              {c.history.emptyBody}
            </Text>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="mt-8 min-h-[44px] items-center justify-center rounded-pill bg-surface px-6 py-3 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-primary">
                {c.history.emptyCta}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="mt-6 flex-1" contentContainerClassName="pb-8">
            {/* the log is one filled surface; the rules are dividers inside it */}
            <View className="rounded-block bg-surface px-5">
              {ordered.map((d, i) => (
                <Row
                  key={d.id}
                  detection={d}
                  first={i === 0}
                  expanded={expandedId === d.id}
                  onPress={() => setExpandedId((cur) => (cur === d.id ? null : d.id))}
                  reducedMotion={reducedMotion}
                />
              ))}
            </View>
          </ScrollView>
        )}

        {/* The settings-adjacent spot. History is the citizen's own-data screen, so the preference
            that governs the whole app lives at its foot — outside the ScrollView, so it is present
            in the empty state as well as under a full log, and never scrolls away. */}
        <View className="mb-4 flex-row items-center justify-between border-t border-line pt-3">
          <LanguageToggle withLabel />
        </View>
      </View>
      <TabBar />
    </SafeAreaView>
  );
}
