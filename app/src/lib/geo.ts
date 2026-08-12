/**
 * lat/lon → pixel projection for the ONE bundled basemap raster.
 *
 * `app/assets/maps/setapak-osm.png` — 512×768, OpenStreetMap zoom 15, stitched from 2×3 z15 tiles
 * (tile x 25642…25643, tile y 16090…16092). Bounds are those tile edges exactly, which is why the
 * four corners project to the four image corners to machine precision.
 *
 * design-system.md §Maps is the law this file implements: **linear in longitude, Web-Mercator in
 * latitude.** A map LIBRARY is banned (native module → 1.5 h EAS rebuild, needs network for tiles,
 * and specs §7's uncuttable shot is in airplane mode), so this is the whole map engine: 40 lines of
 * arithmetic and `src/lib/geo.check.ts`, which is the only thing that can tell you it is wrong.
 *
 * Nothing here knows about React, tokens or screens. It emits numbers.
 */

export type LatLon = { lat: number; lon: number };
export type Bounds = { north: number; west: number; south: number; east: number };
export type Size = { width: number; height: number };
export type Point = { x: number; y: number };

/** A projected point. `inside` is false when the coordinate lies outside `bounds` — see `project`. */
export type Projected = Point & { inside: boolean };

/** design-system.md §Maps. Exact z15 tile edges — do not round these. */
export const SETAPAK_BOUNDS: Bounds = {
  north: 3.228271,
  west: 101.711426,
  south: 3.195364,
  east: 101.733398,
};

/** The raster's intrinsic pixel size. Any other size is a uniform scale of it. */
export const SETAPAK_RASTER: Size = { width: 512, height: 768 };

/** Attribution is a licence obligation on every surface that renders the raster, not decoration. */
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';

const EARTH_CIRCUMFERENCE_M = 40075016.686;
const DEG = Math.PI / 180;

/**
 * Normalised Web-Mercator y for a latitude: 0 at the north pole, 1 at the south, y-down.
 *
 * NOT a linear function of latitude. `asinh(tan φ)` is the Mercator ordinate; dividing by π and
 * folding to 0…1 gives the same number a slippy-map tile grid uses.
 */
export function mercatorY(lat: number): number {
  return (1 - Math.asinh(Math.tan(lat * DEG)) / Math.PI) / 2;
}

/** Inverse of `mercatorY`. */
export function mercatorLat(y: number): number {
  return Math.atan(Math.sinh((1 - 2 * y) * Math.PI)) / DEG;
}

/**
 * Project a coordinate into pixels within an image of `size` showing `bounds`.
 *
 * CONTRACT — out of bounds is NOT clamped. x/y extrapolate continuously past the edges and
 * `inside` is false. Clamping was rejected deliberately: a clamped dot sits ON the frame edge and
 * reads as real data at the wrong place, whereas an extrapolated one is visibly off-screen.
 * Callers that must not paint outside the raster clip the container or skip on `inside`.
 */
export function project(p: LatLon, size: Size, bounds: Bounds = SETAPAK_BOUNDS): Projected {
  const x = ((p.lon - bounds.west) / (bounds.east - bounds.west)) * size.width;
  // Latitude is NOT a lerp between the bounds — it is normalised between their *Mercator* y values.
  const top = mercatorY(bounds.north);
  const y = ((mercatorY(p.lat) - top) / (mercatorY(bounds.south) - top)) * size.height;
  return {
    x,
    y,
    inside:
      p.lon >= bounds.west &&
      p.lon <= bounds.east &&
      p.lat <= bounds.north &&
      p.lat >= bounds.south,
  };
}

/** Inverse of `project`. */
export function unproject(pt: Point, size: Size, bounds: Bounds = SETAPAK_BOUNDS): LatLon {
  const lon = bounds.west + (pt.x / size.width) * (bounds.east - bounds.west);
  const top = mercatorY(bounds.north);
  const lat = mercatorLat(top + (pt.y / size.height) * (mercatorY(bounds.south) - top));
  return { lat, lon };
}

/** North-west + south-east corner → an absolute-position box. */
export function projectRect(
  nw: LatLon,
  se: LatLon,
  size: Size,
  bounds: Bounds = SETAPAK_BOUNDS,
): { left: number; top: number; width: number; height: number } {
  const a = project(nw, size, bounds);
  const b = project(se, size, bounds);
  return { left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y };
}

/**
 * Fit a geographic focus window to a viewport: the focus spans the viewport's full width, and its
 * centre sits at the viewport's centre.
 *
 * Returns the size to render the raster at and the offset to place its top-left corner within the
 * viewport (normally negative — the image is larger than the window and overflows on every side).
 * Project into `size`, then add `offset`, to get viewport coordinates.
 */
export function fitFocus(
  focus: Bounds,
  viewport: Size,
  bounds: Bounds = SETAPAK_BOUNDS,
  raster: Size = SETAPAK_RASTER,
): { size: Size; offset: Point; scale: number } {
  const focusFraction = (focus.east - focus.west) / (bounds.east - bounds.west);
  const scale = viewport.width / (focusFraction * raster.width);
  const size = { width: raster.width * scale, height: raster.height * scale };
  const centre = project(
    { lat: (focus.north + focus.south) / 2, lon: (focus.west + focus.east) / 2 },
    size,
    bounds,
  );
  return {
    size,
    offset: { x: viewport.width / 2 - centre.x, y: viewport.height / 2 - centre.y },
    scale,
  };
}

/**
 * Keep a rendered raster covering its viewport: the image may never pull an edge inside the window,
 * because the gap would paint as an empty rectangle that reads as "no data here".
 *
 * `fitFocus` stays pure (it always centres); this is the separate, deliberate compromise applied
 * when the requested focus sits near a bounds edge — the view slides back rather than showing void.
 */
export function clampOffset(offset: Point, size: Size, viewport: Size): Point {
  return {
    x: Math.min(0, Math.max(viewport.width - size.width, offset.x)),
    y: Math.min(0, Math.max(viewport.height - size.height, offset.y)),
  };
}

/**
 * Ground resolution in metres per pixel at the bounds' mid-latitude — the scale bar's only source.
 * Derived, never typed by hand: `metresPerPixel × barPixels` is what the bar is allowed to claim.
 */
export function metresPerPixel(size: Size, bounds: Bounds = SETAPAK_BOUNDS): number {
  const midLat = (bounds.north + bounds.south) / 2;
  const metres = ((bounds.east - bounds.west) / 360) * EARTH_CIRCUMFERENCE_M * Math.cos(midLat * DEG);
  return metres / size.width;
}
