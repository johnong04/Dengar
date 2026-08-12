# Slice 14 — officer cluster map (real basemap) · gate: hard · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Depends on slice 13 (officer shell + seeded data).

## Oracle
`docs/design/board/officer-d.png` (exceed it — the board's map was hand-drawn; this one is real) +
floors + rubric. Evaluator → up to 2 fix rounds.

## Outcome
`/officer/cluster/[id]` — the screen behind a watch row. officer-d's information architecture, but the
basemap is now the **real bundled OSM raster** of Setapak (COMMON §Maps): `expo-image` (already
installed) renders `app/assets/maps/setapak-osm.png`, and everything else is composed over it.

- **Projection module** (`src/lib/geo.ts`): lat/lon → pixel using the COMMON bounds. Longitude is
  linear; **latitude needs the Mercator formula, not a lerp** — a lerp is visibly wrong across 3.6 km
  and is the kind of error nobody notices until a judge does. Unit-check it: the four corner
  coordinates must map to the four image corners (assert-based check file, like `gating.check.ts`).
- Detection dots from the seeded coordinates, sized and coloured by recency (<24 h / 48 h / 72 h),
  legend as a floating pill.
- Block overlay: the B1–B8 rectangles with B3–B5 hot, drawn in projected coordinates so they sit on
  real streets rather than arbitrary positions.
- Cluster ring around the hot blocks; area labels as floating white pills.
- Bottom sheet: cluster name, `14 / 72 h`, the block chip row (B1–B8 with the hot ones filled), the
  directive `Fog within 48 h` + expiry stamp, and **Acknowledge** → acknowledged state (slice 15).
- `© OpenStreetMap contributors` visible, quiet, always.

Fix while here: officer-d's lower third was empty blocks — dead space. With a real map that space is
now streets, so re-balance the map/sheet split for the 844 viewport.

## What is unrecreatable (why hard)
Video beat 4 ("the map fills") plus the geo projection, which is arithmetic that is either right or
silently, unfalsifiably wrong. The projection check file is the red test — write it first.

## Verification
`npm run check` green (includes the new geo check). Screenshots 390 + 430 →
`docs/loop-eng/screens/14-officer-map*.png`. Confirm: dots land on plausible residential streets (eye
check against the basemap), the corner-projection assertions pass, attribution renders, no horizontal
scroll, sheet actions ≥44px.
