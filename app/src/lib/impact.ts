/**
 * Every figure the v3 roadmap screens are allowed to show, and the arithmetic that produces it.
 *
 * WHY THIS FILE EXISTS. specs.md §9 is the only source of figures and §13 rule 2 requires every
 * `[modeled]` number to show its derivation. A screen that hard-codes both "8.9 km²" and the
 * sentence "2.44 × 3.64" can drift silently — the number is edited, the sentence is not, and the
 * app is now showing arithmetic that does not produce its own result. That is exactly the class of
 * defect CLAUDE.local.md calls a correctness surface. So: the value and the arithmetic string are
 * emitted from the SAME constants, here, and the screens render both without doing any maths.
 *
 * Rule for adding anything: the base must appear verbatim in specs §9 (or be a geodesy/format
 * constant, which is disclosed as such below). If §9 cannot source it, it does not get a number —
 * it gets an omission, and `OMITTED_CASES_AVERTED` is the pattern for that.
 */

import { SETAPAK_BOUNDS } from './geo';

/** A displayable figure: what it is, the number, and how it was reached. */
export type Figure = {
  /** Rendered value, already formatted. */
  value: string;
  /** The derivation, shown on screen next to it. Empty for `[cited]` figures. */
  arithmetic: string;
  tag: 'cited' | 'modeled';
};

// ── Bases quoted verbatim from specs.md §9 ────────────────────────────────────────
export const CITED = {
  /** Cost per dengue case, Malaysia — Seremban household study. */
  costPerCaseUsd: 365.16,
  /** …of which this share is indirect (lost wages). */
  indirectSharePct: 89.8,
  workdaysLost: 12.5,
  schoolDaysLost: 6.3,
  /** Citizen-science surveillance, EUR per km² per month — Mosquito Alert. */
  citizenEurPerKm2Month: 1.23,
  /** Ovitrap surveillance, same units, same study. */
  ovitrapEurPerKm2Month: 9.36,
  /** Mosquito Alert reach. */
  mosquitoAlertUsers: '38K',
  mosquitoAlertFirstDetectionPct: 39,
  /** On-device model size — the federated-update payload is this shape. */
  modelParams: 927_000,
  inferenceMs: 320,
  /** MosquitoSong+ accuracy envelope. Both limits are stated on screen (specs §13 rule 6). */
  speciesSexControlledPct: 93.3,
  fourSpeciesLowPct: 80,
  fourSpeciesHighPct: 89,
  outdoorNoisePct: 67.3,
} as const;

// ── Non-§9 constants, disclosed ───────────────────────────────────────────────────
// Geodesy (WGS-84 mean degree lengths) and the audio format from specs §4. Neither is an
// epidemiological claim; both are unit conversions.
const M_PER_DEG_LAT = 110_574;
const M_PER_DEG_LON_EQUATOR = 111_320;
const DEG = Math.PI / 180;

/** specs §4 audio contract: 5.0 s mono, 16 kHz, float32. */
export const AUDIO = {
  seconds: 5.0,
  sampleRate: 16_000,
  bytesPerSample: 4,
} as const;

const round = (n: number, dp: number) => Number(n.toFixed(dp));

// ── District extent — geometry, from the bundled basemap bounds ───────────────────
// design-system.md §Maps fixes these bounds; they are z15 tile edges, not an estimate. This is the
// only honest reading of "area covered": the extent of the district this build actually renders.
const midLat = (SETAPAK_BOUNDS.north + SETAPAK_BOUNDS.south) / 2;
const heightKm = round(((SETAPAK_BOUNDS.north - SETAPAK_BOUNDS.south) * M_PER_DEG_LAT) / 1000, 2);
const widthKm = round(
  ((SETAPAK_BOUNDS.east - SETAPAK_BOUNDS.west) * M_PER_DEG_LON_EQUATOR * Math.cos(midLat * DEG)) /
    1000,
  2,
);
/** Rounded to 1 dp FIRST, then everything downstream multiplies this exact displayed number. */
const areaKm2 = round(widthKm * heightKm, 1);

