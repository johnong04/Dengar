/**
 * The one seam between app/ and ml/ (specs.md §4). Screens import from here and nowhere else.
 *
 * This is the stub: random values satisfying the contract. It is what lets the UI be built and
 * screenshotted on web, where react-native-fast-tflite cannot load at all. Swapping in the real
 * models must not change this signature — if a screen ever needs to know which one is running,
 * the seam has leaked.
 */
import { judge, type RawInference, type Verdict } from './gating';

export const IS_STUB = true;

/**
 * DEMO SCRIPT — set `DEMO_SCRIPTED` back to `false` when the recording is done.
 *
 * The stub is weighted so abstain dominates (~70%), which is right for design and wrong for a
 * one-take recording: on camera, tapping Listen usually produces "no mosquito found".
 *
 * Scripted, the captures run in a fixed order — FIRST tap abstains (too noisy), SECOND and every
 * tap after gives the positive Aedes verdict. That order is the point: a single tap that always
 * says Aedes reads as a magic trick, whereas refusing once and then succeeding shows the selective
 * abstention the whole pitch rests on, and makes the Aedes call more credible rather than less.
 *
 * The counter lives in module scope, so it survives in-app navigation (the result screen is a
 * client-side push) but RESETS ON A PAGE RELOAD. Record in one continuous take without refreshing,
 * or the sequence starts over.
 *
 * This must not reach a `preview` APK: a build that always says Aedes, handed to a judge who taps
 * it a third time, reads as rigged. Flip it back before any build leaves this laptop.
 */
const DEMO_SCRIPTED = true;
let demoTake = 0;

/** @param audio 5.0 s mono, 16 kHz, float32 normalized -1.0…1.0 */
export async function classify(audio: Float32Array): Promise<Verdict> {
  if (audio.length !== 16000 * 5) {
    throw new Error(`contract violation: expected 80000 samples, got ${audio.length}`);
  }

  await new Promise((r) => setTimeout(r, 320)); // the measured on-device latency (arXiv:2306.10091)

  if (DEMO_SCRIPTED) {
    demoTake += 1;
    // Take 1: a real mosquito is audible but the band-SNR floor is not cleared, so the gate
    // abstains with `too_noisy` — the honest refusal, produced by the SAME gating code as every
    // other verdict, not by a hardcoded screen.
    if (demoTake === 1) return judge({ medScore: 0.9, mscScores: [0.95, 0.05], bandSnrDb: 2 });
    // Take 2 onward: clean capture, Aedes.
    return judge({
      medScore: 0.93,
      mscScores: [0.91, 0.09],
      bandSnrDb: 22,
      detail: {
        taxon: { name: 'Aedes aegypti', confidence: 0.81 },
        sex: { value: 'female', confidence: 0.93 },
      },
    });
  }

  // Weighted so abstain dominates, because it does in reality (specs.md §4) and a stub that mostly
  // succeeds would let us design the abstain screens as an afterthought.
  const roll = Math.random();
  const raw: RawInference =
    roll < 0.4
      ? { medScore: 0.2, bandSnrDb: 18 }
      : roll < 0.55
        ? { medScore: 0.9, mscScores: [0.55, 0.45], bandSnrDb: 18 }
        : roll < 0.7
          ? { medScore: 0.9, mscScores: [0.95, 0.05], bandSnrDb: 2 }
          : { medScore: 0.93, mscScores: [0.88, 0.12], bandSnrDb: 22, detail: stubDetail() };

  return judge(raw);
}

/**
 * The extra heads (specs.md §6) don't exist yet, so this fabricates them — and drops them entirely
 * 30% of the time. That gap is deliberate: the head that ships may be sex-only, taxon-only, or
 * none, so the result screen has to read well with any subset. A stub that always returned the full
 * set would let us design one rich screen and discover the fallback on demo day.
 */
function stubDetail() {
  if (Math.random() < 0.3) return undefined;
  const female = Math.random() < 0.65;
  return {
    taxon: { name: Math.random() < 0.6 ? 'Aedes aegypti' : 'Aedes albopictus', confidence: 0.81 },
    sex: { value: female ? ('female' as const) : ('male' as const), confidence: 0.93 },
    ...(female && Math.random() < 0.5 ? { gravid: { value: true, confidence: 0.7 } } : {}),
  };
}
