/**
 * v3 ROADMAP derivations — the officer forecast band and the surgical-dispatch economics.
 *
 * Added additively in slice 20. **Nothing in `district.ts` changed**: this module imports the one
 * base series (the three area sparklines) and the block geometry, and derives every number it
 * exposes. Screens render these values and never do arithmetic of their own, so two figures on one
 * screen cannot disagree.
 *
 * Two classes of number live here and they are tagged separately:
 *
 *  - **[cited]** — verbatim from specs.md §9, the ONLY permitted source of an economic figure. They
 *    appear once each, in `CITED`, and nowhere else.
 *  - **[modeled]** — computed from `CITED` and/or from the seeded series, with the arithmetic
 *    carried alongside as a string so the SCREEN shows the derivation rather than asserting the
 *    result. specs.md §13 rule 2.
 *
 * The forecast is a BAND and never a point path. A single line would claim a precision this
 * project explicitly does not have (specs.md §11 item 3: whether detection clusters predict human
 * cases is an open hypothesis). Both band edges are named, and each edge is one line of arithmetic
 * off the measured series — there is no fitted model and no invented coefficient anywhere.
 */

import { SETAPAK_RASTER, metresPerPixel, projectRect } from '@/lib/geo';

import {
  activeCluster,
  clusterBlocks,
  detectionsByArea,
  trend,
  type Recency,
  type SurveyBlock,
} from './district';

/* ═══ specs.md §9, verbatim. Nothing else in the app may type these. ═══════════════════════════ */

export const CITED = {
  /** National vector-control programme, per year. */
  nationalUsdM: 73.5,
  /** Share of that spend at district level, primarily fogging. */
  districtShare: 0.922,
  /** Whole-programme cost per dengue case. */
  programmeUsdPerCase: 1591,
  /** District health office cost per case. */
  dhdUsdPerCase: 679,
  /** Fogging as a share of DHD costs. */
  foggingShareOfDhd: 0.51,
  /** Citizen-science surveillance, EUR per km² per month (Mosquito Alert). */
  citizenEurPerKm2Month: 1.23,
  /** Ovitrap surveillance over the same unit. */
  ovitrapEurPerKm2Month: 9.36,
  /** The ratio between the two, as §9 states it. Not re-derived — cited as printed. */
  ovitrapMultiple: '8×',
} as const;

/* ═══ 1. The forecast band ═════════════════════════════════════════════════════════════════════ */

const WINDOW_DAYS = 3;
export const HORIZON_DAYS = 14;

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

/** Detections in the last 72 h, and in the 72 h before it — read off `trend.detections`. */
const windowCount = sum(trend.detections.slice(-WINDOW_DAYS));
const priorCount = sum(trend.detections.slice(-WINDOW_DAYS * 2, -WINDOW_DAYS));

/** Lower edge: today's 72 h rate simply holds. */
const basePerDay = windowCount / WINDOW_DAYS;
/** 72 h over 72 h. The one growth number, measured — not fitted. */
const growth = windowCount / priorCount;
/** Upper edge: that growth runs for ONE more 72 h window, then holds. Deliberately not compounded. */
const highPerDay = basePerDay * growth;

export type BandDay = { day: number; low: number; high: number };

/**
 * The band, +1…+14 d. It opens over the first 72 h — the window the growth was measured over — and
 * then runs flat. Extrapolating 2.83× per 72 h across a fortnight would produce a number nobody can
 * defend, so the model stops claiming growth exactly where the measurement stops supporting it.
 */
export const band: readonly BandDay[] = Array.from({ length: HORIZON_DAYS }, (_, i) => {
  const day = i + 1;
  const opened = Math.min(day, WINDOW_DAYS) / WINDOW_DAYS;
  return {
    day,
    low: basePerDay,
    high: basePerDay * (1 + (growth - 1) * opened),
  };
});

