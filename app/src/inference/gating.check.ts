/**
 * Self-check for the gating thresholds. `npx tsx src/inference/gating.check.ts`
 * No framework: this is one branch table, and it fails loudly if a threshold moves.
 */
import { judge, type RawInference } from './gating';

// ponytail: two lines instead of node:assert — avoids pulling @types/node into an RN tsconfig
// whose `types` field doesn't include it.
const assert = {
  equal: (a: unknown, b: unknown) => {
    if (a !== b) throw new Error(`expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  },
  deepEqual: (a: unknown, b: unknown) => {
    if (JSON.stringify(a) !== JSON.stringify(b))
      throw new Error(`expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  },
};

const clip = (o: Partial<RawInference>): RawInference => ({
  medScore: 0.9,
  mscScores: [0.95, 0.05],
  bandSnrDb: 20,
  ...o,
});

// happy path
assert.deepEqual(judge(clip({})), { kind: 'detected', species: 'aedes', confidence: 0.95 });
assert.deepEqual(judge(clip({ mscScores: [0.1, 0.9] })), {
  kind: 'detected',
  species: 'not_aedes',
  confidence: 0.9,
});

// the three abstains — each carries the measured numbers it was judged on (readings), populated
// per veto order: too_noisy vetoes before MED runs, so it carries no medScore.
assert.deepEqual(judge(clip({ medScore: 0.49 })), {
  kind: 'abstain',
  reason: 'no_mosquito',
  readings: { medScore: 0.49, bandSnrDb: 20 },
});
assert.deepEqual(judge(clip({ mscScores: [0.69, 0.31] })), {
  kind: 'abstain',
  reason: 'not_confident',
  readings: { medScore: 0.9, mscMax: 0.69, bandSnrDb: 20 },
});
assert.deepEqual(judge(clip({ bandSnrDb: 5 })), {
  kind: 'abstain',
  reason: 'too_noisy',
  readings: { bandSnrDb: 5 },
});

// MED passed but MSC never ran (head absent) — reported as no_mosquito, readings show what was judged
assert.deepEqual(judge(clip({ mscScores: undefined })), {
  kind: 'abstain',
  reason: 'no_mosquito',
  readings: { medScore: 0.9, bandSnrDb: 20 },
});

// noise vetoes a confident score — the whole reason SNR is checked first
assert.deepEqual(judge(clip({ medScore: 0.99, mscScores: [0.99, 0.01], bandSnrDb: 0 })), {
  kind: 'abstain',
  reason: 'too_noisy',
  readings: { bandSnrDb: 0 },
});

// boundaries are inclusive: exactly at threshold passes
assert.equal(judge(clip({ medScore: 0.5, mscScores: [0.7, 0.3], bandSnrDb: 6 })).kind, 'detected');

// detail passes through untouched, and its confidence CANNOT gate the detection — a weak sex head
// must never suppress a solid Aedes call, because fogging depends only on the bucket.
const withDetail = judge(clip({ detail: { sex: { value: 'female', confidence: 0.01 } } }));
assert.equal(withDetail.kind, 'detected');
assert.deepEqual(withDetail.kind === 'detected' && withDetail.detail, {
  sex: { value: 'female', confidence: 0.01 },
});

// no detail means the key is absent, not present-and-undefined — screens branch on `in`
assert.equal('detail' in judge(clip({})), false);

// detail does not rescue an abstain
assert.deepEqual(judge(clip({ bandSnrDb: 0, detail: { sex: { value: 'female', confidence: 0.99 } } })), {
  kind: 'abstain',
  reason: 'too_noisy',
  readings: { bandSnrDb: 0 },
});

// detected verdicts carry NO readings — slice 4 consumes this shape unchanged
assert.equal('readings' in judge(clip({})), false);

console.log('gating: ok');