export const DISTRICT_EXTENT: Figure = {
  value: `${areaKm2} km²`,
  arithmetic: `${widthKm} km × ${heightKm} km`,
  tag: 'modeled',
};

// ── Surveillance cost at that extent ──────────────────────────────────────────────
const citizenEurMonth = round(areaKm2 * CITED.citizenEurPerKm2Month, 2);
const ovitrapEurMonth = round(areaKm2 * CITED.ovitrapEurPerKm2Month, 2);
const costRatio = round(CITED.ovitrapEurPerKm2Month / CITED.citizenEurPerKm2Month, 1);

export const CITIZEN_MONTHLY: Figure = {
  value: `€${citizenEurMonth.toFixed(2)}`,
  arithmetic: `${areaKm2} km² × €${CITED.citizenEurPerKm2Month}/km²/mo`,
  tag: 'modeled',
};

export const OVITRAP_MONTHLY: Figure = {
  value: `€${ovitrapEurMonth.toFixed(2)}`,
  arithmetic: `${areaKm2} km² × €${CITED.ovitrapEurPerKm2Month}/km²/mo`,
  tag: 'modeled',
};

/**
 * §9 states the gap as "8×". The exact quotient is 7.6×, so that is what is shown — rounding a
 * ratio UP in our own favour is how an invented figure gets born.
 */
export const COST_RATIO: Figure = {
  value: `${costRatio}× cheaper`,
  arithmetic: `€${CITED.ovitrapEurPerKm2Month} ÷ €${CITED.citizenEurPerKm2Month} · §9 states 8×`,
  tag: 'modeled',
};

// ── What one averted case is worth ────────────────────────────────────────────────
export const COST_PER_CASE: Figure = {
  value: `$${CITED.costPerCaseUsd.toFixed(2)}`,
  arithmetic: '',
  tag: 'cited',
};

const indirectUsd = round((CITED.costPerCaseUsd * CITED.indirectSharePct) / 100, 2);
export const INDIRECT_PER_CASE: Figure = {
  value: `$${indirectUsd.toFixed(2)}`,
  arithmetic: `$${CITED.costPerCaseUsd} × ${CITED.indirectSharePct}%`,
  tag: 'modeled',
};

/**
 * THE OMISSION. specs §9 contains no efficacy figure linking a citizen detection to a prevented
 * case — no trial, no attack-rate reduction, no coverage-to-incidence curve. Any "cases averted"
 * number would therefore be invented, and an invented impact stat is the single most disqualifying
 * thing this app could display (slice plan 19). It is shown as an absence, with the reason.
 */
export const OMITTED_CASES_AVERTED = {
  heading: 'Cases averted',
  value: 'not shown',
  reason:
    'No figure in our evidence base links a detection to a prevented case. We would have to invent the multiplier, so we do not print one.',
} as const;

// ── Privacy screen: payload sizes ─────────────────────────────────────────────────
const clipBytes = AUDIO.sampleRate * AUDIO.seconds * AUDIO.bytesPerSample;
const updateBytes = CITED.modelParams * AUDIO.bytesPerSample;

/** The clip that never leaves. */
export const CLIP_SIZE: Figure = {
  value: `${round(clipBytes / 1000, 0)} kB`,
  arithmetic: `${AUDIO.sampleRate.toLocaleString('en-US')} Hz × ${AUDIO.seconds.toFixed(1)} s × ${AUDIO.bytesPerSample} B`,
  tag: 'modeled',
};

/** The weight delta that does — same shape as the model, one float per parameter. */
export const UPDATE_SIZE: Figure = {
  value: `${round(updateBytes / 1_000_000, 1)} MB`,
  arithmetic: `927K params × ${AUDIO.bytesPerSample} B`,
  tag: 'modeled',
};
