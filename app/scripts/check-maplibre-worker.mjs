/**
 * The vendored maplibre worker must match the installed package. `node scripts/check-maplibre-worker.mjs`
 *
 * `public/maplibre/*` is a byte copy of two files out of `node_modules/maplibre-gl/dist`. It exists
 * because maplibre spawns an ES-module Web Worker and resolves its URL against the document — and
 * Metro cannot serve that worker: it would re-transform an already-bundled ESM file, and the worker
 * imports its 500 kB shared chunk by a relative path Metro does not honour. Expo serves `public/`
 * verbatim at the web root, in dev and in a static export alike, so the copy goes there.
 *
 * The failure this file exists to prevent is silent and specific: bump `maplibre-gl`, and the
 * bundled main thread and the stale vendored worker disagree about the wire format between them.
 * Tiles then fail to parse and the map renders as an EMPTY PANEL with nothing in the console —
 * which, on a screen whose whole job is to look like a real map, is the worst kind of broken.
 *
 * Plain .mjs rather than .ts on purpose: the RN tsconfig does not include node types, so a
 * TypeScript file here cannot legally read the filesystem. See the same note in `geo.check.ts`.
 */
import { readFileSync } from 'node:fs';

const FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

for (const f of FILES) {
  const installed = readFileSync(`node_modules/maplibre-gl/dist/${f}`);
  const vendored = readFileSync(`public/maplibre/${f}`);
  if (!installed.equals(vendored)) {
    throw new Error(
      `public/maplibre/${f} is stale — it does not match node_modules/maplibre-gl/dist/${f}.\n` +
        `Re-copy BOTH files:\n` +
        `  cp node_modules/maplibre-gl/dist/maplibre-gl-{worker,shared}.mjs public/maplibre/\n` +
        `The browser map renders EMPTY until you do.`,
    );
  }
}

console.log('maplibre worker: ok');
