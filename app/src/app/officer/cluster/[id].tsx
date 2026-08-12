import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CLUSTER_RING_RADIUS_M,
  FOG_BY_STAMP,
  MAP_FOCUS_LON_SPAN,
  activeCluster,
  clusterBlocks,
  detectionsByArea,
  district,
  landmarks,
  watchAreas,
  type Detection,
  type Recency,
  type SurveyBlock,
  type Tone,
} from '@/data/district';
import {
  OSM_ATTRIBUTION,
  clampOffset,
  fitFocus,
  metresPerPixel,
  project,
  projectRect,
  type Bounds,
  type LatLon,
  type Point,
  type Size,
} from '@/lib/geo';

// Officer CLUSTER DETAIL — the screen behind a watch row (gated direction officer-d), except the
// basemap is no longer hand-drawn: it is the real bundled OSM raster of Setapak, and every block,
// dot, ring and label is placed by projecting its lat/lon through `src/lib/geo.ts`. The projection
// is red-tested in `src/lib/geo.check.ts` — if it drifts, that file fails, not this screen.
//
// No map library (design-system.md §Maps: native module → EAS rebuild, tiles need network, and
// specs §7's uncuttable shot is in airplane mode). `expo-image` draws one PNG; the rest is Views.
//
// officer-d's flaw fixed: its lower third was empty hand-drawn parcels. Here the map is anchored on
// the block grid's own centre and continues under the sheet, so every pixel of it is real streets.
//
// Floating labels are deliberately OPAQUE `o-bg` pills, never translucent — a glass pill over a
// photographic raster has an unpredictable ground, and design-system.md bans glassmorphism anyway.

const MAP_IMAGE = require('@/assets/maps/setapak-osm.png');

const SHEET_H_FALLBACK = 232;
const PILL_GUTTER = 12;
const SCALE_BAR_M = 200;
const DOT_D: Record<Recency, number> = { 0: 14, 1: 11, 2: 9 };
/** Recency → officer token. Newest is the alert colour; older bands recede. */
const DOT_BG: Record<Recency, string> = { 0: 'bg-o-alert', 1: 'bg-o-caution', 2: 'bg-o-muted' };
/**
 * Semantic tone → officer token. Literal so the Tailwind scanner sees every class, and the reason
 * this exists at all: aedes-red is reserved for officer ALERT states (design-system.md, rule 5), so
 * a silent watch area may never wear the red pill just because it is the screen's subject.
 */
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
const LEGEND: { band: Recency; label: string }[] = [
  { band: 0, label: '< 24 h' },
  { band: 1, label: '48 h' },
  { band: 2, label: '72 h' },
];

/** Mid-point of a set of blocks, in the two axes the projection treats independently. */
function blocksCentre(blocks: readonly SurveyBlock[]): LatLon {
  const lons = blocks.flatMap((b) => [b.nw.lon, b.se.lon]);
  const lats = blocks.flatMap((b) => [b.nw.lat, b.se.lat]);
  return {
    lat: (Math.max(...lats) + Math.min(...lats)) / 2,
    lon: (Math.max(...lons) + Math.min(...lons)) / 2,
  };
}

/**
 * A label anchored to a projected point. It measures itself so it can be centred on the point and
 * clamped inside the viewport — a pill that overflows the frame is a label pointing at nothing.
 */
