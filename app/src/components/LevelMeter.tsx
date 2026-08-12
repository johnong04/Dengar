import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { LevelSource } from '@/lib/audioLevel';

/**
 * Thin symmetric tick meter for the instrument register: bars light from the center outward as
 * amplitude rises. Consumes any `LevelSource` — mic, simulated, or (later) the native pipeline.
 *
 * `on-primary` is the warm-board variant: the meter now sits ON the saturated `primary` disc, so a
 * lit bar must be the DARK one (`bg`) and an unlit bar recedes into the disc (`primary-press`).
 * Motion still applies here under reduced motion — the meter is data, not decoration (§Motion).
 */
export function LevelMeter({
  source,
  bars = 21,
  variant = 'default',
}: {
  source: LevelSource | null;
  bars?: number;
  variant?: 'default' | 'on-primary';
}) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!source) {
      setLevel(0);
      return;
    }
    return source.subscribe(setLevel);
  }, [source]);

  const onPrimary = variant === 'on-primary';
  const litClass = onPrimary ? 'bg-bg' : 'bg-primary';
  const unlitClass = onPrimary ? 'bg-primary-press' : 'bg-line';

  const center = (bars - 1) / 2;
  return (
    <View className="flex-row items-center gap-[3px]" accessibilityLabel="input level">
      {Array.from({ length: bars }, (_, i) => {
        const threshold = Math.abs(i - center) / (center + 1);
        const lit = level > threshold;
        return (
          <View
            key={i}
            className={`h-[14px] w-[2px] rounded-full ${lit ? litClass : unlitClass}`}
          />
        );
      })}
    </View>
  );
}
