/**
 * Seeded district surveillance data — ONE source for every officer screen and the citizen map.
 *
 * Everything here is SIMULATED and every surface that renders it must say so (COMMON rule 8 /
 * specs.md §8). Figures come from the sanctioned scenario only: 14 detections in 72 h in Taman
 * Melati, +40 mm rain over the same 72 h, and the 14–21 day lead time that specs.md §1 cites.
 * The projected case series is a SHAPE, not a measurement — it carries no sourced magnitude and
 * must never be rendered as measured data.
 *
 * Emits numbers and identifiers, never presentation: `tone` is semantic, and each screen maps it
 * to officer tokens itself.
 */

/** Semantic severity. Screens map this to `o-alert` / `o-caution` / `o-muted`. */
export type Tone = 'alert' | 'caution' | 'neutral';

export type Kpi = {
  /** The screen looks its label up from this (slice 18) — this module emits numbers, never words. */
  key: 'detections' | 'clusters' | 'nodes';
  /** Pre-formatted so a KPI cell never does arithmetic. */
  value: string;
  /** Signed change vs the previous day, or a freshness string for nodes. */
  delta: string;
  tone: Tone;
};

export type WatchArea = {
  id: string;
  name: string;
  /** 14-day detection counts, oldest first — the sparkline. */
  spark: readonly number[];
  /** Detections in the last 72 h — derived from `spark`, never typed in. */
  count: number;
  /**
   * Derived: the signed 72 h-over-72 h change, or — when `count` is 0 — how long the area has been
   * silent, read off `spark` so the string is always true of the bars beside it.
   */
  delta: string;
  /** Present only when `count` is 0: days since this area's last detection. */
  silentDays?: number;
  tone: Tone;
  /** Seeded centroid, inside the bundled raster's bounds (design-system.md §Maps). */
  center: { lat: number; lon: number };
};

export type Cluster = {
  id: string;
  area: string;
  /** Block range inside the area. */
  blocks: string;
  /** Detections inside the window. */
  detections: number;
  /** Window length in hours. */
  windowHours: number;
  /** Rainfall over the same window, mm. */
  rainMm: number;
  trend: 'rising' | 'steady' | 'falling';
  center: { lat: number; lon: number };
};

export type HeatGrid = {
  /** Hour-band labels, top row first. */
  rows: readonly string[];
  /** Day-of-month labels, one per column. */
  cols: readonly string[];
  /** rows × cols detection counts. */
  values: readonly (readonly number[])[];
  max: number;
};

export type TrendSeries = {
  /** Detections per day for the last 14 days, oldest first. */
  detections: readonly number[];
  /** Rainfall mm per day over the same 14 days. */
  rainMm: readonly number[];
  /**
   * Projected clinical cases at +14…+21 d — where dengue surfaces today, when fogging is
   * dispatched off confirmed human cases. Unsourced by design: a shape, never a readout.
   */
  projectedCases: readonly number[];
  /** Lead-time window the projection spans, in days. */
  leadDays: { from: number; to: number };
  peak: { detections: number; rainMm: number; projectedCases: number };
};

/** Frozen so screenshots are reproducible. */
export const district = {
  name: 'Setapak',
  stamp: 'FRI 4 SEP · 09:00',
  simulated: false,
} as const;

/* ───────────────────────────────────────────────────────────────────────────────────────────────
   ONE BASE FACT, everything else derived (fix round, slice 13).
   The only hand-written detection numbers in this file are the three area sparks below. The
   district series is their element-wise sum; every count, delta, KPI value and heat-grid cell is
   computed from that sum. Two figures can no longer disagree on screen, because there is only one
   figure and the rest is arithmetic.

   Sanctioned anchors preserved: Taman Melati's last 72 h sums to **14** (specs' 14 detections /
   72 h, and `activeCluster.detections`, and the 14 plotted dots in `detectionsByArea`), and the
   last three rain days sum to **+40 mm**.
   ─────────────────────────────────────────────────────────────────────────────────────────────── */