function FloatLabel({
  at,
  viewportWidth,
  below = false,
  className,
  children,
}: {
  at: Point;
  viewportWidth: number;
  below?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const [size, setSize] = useState<Size | null>(null);
  const left = size
    ? Math.min(Math.max(PILL_GUTTER, at.x - size.width / 2), viewportWidth - size.width - PILL_GUTTER)
    : at.x;
  const top = size ? (below ? at.y + 12 : at.y - size.height - 12) : at.y;
  return (
    <View
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      className={className}
      style={{ position: 'absolute', left, top, opacity: size ? 1 : 0 }}>
      {children}
    </View>
  );
}

export default function ClusterDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [map, setMap] = useState<Size | null>(null);
  const [sheetH, setSheetH] = useState(SHEET_H_FALLBACK);

  const area = watchAreas.find((w) => w.id === id) ?? watchAreas[0];
  const hasCluster = activeCluster.id === area.id;
  const blocks: readonly SurveyBlock[] = hasCluster ? clusterBlocks : [];
  const detections: readonly Detection[] = detectionsByArea[area.id] ?? [];
  const bands = LEGEND.map((l) => detections.filter((d) => d.ageBand === l.band).length);

  // ── the view: centred on the block grid (or the area centroid when there is no cluster), zoomed
  // so `MAP_FOCUS_LON_SPAN` fills the width. The sheet overlaps the map, so the map is fitted to
  // the band the sheet leaves VISIBLE — that is what keeps the cluster optically centred.
  const centre = blocks.length ? blocksCentre(blocks) : area.center;
  const visible: Size = { width: map?.width ?? 0, height: Math.max(1, (map?.height ?? 0) - sheetH) };
  const focus: Bounds = {
    north: centre.lat,
    south: centre.lat,
    west: centre.lon - MAP_FOCUS_LON_SPAN / 2,
    east: centre.lon + MAP_FOCUS_LON_SPAN / 2,
  };
  const fit = fitFocus(focus, visible);
  const offset = clampOffset(fit.offset, fit.size, visible);
  /** lat/lon → coordinates inside the map container. */
  const at = (p: LatLon): Point => {
    const q = project(p, fit.size);
    return { x: q.x + offset.x, y: q.y + offset.y };
  };
  const box = (nw: LatLon, se: LatLon) => {
    const r = projectRect(nw, se, fit.size);
    return { left: r.left + offset.x, top: r.top + offset.y, width: r.width, height: r.height };
  };
  const mpp = metresPerPixel(fit.size);
  const ringR = CLUSTER_RING_RADIUS_M / mpp;
  const hot = blocks.filter((b) => b.hot);
  const ringC = hot.length ? at(blocksCentre(hot)) : at(area.center);
  // The cluster label rides the hot set's northern edge, not the ring's — the ring is 410 m across
  // and a pill floating above its apex detaches from the blocks it is naming.
  const hotTop = hot.length
    ? at({ lat: Math.max(...hot.map((b) => b.nw.lat)), lon: blocksCentre(hot).lon })
    : { x: ringC.x, y: ringC.y };
  const barW = SCALE_BAR_M / mpp;
  const ready = !!map && map.width > 0;

  return (
    <SafeAreaView className="flex-1 bg-o-bg" edges={['top']}>
      {/* ── header ─────────────────────────────────────────────────────────────
          Same grammar as the officer home: name left, mono stamp right, one hairline. */}
      <View className="flex-row items-center border-b border-o-line pl-1 pr-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to district"
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}>
          <Text className="font-plex-medium text-[22px] text-o-primary">‹</Text>
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-plex-semibold text-[17px] text-o-ink">{area.name}</Text>
          {district.simulated ? (
            <View className="rounded-pill bg-o-surface px-2 py-[2px]">
              <Text className="font-mono text-[10px] text-o-muted">simulated</Text>
            </View>
          ) : null}
        </View>
        <Text className="font-mono text-[11px] text-o-muted">{district.stamp}</Text>
      </View>

      {/* ── the map ─────────────────────────────────────────────────────────── */}
      <View
        className="flex-1 overflow-hidden bg-o-surface"
        onLayout={(e) =>
          setMap({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
        }>
        {ready ? (
          <>
            <Image
              source={MAP_IMAGE}
              contentFit="fill"
              accessibilityLabel={`OpenStreetMap basemap of ${district.name}`}
              style={{
                position: 'absolute',
                left: offset.x,
                top: offset.y,
                width: fit.size.width,
                height: fit.size.height,
              }}
            />
            {/* Basemap scrim. OSM paints its own semantics — pink military parcels, green reserves,
                yellow trunk roads — and at full saturation they fight the alert-red data layer for
                the same attention. A flat `o-bg` veil pushes the whole raster back one plane so the
                dots and the ring read first, while the street geometry an officer needs stays
                legible. The only translucent layer on the screen that is not itself data. */}
            <View
              pointerEvents="none"
              className="bg-o-bg"
              style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.25 }}
            />

            {/* Cluster ring — the one thing the eye lands on. STRICTLY hollow: officer-d's 5% wash
                was harmless over a flat hand-drawn ground, but stacked on the hot blocks' own tint
                over a real raster it summed to ~19% red and turned the whole neighbourhood salmon,
                which erased the streets the ring exists to point at. */}
            {blocks.length ? (
              <View
                pointerEvents="none"
                className="border-2 border-o-alert"
                style={{
                  position: 'absolute',
                  left: ringC.x - ringR,
                  top: ringC.y - ringR,
                  width: ringR * 2,
                  height: ringR * 2,
                  borderRadius: ringR,
                }}
              />
            ) : null}

            {/* survey blocks. Hot ones take a tinted fill on a separate layer so the label above it
                keeps full contrast; quiet ones are outline-only, because a white fill would hide the
                very streets the truck has to drive down. */}
            {blocks.map((b) => {
              const r = box(b.nw, b.se);
              return (
                <View
                  key={b.id}
                  pointerEvents="none"
                  /* Quiet blocks outline in `o-muted`, not the officer hairline `o-line`: over a
                     photographic raster that value is invisible, and an invisible survey boundary is
                     not a hairline, it is a missing one. Hairline rules elsewhere stay `o-line`. */
                  className={`items-start justify-end p-[3px] ${b.hot ? 'border border-o-alert' : 'border border-o-muted'}`}
                  style={{ position: 'absolute', ...r, borderRadius: 3 }}>
                  {b.hot ? (
                    <View
                      className="bg-o-alert"
                      style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.12 }}
                    />
                  ) : null}
                  <View className="rounded-[3px] bg-o-bg px-1">
                    <Text className={`font-mono text-[10px] ${b.hot ? 'text-o-alert' : 'text-o-muted'}`}>
                      {b.id}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* detections — size AND colour carry recency, so the newest reads first at arm's length */}
            {detections.map((d) => {
              const p = at(d);
              const s = DOT_D[d.ageBand];
              return (
                <View
                  key={d.id}
                  pointerEvents="none"
                  className={`border-2 border-o-bg ${DOT_BG[d.ageBand]}`}
                  style={{
                    position: 'absolute',
                    left: p.x - s / 2,
                    top: p.y - s / 2,
                    width: s,
                    height: s,
                    borderRadius: 999,
                  }}
                />
              );
            })}

            {/* orientation labels, at their true projected positions */}
            {landmarks.map((l) => {
              const p = at(l);
              if (p.y < 34 || p.y > visible.height - 34) return null;
              return (
                <FloatLabel
                  key={l.id}
                  at={p}
                  viewportWidth={visible.width}
                  className="rounded-pill border border-o-line bg-o-bg px-2.5 py-1">
                  <Text className="font-plex-medium text-[11px] text-o-muted">{l.name}</Text>
                </FloatLabel>
              );
            })}

            {/* the cluster itself — the only red label on the map */}
            <FloatLabel
              at={hotTop}
              viewportWidth={visible.width}
              className={`flex-row items-center gap-2 rounded-pill px-2.5 py-1 ${TONE_BG[area.tone]}`}>
              <Text className="font-plex-semibold text-[11px] text-o-bg">{area.name}</Text>
              <Text className="font-mono-medium text-[11px] text-o-bg">{area.count}</Text>
            </FloatLabel>

            {/* legend — the counts are the same 14, split by band, so it is data and not a key */}
            <View
              className="flex-row items-center gap-3 rounded-pill border border-o-line bg-o-bg px-2.5 py-1.5"
              style={{ position: 'absolute', left: PILL_GUTTER, top: PILL_GUTTER }}>
              {LEGEND.map((l, i) => (
                <View key={l.label} className="flex-row items-center gap-1.5">
                  <View
                    className={DOT_BG[l.band]}
                    style={{ width: 8, height: 8, borderRadius: 999 }}
                  />
                  <Text className="font-mono text-[10px] text-o-muted">{l.label}</Text>
                  <Text className="font-mono-medium text-[10px] text-o-ink">{bands[i]}</Text>
                </View>
              ))}
            </View>

            {/* rainfall over the same window — specs §9's sanctioned +40 mm, as a filled shape */}
            {hasCluster ? (
              <View
                className="rounded-pill border border-o-line bg-o-bg px-2.5 py-1.5"
                style={{ position: 'absolute', right: PILL_GUTTER, top: PILL_GUTTER }}>
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
                    Rain
                  </Text>
                  <Text className="font-mono-medium text-[11px] text-o-primary">
                    +{activeCluster.rainMm} mm
                  </Text>
                </View>
                <View className="mt-1 flex-row items-end gap-[3px]">
                  {[6, 9, 14, 20, 26, 22].map((h, i) => (
                    <View
                      key={i}
                      className="bg-o-primary-wash"
                      style={{ width: 6, height: h, borderRadius: 1 }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* scale bar + attribution. The bar length is derived from the projection's own ground
                resolution, so it cannot disagree with the dots. Attribution is a licence
                obligation on every surface that renders this raster — quiet, but always. */}
            <View
              className="flex-row items-center gap-2.5 rounded-pill border border-o-line bg-o-bg px-2.5 py-1"
              style={{ position: 'absolute', left: PILL_GUTTER, top: visible.height - 40 }}>
              <View className="items-center">
                <Text className="font-mono text-[10px] text-o-muted">{SCALE_BAR_M} m</Text>
                <View className="mt-[2px] flex-row items-end" style={{ width: barW }}>
                  <View className="h-[5px] w-[1px] bg-o-muted" />
                  <View className="h-[1px] flex-1 bg-o-muted" />
                  <View className="h-[5px] w-[1px] bg-o-muted" />
                </View>
              </View>
              <View className="h-4 w-[1px] bg-o-line" />
              <Text className="font-mono text-[10px] text-o-muted">{OSM_ATTRIBUTION}</Text>
            </View>
          </>
        ) : null}

        {/* ── the directive sheet, riding over the map ────────────────────────── */}
        <View
          onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
          className="rounded-t-card border-t border-o-line bg-o-bg px-5 pb-5 pt-4"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <View className="flex-row items-baseline justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className={TONE_BG[area.tone]}
                style={{ width: 8, height: 8, borderRadius: 999 }}
              />
              <Text className="font-plex-semibold text-[17px] text-o-ink">{area.name}</Text>
              {hasCluster ? (
                <Text className="font-mono text-[11px] text-o-muted">{activeCluster.blocks}</Text>
              ) : null}
            </View>
            <Text
              className={`font-mono-medium text-[13px] ${TONE_TEXT[area.tone]}`}>
              {area.count} / {activeCluster.windowHours} h
            </Text>
          </View>

          {/* block-level targeting as a shape: which streets the truck actually enters */}
          {blocks.length ? (
            <View className="mt-3 flex-row gap-1">
              {blocks.map((b) => (
                <View
                  key={b.id}
                  className={`h-11 flex-1 items-center justify-center rounded-card ${b.hot ? 'bg-o-alert' : 'bg-o-surface'}`}>
                  <Text className={`font-mono text-[11px] ${b.hot ? 'text-o-bg' : 'text-o-muted'}`}>
                    {b.id}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {hasCluster ? (
            <>
              <View className="mt-4 flex-row items-baseline justify-between">
                <Text className="font-plex-semibold text-[20px] text-o-ink">Fog within 48 h</Text>
                <Text className="font-mono text-[12px] text-o-muted">{FOG_BY_STAMP}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: acknowledged }}
                onPress={() => setAcknowledged(true)}
                className={`mt-3 min-h-[48px] items-center justify-center rounded-card ${acknowledged ? 'border border-o-line bg-o-surface' : 'bg-o-primary'}`}
                style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
                <Text
                  className={`font-plex-semibold text-[15px] ${acknowledged ? 'text-o-muted' : 'text-o-bg'}`}>
                  {acknowledged ? 'Acknowledged' : 'Acknowledge'}
                </Text>
              </Pressable>
            </>
          ) : (
            <View className="mt-4">
              <Text className="font-plex-medium text-[15px] text-o-ink">No cluster · monitoring</Text>
              <Text className="mt-1 font-mono text-[11px] text-o-muted">
                {area.count === 0 ? `silent ${area.delta}` : `${area.delta} on the day`} · no fogging
                directive
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
