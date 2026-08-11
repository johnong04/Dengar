/**
 * The contract from specs.md §4. Models return numbers; every word the user reads is decided here.
 *
 * CRITICAL PATH. A wrong threshold is a false claim on camera, which is the failure mode judges
 * disqualify for. Change a number here only with the spec open, and re-run the self-check below.
 */

export type Species = 'aedes' | 'not_aedes';

/**
 * Fine-grained heads (specs.md §6). Every field is optional and independently absent, because each
 * comes from a separate head that may or may not survive TFLite conversion. Screens render what is
 * present and fall back per-field — never assume one implies another.
 *
 * Anything shown from here that the shipped model cannot actually do must be labelled simulated in
 * the narration. specs.md §13 rule 3: concealed simulation is what disqualifies.
 */
export type SpeciesDetail = {
  /** e.g. 'Aedes aegypti'. Latin name, not a bucket. */
  taxon?: { name: string; confidence: number };
  /** Only females bite — this is why the field exists, not decoration. */
  sex?: { value: 'female' | 'male'; confidence: number };
  /** Blood-fed / gravid. Only gravid females transmit. v3; no head planned yet. */
  gravid?: { value: boolean; confidence: number };
};

/** Raw model output. Nothing in here is user-facing. */
export type RawInference = {
  /** MED: P(a mosquito is present in this 5 s clip) */
  medScore: number;
  /** MSC softmax, fixed order [aedes, not_aedes]. Undefined when MED gated it out. */
  mscScores?: readonly [number, number];
  /** Signal-to-noise in the wingbeat band, dB. */
  bandSnrDb: number;
  /** Optional extra heads. Absent until they exist; never gate on these. */
  detail?: SpeciesDetail;
};

/**
 * The measured numbers an abstain was judged on, populated per veto order — a gate that never ran
 * contributes nothing (too_noisy vetoes before MED, so it carries no medScore). This is what lets
 * the result screen show honest readouts instead of invented ones.
 */
export type AbstainReadings = {
  /** Absent when the SNR veto fired before MED was judged. */
  medScore?: number;
  /** max(mscScores) — present only when MSC actually ran (not_confident). */
  mscMax?: number;
  /** Always measured; the first gate. */
  bandSnrDb: number;
};

/**
 * Abstain is the majority outcome, not an error (specs.md §4). Three distinct reasons, because the
 * user's next action differs: nothing there / get closer / go somewhere quieter.
 */
export type Verdict =
  | { kind: 'detected'; species: Species; confidence: number; detail?: SpeciesDetail }
  | {
      kind: 'abstain';
      reason: 'no_mosquito' | 'not_confident' | 'too_noisy';
      readings: AbstainReadings;
    };

export const MED_THRESHOLD = 0.5;
export const MSC_THRESHOLD = 0.7;
/** ponytail: placeholder floor. Replace with a measured value from ml/ before any on-camera claim. */
export const BAND_SNR_FLOOR_DB = 6;

export function judge(raw: RawInference): Verdict {
  // Noise first: a confident-looking score on an unusable recording is the dangerous case, and
  // outdoor accuracy drops to 67.3%, so the SNR floor must be able to veto a high MSC score.
  if (raw.bandSnrDb < BAND_SNR_FLOOR_DB)
    return { kind: 'abstain', reason: 'too_noisy', readings: { bandSnrDb: raw.bandSnrDb } };
  if (raw.medScore < MED_THRESHOLD)
    return {
      kind: 'abstain',
      reason: 'no_mosquito',
      readings: { medScore: raw.medScore, bandSnrDb: raw.bandSnrDb },
    };

  const scores = raw.mscScores;
  if (!scores)
    return {
      kind: 'abstain',
      reason: 'no_mosquito',
      readings: { medScore: raw.medScore, bandSnrDb: raw.bandSnrDb },
    };

  const [aedes, notAedes] = scores;
  const confidence = Math.max(aedes, notAedes);
  if (confidence < MSC_THRESHOLD)
    return {
      kind: 'abstain',
      reason: 'not_confident',
      readings: { medScore: raw.medScore, mscMax: confidence, bandSnrDb: raw.bandSnrDb },
    };

  // detail is passed through untouched and never gates. A low-confidence sex head must not be able
  // to suppress a solid Aedes detection — the fogging decision depends only on the bucket.
  return {
    kind: 'detected',
    species: aedes >= notAedes ? 'aedes' : 'not_aedes',
    confidence,
    ...(raw.detail ? { detail: raw.detail } : {}),
  };
}