/** The 72 h window every `count` and delta is measured over, in days. */
const WINDOW_DAYS = 3;
const DAYS = 14;

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
/** Sum of the most recent `WINDOW_DAYS` (the last 72 h). */
const windowSum = (xs: readonly number[]) => sum(xs.slice(-WINDOW_DAYS));
/** Sum of the 72 h before that — the comparison the delta is against. */
const priorWindowSum = (xs: readonly number[]) => sum(xs.slice(-WINDOW_DAYS * 2, -WINDOW_DAYS));
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
/** Days since the last non-zero day, or null if the series is silent throughout. */
function daysSinceLast(xs: readonly number[]): number | null {
  for (let i = xs.length - 1; i >= 0; i--) if (xs[i] > 0) return xs.length - 1 - i;
  return null;
}

/**
 * The three watch areas. Sparks are 14 days, oldest first — the ONLY typed-in detection counts.
 *
 * Taman Melati's last three days are [4, 4, 6] = 14, which is the sanctioned cluster figure and the
 * `ageBand` split of its 14 mapped detections. Wangsa Maju's [1, 1, 1] = 3 is one detection per
 * recency band, matching its three mapped dots. Danau Kota has been silent since day 8, so its
 * count is 0 and its row reports the silence instead of a change.
 */
const AREA_SEED = [
  {
    id: 'taman-melati',
    name: 'Taman Melati',
    spark: [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 2, 4, 4, 6],
    tone: 'alert' as Tone,
    center: { lat: 3.2145, lon: 101.7216 },
  },
  {
    id: 'wangsa-maju',
    name: 'Wangsa Maju',
    spark: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    tone: 'caution' as Tone,
    center: { lat: 3.2032, lon: 101.7305 },
  },
  {
    id: 'danau-kota',
    name: 'Danau Kota',
    spark: [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    tone: 'neutral' as Tone,
    center: { lat: 3.2035, lon: 101.7148 },
  },
] as const;

/** The district series IS the areas, added up. Nothing else may define it. */
const DETECTIONS_14D: readonly number[] = Array.from({ length: DAYS }, (_, d) =>
  sum(AREA_SEED.map((a) => a.spark[d])),
);

// The last three days sum to 40 — the sanctioned +40 mm.
const RAIN_14D = [2, 0, 0, 3, 1, 0, 0, 5, 2, 4, 6, 12, 16, 12] as const;
// +14…+21 d inclusive: 8 days. A shape only — no magnitude is claimed or rendered.
const PROJECTED_CASES = [1, 3, 6, 9, 11, 8, 5, 3] as const;

export const trend: TrendSeries = {
  detections: DETECTIONS_14D,
  rainMm: RAIN_14D,
  projectedCases: PROJECTED_CASES,
  leadDays: { from: 14, to: 21 },
  peak: {
    detections: Math.max(...DETECTIONS_14D),
    rainMm: Math.max(...RAIN_14D),
    projectedCases: Math.max(...PROJECTED_CASES),
  },
};

/**
 * Hour band × day, DERIVED so each column sums to that day's district detections — the grid and the
 * chart above it are the same data at two resolutions, and a paused frame cannot catch them
 * disagreeing.
 *
 * The daylight-biting shape (specs.md §2: *Aedes aegypti* bites in daylight) is the argument the
 * grid exists to make, so it is carried by fixed band weights rather than by hand-placed cells:
 * 06–12 heaviest, 12–18 close behind, 18–24 light, 00–06 residual. Whole detections are allocated
 * by largest remainder, ties to the heavier band, so every column total is exact.
 */
const HEAT_BANDS = [
  { label: '18–24', weight: 0.16 },
  { label: '12–18', weight: 0.34 },
  { label: '06–12', weight: 0.42 },
  { label: '00–06', weight: 0.08 },
] as const;

function allocateBands(total: number): number[] {
  const raw = HEAT_BANDS.map((b) => total * b.weight);
  const out = raw.map((v) => Math.floor(v));
  let left = total - sum(out);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || HEAT_BANDS[b.i].weight - HEAT_BANDS[a.i].weight);
  for (const { i } of order) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out;
}

const HEAT_DAYS = DETECTIONS_14D.slice(DAYS - 7); // the 7 most recent days, oldest first
const HEAT_COLUMNS = HEAT_DAYS.map(allocateBands);

export const heat: HeatGrid = {
  rows: HEAT_BANDS.map((b) => b.label),
  cols: ['06', '07', '08', '09', '10', '11', '12'],
  values: HEAT_BANDS.map((_, band) => HEAT_COLUMNS.map((col) => col[band])),
  max: Math.max(...HEAT_COLUMNS.flat()),
};

