import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Copy, useCopy } from '@/copy';
import { FOG_BY_STAMP, activeCluster, district, type Tone } from '@/data/district';
import {
  RECORD_STAMP,
  stateLabel,
  useAcknowledgement,
  useAlertFeed,
  type AlertRow,
  type DirectiveState,
} from '@/store/dispatch';

// Officer ALERT FEED — specs.md §5 v2's "alert feed", and the full list the home's watch rows
// summarise. Same light officer register as the home and the cluster sheet: hairline-separated
// rows, mono figures, `card`/`pill` radius, cobalt as the only saturated control.
//
// Every row is derived. The area, its 72 h count and its delta come straight from
// `data/district.ts`; the state comes from `store/dispatch.ts`, which computes it from the one
// active cluster and the one acknowledgement record. Nothing here is typed in, so no row can
// contradict the cluster sheet it opens.
//
// No search: the district has three watch areas, and a search field over three rows is furniture.
// Three filter chips instead, each carrying its own count, so the filter states the shape of the
// feed before it is touched.
//
// No dependency and no svg (COMMON rule 1): the sparkline is 14 flex Views, the same construction
// as the home's.

type Filter = 'all' | 'active' | 'acknowledged';

const filtersOf = (c: Copy): { key: Filter; label: string }[] => [
  { key: 'all', label: c.officer.filterAll },
  { key: 'active', label: c.officer.filterActive },
  { key: 'acknowledged', label: c.officer.filterAcknowledged },
];

/** Semantic tone → officer token. Literal so the Tailwind scanner sees every class. */
const TONE_BG: Record<Tone, string> = {
  alert: 'bg-o-alert',
  caution: 'bg-o-caution',
  neutral: 'bg-o-muted',
};
const TONE_TEXT: Record<Tone, string> = {
  alert: 'text-o-alert',
  caution: 'text-o-caution',
  neutral: 'text-o-muted',
};

/**
 * "Active" is a directive still awaiting a signature — the only row an officer must act on. A
 * signed one has left the queue, which is why acknowledging visibly empties this filter.
 */
function matches(row: AlertRow, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'acknowledged') return row.state === 'acknowledged';
  return row.state === 'directive';
}

function Spark({ data, tone }: { data: readonly number[]; tone: Tone }) {
  const max = Math.max(...data, 1);
  return (
    <View className="h-5 flex-row items-end gap-[2px]" style={{ width: 62 }}>
      {data.map((v, i) => (
        <View
          key={i}
          className={`flex-1 rounded-[1px] ${v === 0 ? 'bg-o-line' : TONE_BG[tone]}`}
          style={{ height: Math.max(2, (v / max) * 20) }}
        />
      ))}
    </View>
  );
}

/**
 * Recency, as a dot. Read off the area's own spark, so it can never disagree with the bars beside
 * it: same day = a solid tone dot, 1–3 days = a smaller one, older = a hollow ring. Size and fill
 * both carry it, so it survives a greyscale frame and a colour-blind reader.
 */
function RecencyDot({ days, tone }: { days: number | null; tone: Tone }) {
  if (days === null) return <View style={{ width: 10, height: 10 }} />;
  if (days === 0) {
    return <View className={TONE_BG[tone]} style={{ width: 10, height: 10, borderRadius: 999 }} />;
  }
  if (days <= 3) {
    return <View className={TONE_BG[tone]} style={{ width: 7, height: 7, borderRadius: 999 }} />;
  }
  return (
    <View className="border border-o-muted" style={{ width: 9, height: 9, borderRadius: 999 }} />
  );
}

function StateChip({ state }: { state: DirectiveState }) {
  const c = useCopy();
  const skin =
    state === 'directive'
      ? 'bg-o-alert'
      : state === 'acknowledged'
        ? 'border border-o-line bg-o-bg'
        : 'bg-o-surface';
  const ink =
    state === 'directive' ? 'text-o-bg' : state === 'acknowledged' ? 'text-o-ok' : 'text-o-muted';
  return (
    <View className={`rounded-pill px-2 py-[2px] ${skin}`}>
      <Text className={`font-mono text-[10px] ${ink}`}>{stateLabel(state, c)}</Text>
    </View>
  );
}

/**
 * One line of the dispatch log. The spine dot is filled for what has happened and hollow for what
 * is still owed, so the sequence reads at a glance without a colour legend.
 */
function LogEntry({
  label,
  detail,
  stamp,
  done,
  last = false,
}: {
  label: string;
  detail: string;
  stamp: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <View className="flex-row">
      {/* the spine */}
      <View className="items-center" style={{ width: 16 }}>
        <View
          className={done ? 'bg-o-primary' : 'border border-o-muted'}
          style={{ width: 8, height: 8, borderRadius: 999, marginTop: 5 }}
        />
        {last ? null : <View className="w-[1px] flex-1 bg-o-line" style={{ marginTop: 2 }} />}
      </View>
      <View className={`flex-1 ${last ? '' : 'pb-3'}`}>
        <View className="flex-row items-baseline justify-between">
          <Text className="font-plex-medium text-[13px] text-o-ink">{label}</Text>
          <Text className="font-mono text-[11px] text-o-muted">{stamp}</Text>
        </View>
        <Text className="mt-[2px] font-mono text-[11px] text-o-muted">{detail}</Text>
      </View>
    </View>
  );
}

