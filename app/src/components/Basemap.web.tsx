import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { BasemapRaster, type BasemapProps } from './BasemapRaster';
import { mapZoom, viewCentre } from '@/lib/geo';

/**
 * THE MAP GROUND — web implementation. Live vector tiles via maplibre-gl, centred and zoomed to
 * show exactly the ground `fitFocus` + `clampOffset` asked for, so every projected overlay above it
 * lands where it already landed on the raster. `src/lib/geo.ts` §"the bridge to a real vector
 * basemap" is the arithmetic; `geo.check.ts` §10 is what proves it.
 *
 * Why this exists at all: the raster is a 512×768 z15 PNG. Blown up to fill a phone-width panel it
 * is a soft, low-zoom image with unreadable street names, and painting a veil over it to calm its
 * daylight palette washes it out further. Vector tiles re-render at the true scale, and the dark
 * style is dark by construction rather than by veil — which is why `veil` drops to near zero here.
 *
 * ── Two deliberate calls ──────────────────────────────────────────────────────────────────────
 *
 * 1. THE RASTER STAYS, UNDERNEATH. These tiles come off the network, and the deliverable is a
 *    screen recording on a deadline. If CARTO is slow, blocked or down, the map must degrade to the
 *    ground we already ship rather than to a hole. The raster is hidden only once maplibre reports
 *    a first paint, so there is no frame in which the panel is empty.
 *
 * 2. NO INTERACTION. `interactive: false` — no drag, no scroll-zoom, no inertia. The overlays are
 *    absolutely positioned from OUR projection, so a user-panned map would slide the streets out
 *    from under its own data. The map is a rendered ground, not a control.
 *
 * Keyless by design: CARTO's dark-matter / positron styles need no token and no billing, which is
 * the whole reason a map library became affordable here at all. Attribution is a licence
 * obligation and is rendered by the screens, next to the OSM line they already carry.
 */

/**
 * The slice of maplibre's stylesheet that actually matters to a non-interactive map. Injected once
 * rather than imported, because a CSS import out of `node_modules` is one more thing Metro has to
 * agree to on a deadline. Everything omitted styles controls, popups and markers — none of which
 * this map has.
 */
const MAPLIBRE_CSS = `
.maplibregl-map{position:relative;overflow:hidden;width:100%;height:100%}
.maplibregl-canvas-container,.maplibregl-canvas{position:absolute;top:0;left:0;width:100%;height:100%}
.maplibregl-canvas-container{touch-action:none}
`;

function ensureMaplibreCss() {
  if (typeof document === 'undefined' || document.getElementById('maplibre-min-css')) return;
  const el = document.createElement('style');
  el.id = 'maplibre-min-css';
  el.textContent = MAPLIBRE_CSS;
  document.head.appendChild(el);
}

/** Keyless, no-billing vector styles. Both are OSM-derived — see `CARTO_ATTRIBUTION`. */
const STYLE = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
} as const;

/**
 * The licence line for the web ground. CARTO's styles are OSM-derived and their terms require their
 * own credit alongside OSM's — so the browser owes both, where the bundled raster owes only OSM.
 * That is the entire reason attribution is exported from the platform-split module instead of from
 * `geo.ts`: the string is a property of which ground actually painted, not of the projection.
 */
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors · © CARTO';

/**
 * maplibre parses every tile in an ES-module Web Worker whose URL it resolves against the DOCUMENT,
 * not against its own bundle. Under Expo Router that resolves to `/node_modules/expo-router/...`,
 * which 404s — and the map then loads, fires `load`, and draws nothing, with no error anywhere.
 *
 * `public/` is served verbatim at the web root by both the dev server and a static export, so the
 * worker and its shared chunk are vendored there. `scripts/check-maplibre-worker.mjs` is what keeps
 * that copy honest across a version bump; it runs in `npm run check`.
 */
const WORKER_URL = '/maplibre/maplibre-gl-worker.mjs';

export function Basemap(props: BasemapProps) {
  const { size, offset, viewport, veil = 0, veilClass = 'bg-bg', theme = 'dark' } = props;
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<import('maplibre-gl').Map | null>(null);
  const [painted, setPainted] = useState(false);

  const centre = viewCentre(size, offset, viewport);
  const zoom = mapZoom(size);

  // Create once per theme. Re-creating on every geometry change would tear the canvas down mid-pan;
  // the geometry effect below just flies the existing map to the new view.
  useEffect(() => {
    if (!host.current) return;
    let cancelled = false;
    let instance: import('maplibre-gl').Map | null = null;
    ensureMaplibreCss();
    // Dynamic import: maplibre-gl is ~800 kB and touches `window` at module scope, so it must never
    // be pulled into the native bundle or evaluated during SSR/prerender.
    // A literal, never a variable: Metro resolves dynamic imports statically and cannot follow one
    // through a constant. Resolution itself needs the `import` condition, added for web in
    // `metro.config.js` — maplibre's exports map offers no other way in.
    import('maplibre-gl')
      .then(({ Map, setWorkerUrl }) => {
        if (cancelled || !host.current) return;
        setWorkerUrl(WORKER_URL);
        instance = new Map({
          container: host.current,
          style: STYLE[theme],
          center: [centre.lon, centre.lat],
          zoom,
          interactive: false,
          attributionControl: false,
          // The overlays are placed by a plain Web-Mercator projection with no tilt and no rotation.
          // Allowing either would silently invalidate every one of them.
          pitch: 0,
          bearing: 0,
          fadeDuration: 0,
        });
        map.current = instance;
        // `idle`, NOT `load`. `load` fires as soon as the STYLE has parsed — before a single tile has
        // been fetched, and it fires just the same when the tiles never arrive at all. Hiding the
        // raster on `load` is precisely how this screen renders as an empty box. `idle` means the
        // map has finished drawing everything it currently has, so there is something to show.
        instance.on('idle', () => {
          if (!cancelled) setPainted(true);
        });
        // A style that 404s or a blocked network must leave the raster showing, not a blank canvas.
        instance.on('error', () => setPainted(false));
      })
      .catch(() => {
        // Resolution or network failure. The raster below is already showing; leave it showing.
        setPainted(false);
      });
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
      setPainted(false);
    };
    // Geometry is applied by the next effect, deliberately not a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Follow the screen's geometry. `jumpTo`, never `flyTo` — the overlays above are repositioned
  // synchronously by React, so an animated ground would lag behind its own data for the duration.
  useEffect(() => {
    const m = map.current;
    if (!m || !Number.isFinite(zoom)) return;
    m.jumpTo({ center: [centre.lon, centre.lat], zoom });
    m.resize();
  }, [centre.lat, centre.lon, zoom, viewport.width, viewport.height]);

  return (
    <>
      {/* The shipped raster, underneath, until the vector ground has actually painted. */}
      {painted ? null : <BasemapRaster {...props} veil={veil} veilClass={veilClass} />}

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      >
        <div ref={host} style={{ position: 'absolute', inset: 0 }} />
      </View>

      {/* Vector tiles arrive already dark (or already light), so the veil that the raster needed is
          a fraction of its former self — enough to seat the ground behind the data layer, not
          enough to wash the street names out again. */}
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
            opacity: Math.min(veil, theme === 'dark' ? 0.35 : 0.12),
          }}
        />
      ) : null}
    </>
  );
}
