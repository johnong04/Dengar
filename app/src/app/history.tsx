import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import tokens from '../../tailwind.tokens.js';

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

/**
 * `word` marks a value that is a WORD rather than a figure — a taxon, a sex, yes/no, a sync state.
 * It renders in Plex Sans; figures and timestamps keep mono. design-system.md §Type restricts mono
 * to numbers and machine strings, and a log whose every value is mono reads as a dump, not a record
 * (plan 23 §diagnosis 1). The suffix is always Sans — it is a parenthetical, not the readout.
 */
type ReadoutRow = { label: string; value: string; word?: boolean; suffix?: string };

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
      word: true,
      suffix: `· ${score(d.detail.taxon.confidence)}`,
    });
  if (d.detail?.sex?.value && typeof d.detail.sex.confidence === 'number')
    rows.push({
      label: c.history.sex,
      value: c.result.sexValue(d.detail.sex.value),
      word: true,
      suffix: `· ${score(d.detail.sex.confidence)}`,
    });
  if (d.detail?.gravid && typeof d.detail.gravid.confidence === 'number')
    rows.push({
      label: c.history.gravid,
      value: d.detail.gravid.value ? c.common.yes : c.common.no,
      word: true,
      suffix: `· ${score(d.detail.gravid.confidence)}`,
    });
  rows.push({ label: c.history.recordedRow, value: fullStamp(d.at, c) });
  rows.push({
    label: c.history.sync,
    value: d.synced ? c.history.synced : c.history.queuedOffline,
    word: true,
  });
  return rows;
}

function backToCapture() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * One record in the log. Tapping it OPENS A SHEET rather than pushing the rows below it down.
 *
 * The inline accordion it replaces had a real cost: expanding row three shoved rows four and five
 * off the screen, so reading one detection cost you the sight of every other one. A sheet is the
 * 2026 answer for exactly this (docs/design/research-2026-mobile.md §6) and it is what
 * `docs/design/inspiration/mapcluster-1.png` does — the list stays put and the detail rises over it.
 */
function Row({
  detection,
  first,
  onPress,
}: {
  detection: Detection;
  first: boolean;
  onPress: () => void;
}) {
  const c = useCopy();
  const aedes = detection.species === 'aedes';
  const inline = detailInline(detection, c);

  return (
    <View className={first ? '' : 'border-t border-line'}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
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
                <Text className="font-plex-medium text-[12px] text-caution">{c.history.queued}</Text>
              </View>
            )}
          </View>
          {inline && <Text className="mt-1 font-plex text-[13px] text-muted">{inline}</Text>}
        </View>
        <View className="flex-row items-center gap-2">
          <View className="items-end">
            <Text className="font-mono-medium text-[17px] text-ink">
              {score(detection.confidence)}
            </Text>
            <Text className="mt-1 font-mono text-[12px] text-muted">
              {timeLabel(detection.at, c)}
            </Text>
          </View>
          <ChevronRight size={16} color={tokens.colors.line} strokeWidth={2} />
        </View>
      </Pressable>
    </View>
  );
}

/**
 * The readout rows. Labels left, value right, hairlines INSIDE one surface.
 *
 * `surface-raised` on the sheet's `surface` ground, never the other way round: depth is exactly two
 * levels and the inner block must be the HIGHER one, or the panel reads as a hole punched in the
 * sheet (design-system.md §Space & shape).
 */
