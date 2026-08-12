/**
 * Self-check for the lat/lon → pixel projection. `npx tsx src/lib/geo.check.ts`
 *
 * Written RED before `geo.ts` existed (slice 14). The projection is arithmetic that is either right
 * or silently, unfalsifiably wrong: a wrong constant moves every detection dot a few hundred metres
 * and NOTHING in the UI complains. These assertions are the only thing standing between the screen
 * and a map that quietly lies.
 *
 * No framework and no node:assert — the RN tsconfig's `types` doesn't include node.
 */
import {
  SETAPAK_BOUNDS as B,
  SETAPAK_RASTER as R,
  clampOffset,
  fitFocus,
  metresPerPixel,
  project,
  projectRect,
  unproject,
} from './geo';

const assert = {
  ok: (v: unknown, what: string) => {
    if (!v) throw new Error(`expected truthy: ${what}`);
  },
  equal: (a: unknown, b: unknown, what = '') => {
    if (a !== b) throw new Error(`${what} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  },
  close: (a: number, b: number, eps: number, what = '') => {
    if (!(Math.abs(a - b) <= eps))
      throw new Error(`${what} expected ${b} ±${eps}, got ${a} (off by ${Math.abs(a - b)})`);
  },
};

// ── 1. the four corners land on the four image corners ──────────────────────────────────────────
// If this fails, every other number on the screen is meaningless.
const EPS = 1e-9;
const corners: [string, number, number, number, number][] = [
  ['NW', B.north, B.west, 0, 0],
  ['NE', B.north, B.east, R.width, 0],
  ['SW', B.south, B.west, 0, R.height],
  ['SE', B.south, B.east, R.width, R.height],
];
for (const [name, lat, lon, ex, ey] of corners) {
  const p = project({ lat, lon }, R);
  assert.close(p.x, ex, EPS, `corner ${name} x`);
  assert.close(p.y, ey, EPS, `corner ${name} y`);
  assert.equal(p.inside, true, `corner ${name} inside`);
}

// ── 2. Mercator, not a lerp ─────────────────────────────────────────────────────────────────────
// The centre latitude must NOT land on exactly height/2. A linear interpolation between the bounds
// returns 384.0 exactly; the Web-Mercator formula returns 384.0030940005047. That is the whole
// point of this file: the two implementations differ, and only one of them is a map.
//
// HONEST MAGNITUDE: at 3.21° N the deviation is +0.0031 px ≈ 1.5 cm on the ground. It is NOT
// visible, contrary to the slice brief's expectation — Mercator's y is very nearly linear this
// close to the equator. Mercator is implemented because it is *correct* and because these same
// bounds are z15 tile edges (tile y 16090…16093 exactly), not because a lerp would look wrong here.
// The assertion still discriminates: a lerp fails it by 3000×.
const MID_LAT = (B.north + B.south) / 2;
const midY = project({ lat: MID_LAT, lon: B.west }, R).y;
assert.close(midY, 384.0030940005047, 1e-9, 'mid-latitude Mercator y');
assert.ok(Math.abs(midY - R.height / 2) > 1e-3, 'mid-latitude y is not height/2 (a lerp would be)');

// Longitude IS linear — the mid meridian lands exactly on the mid pixel.
assert.close(project({ lat: B.north, lon: (B.west + B.east) / 2 }, R).x, 256, EPS, 'mid-longitude x');

// Mercator y is monotonic and convex downward across the span: three evenly-spaced latitudes must
// NOT be evenly spaced in pixels. (Second, independent guard against a lerp sneaking back in.)
const q = [0.25, 0.5, 0.75].map(
  (t) => project({ lat: B.north - t * (B.north - B.south), lon: B.west }, R).y,
);
assert.ok(q[1] - q[0] !== q[2] - q[1], 'latitude pixel spacing is non-uniform (Mercator)');

// ── 3. out-of-bounds contract ───────────────────────────────────────────────────────────────────
// CONTRACT: `project` never clamps. x/y are extrapolated continuously past the bounds, and
// `inside` is false. Callers that must not paint outside the raster clip or skip on `inside`.
// (Clamping was rejected: a clamped dot lands ON the edge, which reads as real data at a wrong
// place. Extrapolating puts it off-screen where it is visibly absent.)
const nw = project({ lat: B.north + 0.01, lon: B.west - 0.01 }, R);
assert.equal(nw.inside, false, 'north-west of bounds inside');
assert.ok(nw.x < 0, 'west of bounds extrapolates to x < 0');
assert.ok(nw.y < 0, 'north of bounds extrapolates to y < 0');
const se = project({ lat: B.south - 0.01, lon: B.east + 0.01 }, R);
assert.equal(se.inside, false, 'south-east of bounds inside');
assert.ok(se.x > R.width, 'east of bounds extrapolates past width');
assert.ok(se.y > R.height, 'south of bounds extrapolates past height');
// the bounds themselves are inclusive
assert.equal(project({ lat: B.south, lon: B.east }, R).inside, true, 'SE corner is inside');

// ── 4. round trip ───────────────────────────────────────────────────────────────────────────────
for (const p of [
  { lat: 3.2145, lon: 101.7216 },
  { lat: 3.2032, lon: 101.7305 },
  { lat: 3.1961, lon: 101.7115 },
]) {
  const back = unproject(project(p, R), R);
  assert.close(back.lat, p.lat, 1e-12, 'round-trip lat');
  assert.close(back.lon, p.lon, 1e-12, 'round-trip lon');
}

// ── 5. scale independence — the same coordinate at 2× is at 2× the pixel ────────────────────────
const one = project({ lat: 3.2145, lon: 101.7216 }, R);
const two = project({ lat: 3.2145, lon: 101.7216 }, { width: R.width * 2, height: R.height * 2 });
assert.close(two.x, one.x * 2, 1e-9, '2× x');
assert.close(two.y, one.y * 2, 1e-9, '2× y');

// ── 6. projectRect — NW/SE in, positive box out ─────────────────────────────────────────────────
const box = projectRect({ lat: B.north, lon: B.west }, { lat: B.south, lon: B.east }, R);
assert.close(box.left, 0, EPS, 'rect left');
assert.close(box.top, 0, EPS, 'rect top');
assert.close(box.width, R.width, EPS, 'rect width');
assert.close(box.height, R.height, EPS, 'rect height');
const inner = projectRect({ lat: 3.22, lon: 101.715 }, { lat: 3.21, lon: 101.725 }, R);
assert.ok(inner.width > 0 && inner.height > 0, 'inner rect is positive');

// ── 7. fitFocus — a focus window fills the viewport width and sits centred ──────────────────────
const focus = { north: 3.2225, west: 101.7148, south: 3.2085, east: 101.7253 };
const viewport = { width: 390, height: 534 };
const fit = fitFocus(focus, viewport);
const fw = project({ lat: focus.north, lon: focus.west }, fit.size);
const fe = project({ lat: focus.north, lon: focus.east }, fit.size);
assert.close(fe.x - fw.x, viewport.width, 1e-6, 'focus width fills the viewport');
// the focus centre lands on the viewport centre once the image offset is applied
const centre = project(
  { lat: (focus.north + focus.south) / 2, lon: (focus.west + focus.east) / 2 },
  fit.size,
);
assert.close(centre.x + fit.offset.x, viewport.width / 2, 1e-6, 'focus centre x');
assert.close(centre.y + fit.offset.y, viewport.height / 2, 1e-6, 'focus centre y');
assert.close(fit.size.height / fit.size.width, R.height / R.width, 1e-12, 'aspect preserved');

// ── 8. clampOffset — the raster always covers the window, never leaves a void edge ──────────────
const big = { width: 1000, height: 2000 };
assert.close(clampOffset({ x: 40, y: 40 }, big, viewport).x, 0, EPS, 'clamp right edge x');
assert.close(clampOffset({ x: 40, y: 40 }, big, viewport).y, 0, EPS, 'clamp bottom edge y');
const far = clampOffset({ x: -5000, y: -9000 }, big, viewport);
assert.close(far.x, viewport.width - big.width, EPS, 'clamp left edge x');
assert.close(far.y, viewport.height - big.height, EPS, 'clamp left edge y');
// a centred focus is already legal and must pass through untouched
const centred = clampOffset(fit.offset, fit.size, viewport);
assert.close(centred.x, fit.offset.x, EPS, 'centred offset untouched x');
assert.close(centred.y, fit.offset.y, EPS, 'centred offset untouched y');

// ── 9. ground resolution ────────────────────────────────────────────────────────────────────────
// 512 px across 0.021972° of longitude at 3.21° N ⇒ ~4.77 m/px. Sanity floor for the scale bar.
assert.close(metresPerPixel(R), 4.7697, 1e-3, 'metres per pixel at raster size');
assert.close(metresPerPixel({ width: R.width * 2, height: R.height * 2 }), 4.7697 / 2, 1e-3, '2×');

console.log('geo: ok');
