import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { LevelSource } from '@/lib/audioLevel';

/**
 * Thin symmetric tick meter for the instrument register: bars light from the center outward as
 * amplitude rises. Consumes any `LevelSource` — mic, simulated, or (later) the native pipeline.
 */
export function LevelMeter({ source, bars = 21 }: { source: LevelSource | null; bars?: number }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!source) {
      setLevel(0);
      return;
    }
    return source.subscribe(setLevel);
  }, [source]);

  const center = (bars - 1) / 2;
  return (
    <View className="flex-row items-center gap-[3px]" accessibilityLabel="input level">
      {Array.from({ length: bars }, (_, i) => {
        const threshold = Math.abs(i - center) / (center + 1);
        const lit = level > threshold;
        return (
          <View
            key={i}
            className={`h-[14px] w-[2px] rounded-full ${lit ? 'bg-primary' : 'bg-line'}`}
          />
        );
      })}
    </View>
  );
}
