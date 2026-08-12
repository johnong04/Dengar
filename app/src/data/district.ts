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
  key: 'detections' | 'clusters' | 'nodes';
  /** Short uppercase label. */
  label: string;
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
  /** Detections in the last 72 h. */
  count: number;
  /** Signed change, or a "silent for" duration when count is 0. */
  delta: string;
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
  stamp: 'TUE 12 AUG · 07:04',
  simulated: true,
} as const;

export const kpis: readonly Kpi[] = [
  { key: 'detections', label: 'Detections', value: '6', delta: '+2', tone: 'alert' },
  { key: 'clusters', label: 'Clusters', value: '1', delta: '+1', tone: 'alert' },
  { key: 'nodes', label: 'Nodes', value: '23/26', delta: '−3', tone: 'neutral' },
];

// The last three days sum to 14 — the sanctioned cluster (14 detections / 72 h).
const DETECTIONS_14D = [0, 1, 0, 1, 2, 1, 0, 2, 1, 2, 3, 4, 4, 6] as const;
// The last three days sum to 40 — the sanctioned +40 mm.
const RAIN_14D = [2, 0, 0, 3, 1, 0, 0, 5, 2, 4, 6, 12, 16, 12] as const;
// +14…+21 d inclusive: 8 days. Magnitudes are illustrative only.
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

/** Hour band × day. The daylight-biting vector shows in the two middle bands. */
export const heat: HeatGrid = {
  rows: ['18–24', '12–18', '06–12', '00–06'],
  cols: ['06', '07', '08', '09', '10', '11', '12'],
  values: [
    [0, 0, 0, 1, 0, 0, 1],
    [1, 0, 2, 2, 1, 3, 3],
    [1, 2, 1, 3, 2, 4, 5],
    [0, 0, 0, 0, 1, 0, 1],
  ],
  max: 5,
};

export const watchAreas: readonly WatchArea[] = [
  {
    id: 'taman-melati',
    name: 'Taman Melati',
    spark: [0, 1, 0, 1, 2, 1, 0, 2, 1, 2, 3, 4, 4, 6],
    count: 14,
    delta: '+6',
    tone: 'alert',
    center: { lat: 3.2145, lon: 101.7216 },
  },
  {
    id: 'wangsa-maju',
    name: 'Wangsa Maju',
    spark: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    count: 3,
    delta: '+1',
    tone: 'caution',
    center: { lat: 3.2032, lon: 101.7305 },
  },
  {
    id: 'danau-kota',
    name: 'Danau Kota',
    spark: [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    count: 0,
    delta: '11 h',
    tone: 'neutral',
    center: { lat: 3.2035, lon: 101.7148 },
  },
];

export const activeCluster: Cluster = {
  id: 'taman-melati',
  area: 'Taman Melati',
  blocks: 'B3–B5',
  detections: 14,
  windowHours: 72,
  rainMm: 40,
  trend: 'rising',
  center: { lat: 3.2145, lon: 101.7216 },
};