function Readout({ rows }: { rows: ReadoutRow[] }) {
  return (
    <View className="rounded-block bg-surface-raised px-5">
      {rows.map((row, i) => (
        <View
          key={row.label}
          className={`flex-row items-center justify-between py-3.5 ${
            i === 0 ? '' : 'border-t border-line'
          }`}
        >
          <Text className="font-plex text-[15px] text-muted">{row.label}</Text>
          <Text
            className={
              row.word
                ? 'font-plex-medium text-[15px] text-ink'
                : 'font-mono text-[15px] text-ink'
            }
          >
            {row.value}
            {row.suffix ? (
              <Text className="font-plex text-[15px] text-muted"> {row.suffix}</Text>
            ) : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function History() {
  const c = useCopy();
  const detections = useDetections();
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const sheet = useRef<BottomSheet>(null);
  /**
   * One detent. A detail sheet has one job and a peek state would only show the heading of it;
   * two detents earn their keep on the officer map, where the ground behind the sheet IS content.
   */
  const snapPoints = useMemo(() => ['58%'], []);
  const open = useCallback((id: string) => {
    setOpenId(id);
    sheet.current?.snapToIndex(0);
  }, []);
  /**
   * The scrim. Opacity is interpolated from the sheet's own position rather than toggled, so the
   * log behind it dims as the sheet rises instead of flashing. `disappearsOnIndex={-1}` is what
   * makes it leave with the sheet.
   */
  const backdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Store order is insertion order; the log reads newest-first regardless.
  const ordered = [...detections].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const openDetection = ordered.find((d) => d.id === openId) ?? null;

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
            <View className="flex-row items-center gap-1">
              <ChevronLeft size={18} color={tokens.colors.muted} strokeWidth={2} />
              <Text className="font-plex-medium text-[15px] text-muted">{c.history.back}</Text>
            </View>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <SyncChip />
            <Text className="font-plex text-[13px] text-muted">
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
                <Row key={d.id} detection={d} first={i === 0} onPress={() => open(d.id)} />
              ))}
            </View>
          </ScrollView>
        )}

        {/* The settings-adjacent spot. History is the citizen's own-data screen, so the preference
            that governs the whole app lives at its foot — outside the ScrollView, so it is present
            in the empty state as well as under a full log, and never scrolls away. */}
        <View className="mb-4 border-t border-line pt-3">
          <View className="flex-row items-center justify-between">
            <LanguageToggle withLabel />
          </View>

          {/* The officer surface, reached deliberately and from ONE place.
              It is not a tab: a government dashboard sitting beside History in a citizen's shell
              says the two audiences are peers, and the whole design rests on them not being. It is
              also no longer only a hidden URL on /board — John opened the app after three weeks,
              found three flows, and reasonably concluded the officer screens did not exist.
              A settings-adjacent row is what a real product uses for a role switch, and this
              screen is the only settings-adjacent surface the app has. */}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={c.history.officerEntry}
            onPress={() => router.push('/officer')}
            className="mt-3 min-h-[44px] flex-row items-center justify-between active:opacity-70"
          >
            <Text className="font-plex text-[15px] text-muted">{c.history.officerEntry}</Text>
            <ChevronRight size={18} color={tokens.colors.muted} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
      <TabBar />

      {/* ── the detail sheet ──────────────────────────────────────────────────
          Mounted once at screen level and fed whichever row was tapped, rather than one sheet per
          row: a list of twelve detections would otherwise mount twelve sheets, each with its own
          animation state, to show one.

          Dark ground, `block` radius, no shadow — design-system.md bans shadows on dark, so the
          sheet separates from the log by SURFACE LEVEL (`surface-raised` over `bg`) plus the
          scrim, which is exactly the elevation rule the rest of the app follows. */}
      <BottomSheet
        ref={sheet}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setOpenId(null)}
        backdropComponent={backdrop}
        animateOnMount={!reducedMotion}
        handleIndicatorStyle={{
          width: 56,
          height: 6,
          borderRadius: 3,
          backgroundColor: tokens.colors.line,
        }}
        backgroundStyle={{
          backgroundColor: tokens.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {openDetection ? (
            <>
              <View className="flex-row items-center gap-2 pb-4">
                {openDetection.species === 'aedes' && (
                  <View className="h-2 w-2 rounded-full bg-alert" />
                )}
                <Text className="font-plex-semibold text-[20px] text-ink">
                  {openDetection.species === 'aedes' ? c.history.aedes : c.history.notAedes}
                </Text>
              </View>
              <Readout rows={readoutRows(openDetection, c)} />
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