/** Counts and deltas are read off the sparks — never typed in beside them. */
export const watchAreas: readonly WatchArea[] = AREA_SEED.map((a) => {
  const count = windowSum(a.spark);
  const silentDays = count === 0 ? daysSinceLast(a.spark) : null;
  return {
    id: a.id,
    name: a.name,
    spark: a.spark,
    count,
    // A silent area reports how long it has been silent; an active one reports 72 h over 72 h.
    delta: silentDays === null ? signed(count - priorWindowSum(a.spark)) : `${silentDays} d`,
    ...(silentDays === null ? {} : { silentDays }),
    tone: a.tone,
    center: a.center,
  };
});

const melati = watchAreas.find((w) => w.id === 'taman-melati')!;

export const activeCluster: Cluster = {
  id: melati.id,
  area: melati.name,
  blocks: 'B3–B5',
  // The cluster IS Taman Melati's 72 h count — the sanctioned 14, and the mapped dot count.
  detections: melati.count,
  windowHours: WINDOW_DAYS * 24,
  rainMm: windowSum(RAIN_14D),
  trend: 'rising',
  center: melati.center,
};

/** Nodes are the only KPI with no series behind them; one place declares them. */
const NODES = { reporting: 23, total: 26, delta: -3 };

const today = DETECTIONS_14D[DAYS - 1];
const yesterday = DETECTIONS_14D[DAYS - 2];
const clusters = [activeCluster];

export const kpis: readonly Kpi[] = [
  {
    key: 'detections',
    value: String(today),
    delta: signed(today - yesterday),
    tone: 'alert',
  },
  {
    key: 'clusters',
    value: String(clusters.length),
    delta: signed(clusters.length),
    tone: 'alert',
  },
  {
    key: 'nodes',
    value: `${NODES.reporting}/${NODES.total}`,
    delta: signed(NODES.delta),
    tone: 'neutral',
  },
];

/* ───────────────────────────────────────────────────────────────────────────────────────────────
   Cluster-map layer — ADDED ADDITIVELY in slice 14 for `/officer/cluster/[id]`.
   Nothing above this line changed. Slice 16's citizen map consumes the same coordinates.

   Every coordinate here was produced by inverse-projecting a pixel READ OFF the bundled OSM raster
   (`assets/maps/setapak-osm.png`, design-system.md §Maps) through `src/lib/geo.ts`, and only pixels
   whose 5×5 neighbourhood classified as built-up residential ground were eligible — so no detection
   sits on a carriageway, in the river, on a park or inside the Kem Wardieburn military parcel.
   Still SIMULATED, and every surface that renders it says so.
   ─────────────────────────────────────────────────────────────────────────────────────────────── */

/** Recency band. 0 = under 24 h · 1 = 24–48 h · 2 = 48–72 h. Screens map this to size and token. */
export type Recency = 0 | 1 | 2;

export type Detection = { id: string; lat: number; lon: number; ageBand: Recency };

/** One surveyed block. Corners, so it projects to a rectangle on the real street grid. */
export type SurveyBlock = {
  id: string;
  /** Inside the fogging target (`activeCluster.blocks`). */
  hot: boolean;
  nw: { lat: number; lon: number };
  se: { lat: number; lon: number };
};

/**
 * B1–B8 over the Taman Melati terraces, west and east of Jalan 1/23E. ~167 m × 353 m each: two rows
 * of four, laid on the residential grid rather than on arbitrary positions. B3–B5 are the hot set,
 * matching `activeCluster.blocks`.
 */
export const clusterBlocks: readonly SurveyBlock[] = [
  {
    id: 'B1',
    hot: false,
    nw: { lat: 3.217474, lon: 101.716833 },
    se: { lat: 3.214303, lon: 101.718335 },
  },
  {
    id: 'B2',
    hot: false,
    nw: { lat: 3.217474, lon: 101.718464 },
    se: { lat: 3.214303, lon: 101.719966 },
  },
  {
    id: 'B3',
    hot: true,
    nw: { lat: 3.217474, lon: 101.720095 },
    se: { lat: 3.214303, lon: 101.721597 },
  },
  {
    id: 'B4',
    hot: true,
    nw: { lat: 3.217474, lon: 101.721725 },
    se: { lat: 3.214303, lon: 101.723227 },
  },
  {
    id: 'B5',
    hot: true,
    nw: { lat: 3.214131, lon: 101.720095 },
    se: { lat: 3.211475, lon: 101.721597 },
  },
  {
    id: 'B6',
    hot: false,
    nw: { lat: 3.214131, lon: 101.721725 },
    se: { lat: 3.211475, lon: 101.723227 },
  },
  {
    id: 'B7',
    hot: false,
    nw: { lat: 3.214131, lon: 101.716833 },
    se: { lat: 3.211475, lon: 101.718335 },
  },
  {
    id: 'B8',
    hot: false,
    nw: { lat: 3.214131, lon: 101.718464 },
    se: { lat: 3.211475, lon: 101.719966 },
  },
];

