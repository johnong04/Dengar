/**
 * Amplitude stream for the capture level meter.
 *
 * The contract is `LevelSource`: emit 0..1 at ~30 fps until stopped. The meter component only
 * knows this shape, so the native mic pipeline plugs in later by implementing the same interface —
 * screens never learn where the numbers come from.
 *
 * Web: real getUserMedia + AnalyserNode RMS when the browser grants a mic; otherwise a seeded
 * simulated envelope (wander + noise + occasional close-pass swell) so the instrument stays alive
 * in any session, including headless screenshots.
 */

export type LevelSource = {
  kind: 'mic' | 'simulated';
  /** Subscribe to level updates (0..1). Returns an unsubscribe function. */
  subscribe(cb: (level: number) => void): () => void;
  /** Tear down timers, tracks, and audio context. Idempotent. */
  stop(): void;
};

const TICK_MS = 33;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSimulatedSource(seed = 0x5eed): LevelSource {
  const rand = mulberry32(seed);
  const subs = new Set<(v: number) => void>();
  let t = 0;
  let swell = 0;
  let stopped = false;

  const id = setInterval(() => {
    t += TICK_MS / 1000;
    // Rare swell = the insect passing close to the mic; decays like a real envelope.
    if (rand() < 0.012) swell = 0.5 + rand() * 0.35;
    swell *= 0.94;
    const base =
      0.3 + 0.14 * Math.sin(2 * Math.PI * 0.6 * t) + 0.08 * Math.sin(2 * Math.PI * 2.3 * t + 1.7);
    const level = Math.min(1, Math.max(0.02, base + swell + (rand() - 0.5) * 0.12));
    subs.forEach((cb) => cb(level));
  }, TICK_MS);

  return {
    kind: 'simulated',
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(id);
      subs.clear();
    },
  };
}

async function createMicSource(): Promise<LevelSource | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
  if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);

    const data = new Float32Array(analyser.fftSize);
    const subs = new Set<(v: number) => void>();
    let smoothed = 0;
    let stopped = false;

    const id = setInterval(() => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const target = Math.min(1, rms * 9);
      // Fast attack, slow release — meters read wrong without asymmetric smoothing.
      smoothed += (target - smoothed) * (target > smoothed ? 0.55 : 0.15);
      subs.forEach((cb) => cb(smoothed));
    }, TICK_MS);

    return {
      kind: 'mic',
      subscribe(cb) {
        subs.add(cb);
        return () => subs.delete(cb);
      },
      stop() {
        if (stopped) return;
        stopped = true;
        clearInterval(id);
        subs.clear();
        stream.getTracks().forEach((tr) => tr.stop());
        void ctx.close();
      },
    };
  } catch {
    return null; // denied or no device — the simulated envelope takes over
  }
}

/** Real mic when the platform grants one, simulated envelope otherwise. Never rejects. */
export async function createLevelSource(): Promise<LevelSource> {
  const mic = await createMicSource();
  const source = mic ?? createSimulatedSource();
  if (__DEV__) console.debug(`[capture] level source: ${source.kind}`);
  return source;
}
