import { Image } from 'expo-image';
import { View } from 'react-native';

import type { Point, Size } from '@/lib/geo';

/**
 * THE MAP GROUND, RASTER — one bundled OSM PNG drawn at the geometry `fitFocus` + `clampOffset`
 * computed. This is what `Basemap` resolves to on native, and what `Basemap.web.tsx` falls back to
 * in the browser until (or unless) its vector tiles paint.
 *
 * It lives in its OWN file rather than inside `Basemap.tsx` for a mechanical reason, learned the
 * slow way: Metro resolves `./Basemap` from inside `Basemap.web.tsx` back to `Basemap.web.tsx`, so
 * a web build importing its native sibling by name imports *itself* — an infinite require cycle
 * that renders nothing and hangs the page with no error. A third file is the only way for both
 * platform variants to share one implementation.
 *
 * This component owns ONLY the ground. Every dot, pill, ring and label stays in the screen, placed
 * by `src/lib/geo.ts` — which is what lets the two platforms disagree about how the streets are
 * painted while agreeing exactly about where the data sits.
 */
export type BasemapProps = {
  /** The raster's rendered size, from `fitFocus`. */
  size: Size;
  /** Its top-left corner within the viewport, from `clampOffset`. Normally negative. */
  offset: Point;
  /** The visible window. Web needs it to derive the map's centre; the raster ignores it. */
  viewport: Size;
  /**
   * How far back the ground is pushed, 0–1. OSM ships a daylight palette that fights every warm
   * citizen token at full strength; the officer surface needs far less. The one translucent layer
   * on any map screen that is not itself data.
   */
  veil?: number;
  /** Which token the veil is painted in — `bg` on citizen screens, `o-bg` on officer ones. */
  veilClass?: string;
  /** Vector style hint, honoured on web only. The raster has one palette and no choice. */
  theme?: 'dark' | 'light';
  accessibilityLabel?: string;
};

/**
 * What this ground must credit. The bundled raster is OSM tiles and nothing else; `Basemap.web.tsx`
 * exports a longer string, because CARTO's vector styles carry their own credit on top. Screens
 * import this from `@/components/Basemap`, so each platform renders the licence it actually owes.
 */
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors';

const MAP_IMAGE = require('@/assets/maps/setapak-osm.png');

export function BasemapRaster({
  size,
  offset,
  veil = 0,
  veilClass = 'bg-bg',
  accessibilityLabel,
}: BasemapProps) {
  return (
    <>
      <Image
        source={MAP_IMAGE}
        contentFit="fill"
        accessibilityLabel={accessibilityLabel}
        style={{
          position: 'absolute',
          left: offset.x,
          top: offset.y,
          width: size.width,
          height: size.height,
        }}
      />
      {veil > 0 ? (
        <View
          pointerEvents="none"
          className={veilClass}
          style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: veil }}
        />
      ) : null}
    </>
  );
}