export default function OfficerAlerts() {
  const c = useCopy();
  const FILTERS = filtersOf(c);
  const router = useRouter();
  const ack = useAcknowledgement();
  const rows = useAlertFeed();
  const [filter, setFilter] = useState<Filter>('all');
  const shown = rows.filter((r) => matches(r, filter));

  return (
    <SafeAreaView className="flex-1 bg-o-bg" edges={['top']}>
      {/* ── header — the officer home's grammar: name left, mono stamp right, one hairline ── */}
      <View className="flex-row items-center border-b border-o-line pl-1 pr-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={c.common.backToDistrict}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
        >
          <Text className="font-plex-medium text-[22px] text-o-primary">‹</Text>
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-plex-semibold text-[17px] text-o-ink">{c.officer.alertsTitle}</Text>
          {district.simulated ? (
            <View className="rounded-pill bg-o-surface px-2 py-[2px]">
              <Text className="font-mono text-[10px] text-o-muted">{c.common.simulated}</Text>
            </View>
          ) : null}
        </View>
        <Text className="font-mono text-[11px] text-o-muted">{district.stamp}</Text>
      </View>

      {/* ── filters ─────────────────────────────────────────────────────────── */}
      <View className="flex-row items-center gap-2 border-b border-o-line px-5 py-2.5">
        {FILTERS.map((f) => {
          const n = rows.filter((r) => matches(r, f.key)).length;
          const on = filter === f.key;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(f.key)}
              className={`min-h-[44px] flex-row items-center gap-1.5 rounded-pill px-3 ${on ? 'bg-o-primary' : 'bg-o-surface'}`}
              style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
            >
              <Text className={`font-plex-medium text-[13px] ${on ? 'text-o-bg' : 'text-o-muted'}`}>
                {f.label}
              </Text>
              <Text className={`font-mono text-[11px] ${on ? 'text-o-surface' : 'text-o-muted'}`}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {shown.map((row) => (
          <Link
            key={row.area.id}
            href={{ pathname: '/officer/cluster/[id]', params: { id: row.area.id } }}
            asChild
          >
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={c.officer.rowA11y(
                row.area.name,
                stateLabel(row.state, c),
                row.area.count,
                activeCluster.windowHours,
              )}
              className="min-h-[68px] flex-row items-center gap-3 border-b border-o-line px-5 py-3"
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
            >
              <View className="items-center" style={{ width: 10 }}>
                <RecencyDot days={row.lastSeenDays} tone={row.area.tone} />
              </View>

              <View className="flex-1">
                <Text className="font-plex-medium text-[15px] text-o-ink">{row.area.name}</Text>
                <View className="mt-[5px] flex-row items-center gap-2">
                  <StateChip state={row.state} />
                  <Text className={`font-mono text-[11px] ${TONE_TEXT[row.area.tone]}`}>
                    {row.area.count === 0
                      ? c.officer.silent(row.area.delta)
                      : c.officer.countWindow(
                          row.area.count,
                          activeCluster.windowHours,
                          row.area.delta,
                        )}
                  </Text>
                </View>
              </View>

              <Spark data={row.area.spark} tone={row.area.tone} />
              <Text className="font-mono text-[13px] text-o-muted">›</Text>
            </Pressable>
          </Link>
        ))}

        {shown.length === 0 ? (
          // Empty is a real state here: acknowledging the one directive empties `Active`, and that
          // emptiness IS the outcome. Reported plainly — never a failure, never a celebration.
          <View className="px-5 pt-6">
            <Text className="font-plex-medium text-[15px] text-o-ink">{c.officer.emptyFilter}</Text>
            <Text className="mt-1 font-mono text-[11px] text-o-muted">
              {filter === 'active' ? c.officer.emptyActive : c.officer.emptyAcknowledged}
            </Text>
          </View>
        ) : null}

        <Text className="px-5 pt-3 font-mono text-[10px] text-o-muted">
          {c.officer.feedFoot(rows.length, activeCluster.windowHours)}
        </Text>

        {/* ── dispatch log ────────────────────────────────────────────────────
            The one directive's own history, so the feed shows what has been DONE and not only what
            is outstanding — and so the acknowledgement is visible here the moment it is signed on
            the cluster sheet, without a reload. Three stamps, none of them typed in: issue and
            signature are the scenario clock, the deadline is slice 14's `FOG_BY_STAMP` (that same
            clock + 48 h). */}
        <View className="mt-5 border-t border-o-line px-5 pt-3">
          <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
            {c.officer.dispatchLog}
          </Text>
          <View className="mt-3">
            <LogEntry
              label={c.officer.directiveIssued}
              detail={`${activeCluster.area} · ${activeCluster.blocks}`}
              stamp={RECORD_STAMP}
              done
            />
            <LogEntry
              label={ack ? c.officer.acknowledged : c.officer.awaitingAck}
              detail={ack ? `${ack.by.name} · ${ack.by.badge}` : c.officer.notYetSigned}
              stamp={ack ? ack.at : '—'}
              done={!!ack}
            />
            <LogEntry
              label={c.officer.foggingDue}
              detail={c.officer.withinIssue(activeCluster.blocks)}
              stamp={FOG_BY_STAMP}
              done={false}
              last
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
