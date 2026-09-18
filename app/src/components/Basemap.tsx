/**
 * THE MAP GROUND — native. The bundled OSM raster, unchanged.
 *
 * `react-native-maps` is installed and in the EAS build but inert until Google billing is enabled,
 * and the phone is the secondary target for this deliverable. When that changes, this file is the
 * whole migration: the screens above it only ever see `Basemap`.
 *
 * The browser gets `Basemap.web.tsx` — live vector tiles at the identical scale and centre.
 */
export { BasemapRaster as Basemap, MAP_ATTRIBUTION } from './BasemapRaster';
export type { BasemapProps } from './BasemapRaster';
