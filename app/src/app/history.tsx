import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { type Detection, useDetections } from '@/store/detections';

const score = (n: number) => n.toFixed(2);
const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "today 19:42" / "yesterday 06:58" / "11 Aug 21:42" — relative where it reads, dated where it must. */
function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  if (sameDay(d, now)) return `today ${hm}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return `yesterday ${hm}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hm}`;
}

/** Full stamp for the expanded readout: "11 Aug 2026 · 21:42". */
function fullStamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "female · Aedes aegypti" — only the heads that reported (specs.md §6). */
function detailInline(d: Detection): string | null {
  const parts = [d.detail?.sex?.value, d.detail?.taxon?.name].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

type ReadoutRow = { label: string; value: string; suffix?: string };

/** The full readout the row stands behind — same grammar as the result surface. */
function readoutRows(d: Detection): ReadoutRow[] {
  const rows: ReadoutRow[] = [{ label: 'Confidence', value: score(d.confidence) }];
  if (d.detail?.taxon?.name && typeof d.detail.taxon.confidence === 'number')
    rows.push({ label: 'Species', value: d.detail.taxon.name, suffix: `· ${score(d.detail.taxon.confidence)}` });
  if (d.detail?.sex?.value && typeof d.detail.sex.confidence === 'number')
    rows.push({ label: 'Sex', value: d.detail.sex.value, suffix: `· ${score(d.detail.sex.confidence)}` });
  if (d.detail?.gravid && typeof d.detail.gravid.confidence === 'number')
    rows.push({
      label: 'Gravid',
      value: d.detail.gravid.value ? 'yes' : 'no',
      suffix: `· ${score(d.detail.gravid.confidence)}`,
    });
  rows.push({ label: 'Recorded', value: fullStamp(d.at) });
  rows.push({ label: 'Sync', value: d.synced ? 'synced' : 'queued offline' });
  return rows;
}

function backToCapture() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function Row({
  detection,
  expanded,
  onPress,
  reducedMotion,
}: {
  detection: Detection;
  expanded: boolean;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const aedes = detection.species === 'aedes';
  const inline = detailInline(detection);
  const rows = readoutRows(detection);
  const enter = reducedMotion ? undefined : FadeIn.duration(180);

  return (
    <View className="border-b border-line">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-[44px] flex-row items-center justify-between py-3 active:opacity-70"
      >
        <View className="shrink pr-4">
          <View className="flex-row items-center">
            {/* the one red allowed outside the drench: the vector's mark in the log */}
            {aedes && <View className="mr-2 h-2 w-2 rounded-full bg-alert" />}
            <Text className="font-plex-medium text-[15px] text-ink">
              {aedes ? 'Aedes' : 'Not Aedes'}
            </Text>
            {!detection.synced && (
              <View className="ml-2 rounded-full border border-caution px-2 py-[1px]">
                <Text className="font-mono text-[12px] text-caution">queued</Text>
              </View>
            )}
          </View>
          {inline && <Text className="mt-1 font-plex text-[13px] text-muted">{inline}</Text>}
        </View>
        <View className="items-end">
          <Text className="font-mono text-[15px] text-ink">{score(detection.confidence)}</Text>
          <Text className="mt-1 font-mono text-[12px] text-muted">{timeLabel(detection.at)}</Text>
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={enter} className="pb-3">
          {rows.map((row, i) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between py-3 ${i === 0 ? '' : 'border-t border-line'}`}
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
        </Animated.View>
      )}
    </View>
  );
}

export default function History() {
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
            accessibilityLabel="Back to capture"
            className="min-h-[44px] justify-center pr-6 active:opacity-70"
          >
            <Text className="font-plex-medium text-[15px] text-muted">← History</Text>
          </Pressable>
          <Text className="font-mono text-[12px] text-muted">
            {ordered.length} recorded
          </Text>
        </View>

        {ordered.length === 0 ? (
          // Empty log teaches what the log is for — a beginning, not a failure state.
          <View className="flex-1 items-center justify-center pb-16">
            <Text className="text-center font-plex-semibold text-[20px] leading-7 text-ink">
              Your detections build{'\n'}your district's map.
            </Text>
            <Text className="mt-3 text-center font-plex text-[15px] leading-[22px] text-muted">
              The first one starts the moment{'\n'}a mosquito finds you.
            </Text>
            <Pressable
              onPress={backToCapture}
              accessibilityRole="button"
              className="mt-8 min-h-[44px] items-center justify-center px-6 py-3 active:opacity-70"
            >
              <Text className="font-plex-medium text-[15px] text-primary">
                Identify the mosquito that found you
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="mt-8 flex-1" contentContainerClassName="pb-8">
            <View className="border-t border-line">
              {ordered.map((d) => (
                <Row
                  key={d.id}
                  detection={d}
                  expanded={expandedId === d.id}
                  onPress={() => setExpandedId((cur) => (cur === d.id ? null : d.id))}
                  reducedMotion={reducedMotion}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