export const forecast = {
  windowHours: WINDOW_DAYS * 24,
  horizonDays: HORIZON_DAYS,
  windowCount,
  priorCount,
  basePerDay,
  growth,
  highPerDay,
  /** Rainfall over the same 72 h — the second input, and the sanctioned +40 mm. */
  rainMm: activeCluster.rainMm,
  leadDays: trend.leadDays,
  /** The top of the chart's value axis. One scale for the measured bars and the band. */
  scaleMax: Math.max(highPerDay, trend.peak.detections),
  /** Printed on screen so the reader can check the edge, not trust it. */
  lowMath: `${windowCount} ÷ ${WINDOW_DAYS} = ${basePerDay.toFixed(2)} /day`,
  highMath: `${windowCount} ÷ ${priorCount} = ${growth.toFixed(2)}× · ${basePerDay.toFixed(2)} × ${growth.toFixed(2)} = ${highPerDay.toFixed(1)} /day`,
} as const;

/* ═══ 2. Block-level targeting ═════════════════════════════════════════════════════════════════ */

/**
 * Recency weights for the priority score. A DECLARED modelling choice, printed on the screen beside
 * the grid — not a figure, and not sourced to §9 because §9 has nothing to say about it.
 */
export const RECENCY_WEIGHT: Record<Recency, number> = { 0: 3, 1: 2, 2: 1 };

const MPP = metresPerPixel(SETAPAK_RASTER);

/** Ground area of a survey block, through the same projection the cluster map draws it with. */
function areaM2(b: SurveyBlock): number {
  const r = projectRect(b.nw, b.se, SETAPAK_RASTER);
  return Math.abs(r.width * r.height) * MPP * MPP;
}

export type BlockTarget = {
  id: string;
  /** Detections inside this rectangle — counted geometrically, never typed in. */
  detections: number;
  /** Σ recency weight over those detections. */
  score: number;
  areaKm2: number;
  /** 1-based dispatch order among the targeted blocks; null when the block is not a target. */
  priority: number | null;
};

const MELATI_DETECTIONS = detectionsByArea[activeCluster.id] ?? [];

const scored = clusterBlocks.map((b) => {
  const inside = MELATI_DETECTIONS.filter(
    (d) => d.lon >= b.nw.lon && d.lon <= b.se.lon && d.lat <= b.nw.lat && d.lat >= b.se.lat,
  );
  return {
    id: b.id,
    detections: inside.length,
    score: sum(inside.map((d) => RECENCY_WEIGHT[d.ageBand])),
    areaKm2: areaM2(b) / 1e6,
  };
});

/** Targets, highest score first. This ordering IS the dispatch route. */
const ranked = scored.filter((b) => b.detections > 0).sort((a, b) => b.score - a.score);

export const blockTargets: readonly BlockTarget[] = scored.map((b) => ({
  ...b,
  priority:
    ranked.findIndex((r) => r.id === b.id) === -1
      ? null
      : ranked.findIndex((r) => r.id === b.id) + 1,
}));

/** `B4 → B5 → B3` — the visit order, spelled from the ranking rather than beside it. */
export const dispatchRoute = ranked.map((b) => b.id);
export const maxBlockScore = Math.max(...scored.map((b) => b.score));

const byId = new Map(blockTargets.map((b) => [b.id, b]));

/**
 * The blocks laid out as they sit on the ground — rows north to south, west to east inside a row —
 * so the grid an officer reads is the same shape as the cluster map's rectangles. Derived from the
 * corner coordinates, never from the array order, because the array order is not geographic (B7/B8
 * sit west of B5/B6 on the southern row).
 */
export const blockGrid: readonly (readonly BlockTarget[])[] = Array.from(
  clusterBlocks
    .reduce((rows, b) => {
      const key = b.nw.lat.toFixed(6);
      (rows.get(key) ?? rows.set(key, []).get(key)!).push(b);
      return rows;
    }, new Map<string, SurveyBlock[]>())
    .entries(),
)
  .sort((a, b) => Number(b[0]) - Number(a[0]))
  .map(([, row]) => row.sort((a, b) => a.nw.lon - b.nw.lon).map((b) => byId.get(b.id)!));

