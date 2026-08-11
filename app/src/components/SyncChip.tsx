import { Text, View } from 'react-native';

import { useConnectivity } from '@/lib/connectivity';
import { useDetections } from '@/store/detections';

/**
 * Quiet connectivity chip (capture status row + history top row). Offline is a feature,
 * not an alarm: muted mono on surface with a hairline — never caution, never alert.
 * Online with nothing pending renders nothing; the row it sits in owns a fixed height
 * so appearing/disappearing never shifts layout vertically.
 */
export function SyncChip() {
  const online = useConnectivity();
  const detections = useDetections();
  const pending = detections.filter((d) => !d.synced).length;

  if (online && pending === 0) return null;

  const label = online ? `syncing ${pending}…` : `offline · ${pending} queued`;

  return (
    <View className="rounded-full border border-line bg-surface px-2 py-[2px]">
      <Text className="font-mono text-[12px] text-muted">{label}</Text>
    </View>
  );
}
