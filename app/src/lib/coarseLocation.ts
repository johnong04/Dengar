import { useEffect, useState } from 'react';

/**
 * Coarse location for the result screen (specs §5 v1: "species, confidence, timestamp, coarse
 * location"). Web-first and dependency-free: `navigator.geolocation` is in every browser, so the
 * laptop demo shows a REAL fix with no native module and no EAS rebuild. `expo-location` was
 * deliberately not installed for this.
 *
 * ROUNDING IS THE POINT, not a formatting choice. Coordinates are truncated to 3 decimal places
 * before anything can read them — ~111 m at this latitude, i.e. the same block-level coarseness
 * `/area` claims and enforces. The precise fix never reaches state, so it cannot leak into a
 * screen, a log or a stored detection later. If a future version needs finer precision it has to
 * change THIS file, which is the file a reviewer will look at.
 *
 * On native (no `navigator.geolocation`) this reports `unavailable` and the caller falls back to
 * the seeded area name — never to a fabricated coordinate.
 */

export type CoarseFix =
  | { state: 'pending' }
  | { state: 'ok'; lat: number; lon: number }
  | { state: 'denied' }
  | { state: 'unavailable' };

const PLACES = 3; // ~111 m — block level, matching the /area privacy claim
const round = (n: number) => Math.round(n * 10 ** PLACES) / 10 ** PLACES;

export function useCoarseLocation(): CoarseFix {
  const [fix, setFix] = useState<CoarseFix>({ state: 'pending' });

  useEffect(() => {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
    if (!geo) {
      setFix({ state: 'unavailable' });
      return;
    }
    let live = true;
    geo.getCurrentPosition(
      (p) => {
        if (!live) return;
        setFix({ state: 'ok', lat: round(p.coords.latitude), lon: round(p.coords.longitude) });
      },
      // Any failure is reported as denied rather than retried: a result screen that keeps asking
      // for a fix is worse than one that quietly says the location is off.
      () => live && setFix({ state: 'denied' }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
    return () => {
      live = false;
    };
  }, []);

  return fix;
}

/** `3.217, 101.717` — always the rounded pair, never a raw fix. */
export const formatFix = (lat: number, lon: number) =>
  `${lat.toFixed(PLACES)}, ${lon.toFixed(PLACES)}`;
