import { Text, View } from 'react-native';

import { useCopy } from '@/copy';
import { FOG_BY_STAMP, activeCluster } from '@/data/district';
import { FOG_WINDOW_H, useFogCountdown, type Acknowledgement } from '@/store/dispatch';

// The acknowledged directive, AFTER the tap — specs.md §5 v2's "dispatch acknowledgement" beat.
//
// It has to read as a signed record, not as a dismissed notification, so the block is built like a
// docket: a signatory line under a hairline, the deadline stated as time actually remaining, and a
// quiet scheduling line at the foot. ONE component, rendered identically on the officer home and on
// the cluster sheet — two copies of a record are two chances for it to disagree with itself.
//
// Colour carries the state change: the alert-red directive becomes an `o-ok` record. Aedes-red is
// reserved for officer ALERT states (design-system.md rule 5) and a signed directive is no longer
// one — it is a commitment on file.
//
// No dependency and no svg: the progress rule is two Views.

export function DirectiveRecord({ ack }: { ack: Acknowledgement }) {
  const c = useCopy();
  const left = useFogCountdown(ack);

  return (
    <View className="rounded-card border border-o-line bg-o-surface px-4 py-3.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="bg-o-ok" style={{ width: 8, height: 8, borderRadius: 999 }} />
          <Text className="font-plex-semibold text-[15px] text-o-ink">
            {c.officer.directiveAcknowledged}
          </Text>
        </View>
        <Text className="font-mono text-[11px] text-o-muted">{ack.at}</Text>
      </View>

      {/* the signatory — who put their name to it */}
      <View className="mt-2.5 flex-row items-baseline gap-2 border-t border-o-line pt-2.5">
        <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
          {c.officer.signed}
        </Text>
        <Text className="font-plex-medium text-[13px] text-o-ink">{ack.by.name}</Text>
        <Text className="font-mono text-[11px] text-o-muted">{ack.by.badge}</Text>
      </View>

      {/* the deadline, as time actually remaining rather than as a restated duration */}
      <View className="mt-3 flex-row items-baseline justify-between">
        <Text className="font-mono-medium text-[22px] text-o-ink">
          {left.overdue
            ? c.officer.overdue
            : c.officer.remaining(left.hours, String(left.minutes).padStart(2, '0'))}
        </Text>
        <Text className="font-mono text-[11px] text-o-muted">{c.officer.fogBy(FOG_BY_STAMP)}</Text>
      </View>
      <View className="mt-2 h-[3px] w-full overflow-hidden rounded-pill bg-o-line">
        <View
          className="h-full rounded-pill bg-o-primary"
          style={{ width: `${Math.max(1.5, left.elapsed * 100)}%` }}
        />
      </View>
      <Text className="mt-1.5 font-mono text-[10px] text-o-muted">
        {c.officer.ofWindow(FOG_WINDOW_H)}
      </Text>

      <Text className="mt-3 font-plex text-[13px] text-o-muted">
        {c.officer.foggingScheduled(activeCluster.blocks, activeCluster.area)}
      </Text>
    </View>
  );
}
