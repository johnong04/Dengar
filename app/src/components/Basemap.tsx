import { useState } from 'react';
import { View } from 'react-native';

import { BasemapRaster, type BasemapProps } from './BasemapRaster';
import { mapZoom, viewCentre } from '@/lib/geo';

/**
 * THE MAP GROUND — native. Live vector tiles via `@maplibre/maplibre-react-native`, centred and
 * zoomed to the exact ground `fitFocus` + `clampOffset` asked for, so every projected overlay above
 * it lands where it already landed on the raster. Same arithmetic as the browser
 * (`src/lib/geo.ts` §"the bridge to a real vector basemap", proven by `geo.check.ts` §10), same
 * CARTO style, so the phone and the laptop render the same map.
 *
 * Replaces (2026-09-20) a bare re-export of the bundled 512×768 z15 PNG. Blown up to fill a
 * phone-width panel that raster is soft and its street names unreadable, and the veil painted over
 * it to calm OSM's daylight palette washed it out further — the defect this file exists to fix.
 *
 * ── Three deliberate calls, two of them inherited from the web twin ────────────────────────────
 *
 * 1. THE RASTER STAYS, UNDERNEATH, until the vector ground has actually painted. Tiles come off the
 *    network; a phone handed to a judge on a bad connection must degrade to the ground we already
 *    ship rather than to a hole. `onDidFinishRenderingMapFully` is the handoff — the native
 *    equivalent of the browser's `idle`, and chosen for the same reason: the earlier events fire
 *    once the STYLE has parsed, before a single tile has arrived, and fire identically when the
 *    tiles never arrive at all.
 *
 * 2. NO INTERACTION — `dragPan`, `touchZoom`, `touchRotate`, `touchPitch` all off. Every dot, pill
 *    and label above this map is absolutely positioned from OUR projection, so a user-panned map
 *    would slide the streets out from under their own data. The map is a rendered ground, not a
 *    control.
 *
 *    **This is the constraint to lift next, and lifting it is what makes the map feel alive.** The
 *    route is not to flip these props: it is to move the overlays INTO the map as GeoJSON sources
 *    (`ShapeSource` + `CircleLayer`/`SymbolLayer`, clustering and heatmaps come free), one overlay
 *    at a time. Once nothing above the map is pixel-positioned any more, interaction can be turned
 *    on and the data pans and zooms with the ground. Flipping the props first just breaks the
 *    alignment silently.
 *
 * 3. NO ORNAMENTS. MapLibre's own logo, attribution button, compass and scale bar are off; the
 *    screens already render the licence line next to the OSM credit they carry, and a second
 *    floating attribution button is chrome competing with data.
 *
 * Keyless by design: CARTO's dark-matter / positron styles need no token and no billing — which is
 * why `react-native-maps` sits installed and inert beside this. Google Maps needs a billing account
 * attached before any key works at all.
 */

/** Keyless, no-billing vector styles. Both OSM-derived — hence the CARTO credit below. */
const STYLE = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
} as const;

/**
 * What this ground must credit. Identical to the web twin's, and deliberately NOT the raster's
 * shorter string: once CARTO's tiles are what actually painted, their terms require their credit
 * alongside OSM's. The string is a property of which ground painted, not of the projection — which
 * is why it is exported from the platform-split module rather than from `geo.ts`.
 */
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors · © CARTO';

export type { BasemapProps } from './BasemapRaster';

export function Basemap(props: BasemapProps) {
  const { size, offset, viewport, veil = 0, veilClass = 'bg-bg', theme = 'dark' } = props;
  const [painted, setPainted] = useState(false);

  const centre = viewCentre(size, offset, viewport);
  const zoom = mapZoom(size);

  // Required lazily so the module is never evaluated on web, where `Basemap.web.tsx` is the
  // implementation and this file is not reached at all.
  // v11 renamed the map component from `MapView` to `Map`, aligning with MapLibre GL JS. Aliased
  // to MapLibreMap because `Map` alone shadows the JS global. Destructuring the old name yielded
  // `undefined`, and React then read `.displayName` off it — the render crash seen on device.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Map: MapLibreMap, Camera } = require('@maplibre/maplibre-react-native');

  // `require` is untyped, so tsc cannot catch a renamed export — only the device can, and it
  // catches it as a render crash on the one screen a judge taps first. Degrade to the shipped
  // raster instead: a slightly worse map beats a red error box.
  if (!MapLibreMap || !Camera || !Number.isFinite(zoom)) return <BasemapRaster {...props} />;

  return (
    <>
      {/* The shipped raster, underneath, until the vector ground has actually painted. */}
      {painted ? null : <BasemapRaster {...props} veil={veil} veilClass={veilClass} />}

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      >
        <MapLibreMap
          style={{ flex: 1 }}
          mapStyle={STYLE[theme]}
          // See §2 above: these stay off until the overlays live inside the map.
          dragPan={false}
          touchZoom={false}
          doubleTapZoom={false}
          doubleTapHoldZoom={false}
          touchRotate={false}
          touchPitch={false}
          logo={false}
          attribution={false}
          compass={false}
          scaleBar={false}
          onDidFinishRenderingMapFully={() => setPainted(true)}
        >
          {/* No animation: the overlays above are repositioned synchronously by React, so an
              animated ground would lag behind its own data for the duration of the flight. */}
          <Camera
            center={[centre.lon, centre.lat]}
            zoom={zoom}
            bearing={0}
            pitch={0}
            duration={0}
          />
        </MapLibreMap>
      </View>

      {/* THE VEIL, ALL BUT GONE — same reasoning as the web twin: a dark vector style IS the
          screen's ground, so a veil would only blur a map that is already the right colour, which
          is the defect this change set out to fix. What is left seats the ground behind the data. */}
      {painted && veil > 0 ? (
        <View
          pointerEvents="none"
          className={veilClass}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            opacity: veil * 0.12,
          }}
        />
      ) : null}
    </>
  );
}