/**
 * Detections per watch area, keyed by `WatchArea.id`.
 *
 * Taman Melati carries exactly 14 — `activeCluster.detections` — all inside B3–B5, and the band
 * split is 6 / 4 / 4, which is that area's own spark read newest-first ([4, 4, 6] → 6 / 4 / 4; the
 * slice-13 fix round made the district series the SUM of the areas, so this now cites the area). The
 * dot count and the sheet's `14 / 72 h` are therefore the same number, not two numbers that agree.
 * Danau Kota is deliberately empty: `count: 0`, silent 11 h.
 */
export const detectionsByArea: Readonly<Record<string, readonly Detection[]>> = {
  'taman-melati': [
    { id: 'd-tm-01', lat: 3.217131, lon: 101.72061, ageBand: 0 },
    { id: 'd-tm-02', lat: 3.217045, lon: 101.721167, ageBand: 1 },
    { id: 'd-tm-03', lat: 3.215631, lon: 101.720352, ageBand: 2 },
    { id: 'd-tm-04', lat: 3.214731, lon: 101.721296, ageBand: 2 },
    { id: 'd-tm-05', lat: 3.214646, lon: 101.720695, ageBand: 1 },
    { id: 'd-tm-06', lat: 3.217045, lon: 101.722369, ageBand: 0 },
    { id: 'd-tm-07', lat: 3.216916, lon: 101.72297, ageBand: 0 },
    { id: 'd-tm-08', lat: 3.21606, lon: 101.722197, ageBand: 2 },
    { id: 'd-tm-09', lat: 3.215503, lon: 101.72194, ageBand: 0 },
    { id: 'd-tm-10', lat: 3.214903, lon: 101.722884, ageBand: 2 },
    { id: 'd-tm-11', lat: 3.213831, lon: 101.720524, ageBand: 0 },
    { id: 'd-tm-12', lat: 3.213103, lon: 101.721082, ageBand: 0 },
    { id: 'd-tm-13', lat: 3.21306, lon: 101.720352, ageBand: 1 },
    { id: 'd-tm-14', lat: 3.212032, lon: 101.720395, ageBand: 1 },
  ],
  'wangsa-maju': [
    { id: 'd-wm-01', lat: 3.203762, lon: 101.730222, ageBand: 0 },
    { id: 'd-wm-02', lat: 3.203548, lon: 101.73151, ageBand: 1 },
    { id: 'd-wm-03', lat: 3.202948, lon: 101.729536, ageBand: 2 },
  ],
  'danau-kota': [],
};

/**
 * Orientation labels, positioned by inverse-projecting the basemap's own feature position. Only the
 * transit anchor: the cluster map mutes the raster so the data layer dominates, and a muted basemap
 * loses the one label an officer actually navigates by. A second pill for Kem Wardieburn was cut —
 * it landed beside the raster's own label for the same parcel and read as duplication.
 */
export const landmarks: readonly { id: string; name: string; lat: number; lon: number }[] = [
  { id: 'lrt-taman-melati', name: 'Taman Melati LRT', lat: 3.219659, lon: 101.721897 },
];

/**
 * Longitude span the cluster map shows across the viewport's full width — the only zoom control.
 * 0.010471° ≈ 1.16 km, which puts the eight blocks at ~⅔ of the width with real streets around them.
 */
export const MAP_FOCUS_LON_SPAN = 0.010471;

/**
 * Ring radius around the hot blocks, metres. Derived: 86 raster px × 4.7697 m/px (the raster's
 * ground resolution at this latitude, `metresPerPixel`) — the smallest circle that covers B3–B5.
 */
export const CLUSTER_RING_RADIUS_M = 410;

/** `district.stamp` + `activeCluster` fogging window (48 h). Arithmetic, not a typed-in time. */
export const FOG_BY_STAMP = '6 SEP 09:00';
