import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MAP_FOCUS_LON_SPAN,
  activeCluster,
  clusterBlocks,
  detectionsByArea,
  district,
  watchAreas,
  type SurveyBlock,
  type Tone,
} from '@/data/district';
import {
  OSM_ATTRIBUTION,
  SETAPAK_RASTER,
  clampOffset,
  fitFocus,
  metresPerPixel,
  projectRect,
  type Bounds,
  type LatLon,
  type Size,
} from '@/lib/geo';

// CITIZEN NEIGHBOURHOOD RISK — specs.md §5 v2 "community view". The citizen's answer to
// "is my area bad right now?", which is a *reassurance and an action*, never a dashboard.
//
// Deliberately NOT `/officer/cluster/[id]`, even though it consumes the same seeded coordinates
// (`src/data/district.ts`) through the same projection (`src/lib/geo.ts`):
//
//   · dark ground, `block` radius, warm ink — the citizen language (design-system.md §Tokens)
//   · the raster is pushed back under a heavy `bg` veil so it reads as a night instrument, not a
//     daylight map, and so the risk copy above it is what the eye lands on first
//   · NO scale bar, NO legend pills, NO block IDs, NO per-detection dots. The officer needs the
//     street a truck drives down; the citizen needs "raised, here, and here is what to do".
//   · COARSE BY CONSTRUCTION: the finest thing this screen can draw is one ~170 m survey block,
//     tinted by how many detections fell inside it. Never a dot on someone's house — which is a
//     privacy stance first and a talking point second, so the screen says it in words too.
//
// No map library, no new dependency (design-system.md §Maps): one PNG and `View`s.
// No motion at all — §Motion bans page-load choreography, so there is nothing to reduce.

const MAP_IMAGE = require('@/assets/maps/setapak-osm.png');

/** The citizen's own neighbourhood. One seeded home area; the rest of the district is not theirs. */
const HOME_AREA_ID = 'taman-melati';

/** Breathing room between the neighbourhood outline and the panel edge, top and bottom. */
const MAP_MARGIN = 32;
/** How far back the daylight raster is pushed. High on purpose: this is a night surface. */
const MAP_VEIL = 0.78;

/**
 * Semantic tone → the word a citizen actually wants (design-system.md: "one number, one verdict,
 * one action"). Read off the seeded `tone`, never off an invented count threshold.
 *
 * `alert` does NOT become aedes-red here: red is reserved for a positive Aedes *verdict* on this
 * user's own capture (design-system.md rule 5). A neighbourhood risk band is not a verdict, so an
 * elevated area wears `caution` and a clear one wears `ok`. The word carries the level; the colour
 * carries only elevated-vs-clear.
 */
const RISK: Record<Tone, { word: string; text: string; dot: string }> = {
  alert: { word: 'Raised', text: 'text-caution', dot: 'bg-caution' },
  caution: { word: 'Watch', text: 'text-caution', dot: 'bg-caution' },
  neutral: { word: 'Low', text: 'text-ok', dot: 'bg-ok' },
};

/**
 * The prevention set. Standard dengue source-reduction advice — nothing here is a figure, so
 * nothing here needs specs §9. The cadence tag is the instruction's other half (do it now vs do it
 * weekly), not an icon: design-system.md bans decoration standing in for information.
 */
const PREVENTION: { action: string; when: string; why?: string }[] = [
  { action: 'Empty pot trays, pails and buckets.', when: 'now' },
  { action: 'Cover the water tanks and drums you cannot empty.', when: 'now' },
  { action: 'Check gutters and roof drains once a week.', when: 'weekly' },
  {
    action: 'Use repellent in the morning and late afternoon.',
    when: 'daylight',
    // specs.md §2: Aedes aegypti bites in daylight. That is why this line is not "at night".
    why: 'Aedes aegypti bites in daylight, not at dusk.',
  },
];

/** Does a coordinate fall inside a survey block? Corners are NW/SE, so lat descends. */
function inBlock(p: LatLon, b: SurveyBlock): boolean {
  return p.lat <= b.nw.lat && p.lat >= b.se.lat && p.lon >= b.nw.lon && p.lon <= b.se.lon;
}

/** Bounding box of a set of blocks — the neighbourhood outline. */
function unionBounds(blocks: readonly SurveyBlock[]): Bounds {
  return {
    north: Math.max(...blocks.map((b) => b.nw.lat)),
    south: Math.min(...blocks.map((b) => b.se.lat)),
    west: Math.min(...blocks.map((b) => b.nw.lon)),
    east: Math.max(...blocks.map((b) => b.se.lon)),
  };
}

