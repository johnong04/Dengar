import { Text, View } from 'react-native';

import { useCopy } from '@/copy';
import { useConnectivity } from '@/lib/connectivity';
import { useDetections } from '@/store/detections';

/**
 * Quiet connectivity chip (capture status row + history top row). Offline is a feature,
 * not an alarm: muted mono on a filled `surface-raised` pill — never caution, never alert.
 * The hairline border is gone: the warm law groups by filled surface, not by rule.
 * Online with nothing pending renders nothing; the row it sits in owns a fixed height
 * so appearing/disappearing never shifts layout vertically.
 */
export function SyncChip() {
  const c = useCopy();
  const online = useConnectivity();
  const detections = useDetections();
  const pending = detections.filter((d) => !d.synced).length;

  if (online && pending === 0) return null;

  const label = online ? c.sync.syncing(pending) : c.sync.offline(pending);

  return (
    <View className="rounded-pill bg-surface-raised px-3 py-1">
      <Text className="font-mono text-[12px] text-muted">{label}</Text>
    </View>
  );
}