/* ═══ 3. Footprint and economics ═══════════════════════════════════════════════════════════════ */

const totalKm2 = sum(scored.map((b) => b.areaKm2));
const targetKm2 = sum(ranked.map((b) => b.areaKm2));
const footprintShare = targetKm2 / totalKm2;

/**
 * Cost per case averted, as a RATIO and never as an absolute.
 *
 * The absolute would need a cases-averted denominator, and specs §11 item 3 says plainly that we do
 * not have one — an absolute here would be exactly the invented figure §9 forbids. What survives is
 * an identity: if fogging cost scales with the ground fogged and the two sorties avert the same
 * cases, then cost-per-case-averted scales with the footprint. Both assumptions are printed on the
 * screen next to the number.
 */
export const economics = {
  totalKm2,
  targetKm2,
  footprintShare,
  /** Ground NOT fogged, i.e. the share of the fogging line released. */
  releasedShare: 1 - footprintShare,
  /** 1 ÷ 0.386 = 2.59. The headline. */
  costFactor: 1 / footprintShare,

  /** 73.5 × 92.2% — district-level spend, "primarily fogging" (§9). */
  districtUsdM: CITED.nationalUsdM * CITED.districtShare,
  /** 679 × 51.0% — the fogging slice of the DHD cost per case. */
  foggingUsdPerCase: CITED.dhdUsdPerCase * CITED.foggingShareOfDhd,
  /** …× the share of ground we did not enter. */
  releasedUsdPerCase: CITED.dhdUsdPerCase * CITED.foggingShareOfDhd * (1 - footprintShare),
} as const;

/**
 * The derivation ledger, rendered verbatim. Each row carries its own tag, and every `modeled` row's
 * arithmetic resolves with the rounded values shown beside it — a reader with a calculator gets the
 * same answer, which is the whole point of printing it.
 */
export type LedgerRow = {
  math: string;
  result: string;
  note: string;
  tag: 'cited' | 'modeled';
};

export const ledger: readonly LedgerRow[] = [
  {
    math: `USD ${CITED.nationalUsdM}M / yr`,
    result: '',
    note: 'national vector-control programme',
    tag: 'cited',
  },
  {
    math: `× ${(CITED.districtShare * 100).toFixed(1)}%`,
    result: `USD ${economics.districtUsdM.toFixed(1)}M / yr`,
    note: 'district level, primarily fogging',
    tag: 'modeled',
  },
  {
    math: `USD ${CITED.dhdUsdPerCase} × ${(CITED.foggingShareOfDhd * 100).toFixed(1)}%`,
    result: `USD ${economics.foggingUsdPerCase.toFixed(1)} / case`,
    note: 'fogging inside the DHD cost per case',
    tag: 'modeled',
  },
  {
    math: `USD ${economics.foggingUsdPerCase.toFixed(1)} × ${(economics.releasedShare * 100).toFixed(1)}%`,
    result: `USD ${economics.releasedUsdPerCase.toFixed(1)} / case`,
    note: 'released — ground the truck never enters',
    tag: 'modeled',
  },
  {
    math: `USD ${CITED.programmeUsdPerCase.toLocaleString('en-US')} / case`,
    result: '',
    note: 'what one case costs the programme',
    tag: 'cited',
  },
  {
    // The exact quotient is 7.6; §9 states it as 8×. The citizen roadmap (slice 19) already shows
    // 7.6 and names §9's rounding beside it, so this row does the same — one app may not carry two
    // different numbers for one fact, and rounding a ratio in our own favour is how a fake figure
    // is born.
    math: `EUR ${CITED.ovitrapEurPerKm2Month} ÷ ${CITED.citizenEurPerKm2Month}`,
    result: `${(CITED.ovitrapEurPerKm2Month / CITED.citizenEurPerKm2Month).toFixed(1)}× (§9: ${CITED.ovitrapMultiple})`,
    note: 'input layer — citizen science against ovitraps, per km² / month',
    tag: 'cited',
  },
];