/**
 * A block's real width on the ground, metres — the number the privacy line is allowed to claim.
 * Derived from the projection's own resolution, never typed in, and rounded DOWN to 10 m so the
 * sentence understates rather than overstates how coarse the rounding is.
 */
const BLOCK_M =
  Math.floor(
    (projectRect(clusterBlocks[0].nw, clusterBlocks[0].se, SETAPAK_RASTER).width *
      metresPerPixel(SETAPAK_RASTER)) /
      10,
  ) * 10;

function backToCapture() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function Area() {
  const [map, setMap] = useState<Size | null>(null);

  const area = watchAreas.find((w) => w.id === HOME_AREA_ID) ?? watchAreas[0];
  const detections = detectionsByArea[area.id] ?? [];
  const risk = RISK[area.tone];

  // Coarse density: every detection is collapsed into the block that contains it, and the block is
  // the only thing that ever gets drawn. This is where the privacy claim is actually enforced —
  // the individual coordinates never reach a style.
  const counts = clusterBlocks.map((b) => detections.filter((d) => inBlock(d, b)).length);
  const peak = Math.max(1, ...counts);

  const outline = unionBounds(clusterBlocks);
  const centre: LatLon = {
    lat: (outline.north + outline.south) / 2,
    lon: (outline.west + outline.east) / 2,
  };
  const width = map?.width ?? 0;
  const focus: Bounds = {
    north: centre.lat,
    south: centre.lat,
    west: centre.lon - MAP_FOCUS_LON_SPAN / 2,
    east: centre.lon + MAP_FOCUS_LON_SPAN / 2,
  };
  // The map panel's HEIGHT is derived, not fixed. `fitFocus` scales by width alone, so a fixed
  // 236 px window framed the neighbourhood at 390 and sliced its top and bottom off at 430 — two
  // stray blue verticals running out of frame, which reads as a broken box rather than a boundary.
  // Measuring the outline at this width and adding a margin makes the framing identical at both.
  const outlinePx = projectRect(
    { lat: outline.north, lon: outline.west },
    { lat: outline.south, lon: outline.east },
    fitFocus(focus, { width, height: 0 }).size,
  ).height;
  const viewport: Size = { width, height: Math.round(outlinePx) + 2 * MAP_MARGIN };
  const fit = fitFocus(focus, viewport);
  const offset = clampOffset(fit.offset, fit.size, viewport);
  const box = (nw: LatLon, se: LatLon) => {
    const r = projectRect(nw, se, fit.size);
    return {
      left: r.left + offset.x,
      top: r.top + offset.y,
      width: r.width,
      height: r.height,
    };
  };
  const ready = !!map && map.width > 0;
  const home = box(
    { lat: outline.north, lon: outline.west },
    { lat: outline.south, lon: outline.east },
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* header — same grammar as the rest of the citizen surface: one back affordance, one title,
          and the honesty marker sitting next to the title rather than hidden at the foot */}
      <View className="flex-row items-center px-5 pt-4">
        <Pressable
          onPress={backToCapture}
          accessibilityRole="button"
          accessibilityLabel="Back to capture"
          className="-ml-2 h-11 w-11 items-center justify-center active:opacity-70"
        >
          {/* 24, not the officer chevron's 22: design-system.md §Type reserves 10/11/22 for the
              officer surface, and a citizen screen borrowing an officer step is exactly the
              "invented scale" defect that file calls out. */}
          <Text className="font-plex-medium text-[24px] text-primary">‹</Text>
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-plex-semibold text-[17px] text-ink">Your area</Text>
          {district.simulated ? (
            <View className="rounded-pill bg-surface px-2 py-[2px]">
              <Text className="font-mono text-[12px] text-muted">simulated</Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        {/* ── the answer ──────────────────────────────────────────────────────────
            One level, in words, with the arithmetic underneath it in mono. A citizen is never
            shown a score; the number is evidence for the word, not the readout itself. */}
        <View className="mt-4 rounded-block bg-surface px-5 py-5">
          <View className="flex-row items-center gap-2">
            <View className={`h-2 w-2 rounded-full ${risk.dot}`} />
            <Text className="font-plex-medium text-[15px] text-muted">{area.name}</Text>
          </View>
          <Text className={`mt-2 font-plex-bold text-[30px] leading-9 ${risk.text}`}>
            {risk.word}
          </Text>
          <Text className="mt-2 font-plex text-[16px] leading-6 text-ink">
            Aedes was confirmed in your neighbourhood in the last {activeCluster.windowHours} hours,
            by people who identified the mosquito that found them.
          </Text>
          <Text className="mt-3 font-mono text-[13px] text-muted">
            {area.count} detections · {activeCluster.windowHours} h · +{activeCluster.rainMm} mm
            rain
          </Text>
        </View>

        {/* ── where, coarsely ─────────────────────────────────────────────────────
            The basemap under a heavy veil, the neighbourhood outlined, and blocks shaded by how
            many detections landed in them. Nothing finer than a block is ever drawn. */}
        <View className="mt-3 overflow-hidden rounded-block bg-surface">
          <View
            className="overflow-hidden bg-bg"
            style={{ height: viewport.height }}
            onLayout={(e) =>
              setMap({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
              })
            }
          >
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
                {/* night veil — the one translucent layer that is not data. OSM ships a daylight
                    palette; at full strength it fights every warm token on this screen. */}
                <View
                  className="bg-bg"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    opacity: MAP_VEIL,
                    pointerEvents: 'none',
                  }}
                />

                {/* the user's neighbourhood, as one soft outline — the citizen equivalent of the
                    officer's ring, with none of its urgency */}
                <View
                  className="border border-primary"
                  style={{
                    position: 'absolute',
                    left: home.left - 10,
                    top: home.top - 10,
                    width: home.width + 20,
                    height: home.height + 20,
                    borderRadius: 20,
                    opacity: 0.55,
                    pointerEvents: 'none',
                  }}
                />

                {/* coarse density. Soft filled patches at `chip` radius, no borders and no labels:
                    a survey grid drawn crisply is an officer artefact, and a citizen reading a
                    grid starts counting cells instead of reading a level. */}
                {clusterBlocks.map((b, i) =>
                  counts[i] === 0 ? null : (
                    <View
                      key={b.id}
                      className="rounded-chip bg-caution"
                      /* Deliberately quiet: the first pass ran 0.18→0.60 and the blocks painted as
                         three solid amber slabs that read as burning parcels — a citizen screen
                         shouting at the one person who cannot dispatch a truck. The level is the
                         WORD above the map; the shading only says roughly where. */
                      style={{
                        position: 'absolute',
                        ...box(b.nw, b.se),
                        opacity: 0.12 + 0.22 * (counts[i] / peak),
                        pointerEvents: 'none',
                      }}
                    />
                  ),
                )}
              </>
            ) : null}
          </View>

          {/* what the shading means, and the attribution the raster's licence requires */}
          {/* Stacked, not a justify-between row: at 390 px both strings wrap mid-phrase and the
              licence line breaks across two ragged columns. Two short lines always fit. */}
          <View className="px-5 py-3">
            <Text className="font-mono text-[12px] text-muted">
              shaded by block · {activeCluster.windowHours} h
            </Text>
            <Text className="mt-1 font-mono text-[12px] text-muted">{OSM_ATTRIBUTION}</Text>
          </View>
        </View>

        {/* ── the privacy stance, stated rather than implied ───────────────────────
            On the trust tint, the same block the capture screen uses for "nothing is kept". */}
        <View className="mt-3 rounded-block bg-tint-trust px-5 py-4">
          <Text className="font-plex text-[16px] leading-6 text-ink">
            Detections are rounded to a block of about {BLOCK_M} m before anyone sees them — never
            to a street or a home.
          </Text>
          <Text className="mt-2 font-mono text-[12px] text-tint-trust-ink">
            block level · no address, no dot on a house
          </Text>
        </View>

        {/* ── the action ──────────────────────────────────────────────────────────
            The whole point of the screen. Concrete, cadence-tagged, no lecture. */}
        <Text className="mb-3 mt-6 font-plex-semibold text-[20px] text-ink">
          What actually helps
        </Text>
        <View className="rounded-block bg-surface px-5">
          {PREVENTION.map((p, i) => (
            <View
              key={p.action}
              className={`flex-row items-start justify-between gap-4 py-4 ${i === 0 ? '' : 'border-t border-line'}`}
            >
              <View className="shrink">
                <Text className="font-plex text-[16px] leading-6 text-ink">{p.action}</Text>
                {p.why ? (
                  <Text className="mt-1 font-plex text-[13px] leading-5 text-muted">{p.why}</Text>
                ) : null}
              </View>
              <Text className="mt-[3px] font-mono text-[13px] text-muted">{p.when}</Text>
            </View>
          ))}
        </View>

        {/* back to the one thing a citizen can do with the phone in their hand */}
        <Pressable
          onPress={backToCapture}
          accessibilityRole="button"
          className="mt-6 min-h-[52px] items-center justify-center rounded-block bg-surface-raised px-5 active:opacity-70"
        >
          <Text className="font-plex-medium text-[15px] text-primary">
            Identify the mosquito that found you
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
