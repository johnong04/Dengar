# v2-full run — resume state (paused 2026-08-12, API 529 storm)

Branch `john-v1-citizen`. Working tree CLEAN, `npm run check` GREEN (`gating: ok` + `geo: ok`).
Every completed slice is committed. The app is demoable at this commit.

## Done and closed

| Slice | Verdict |
|---|---|
| 11 warmth into law | PASS — verified independently (40/40 doc↔config parity, 87 contrast pairs) |
| 12 warm citizen screens | PASS after 1 fix (pulse rings actually render now) |
| 13 officer Trend home | PASS after 1 fix (every figure derived from 3 area sparklines) |
| 14 officer cluster map | BUILT + committed; **evaluator was mid-run when paused** |
| 17 static-node mode | PASS (smoke) |

## Not started — nothing written, safe to dispatch fresh

- **16 citizen area risk** — plan `docs/loop-eng/plans/16-citizen-map.md`. Died twice to 529 before
  writing any file. `app/src/app/area.tsx` does not exist.
- **19 v3 citizen roadmap** — plan `19-v3-citizen.md`. Died twice to 529. Its partial helper is parked
  at `<scratchpad>/slice19/Roadmap.tsx` (it was moved OUT of `app/src/components/` because it
  referenced non-existent `/roadmap/*` routes and that broke `npm run check` for every other agent —
  a shared red gate is how a real failure gets skimmed).
- **15 officer alert feed + ack** — plan `15-officer-feed.md`. Blocked only by wanting the officer
  files free; they are free now.
- **20 v3 officer roadmap** — plan `20-v3-officer.md`.
- **18 BM/EN toggle** — plan `18-bilingual.md`. MUST run after every screen exists (it moves every
  string behind a lookup).
- **21 final polish** — plan `21-final-polish.md`. Runs last.

## Orchestrator's own task, not a slice

Wire the entry points centrally, once the routes exist: `/node/setup` (already linked from capture),
`/area` (slice 16), `/roadmap/*` (slice 19), `/officer/*`. Two slices both wanted to edit
`app/src/app/index.tsx` for this, which would have raced — so they were told not to, and it is mine.
Typed routes reject a link to a route that does not exist yet, so wire AFTER the screens land.

## Hard-won facts any resuming agent needs

1. **NO new dependencies, ever** — a native module bricks the installed phone dev build until a ~1.5 h
   EAS rebuild. All visualization is composed from `View`s.
2. **react-native-web DROPS `className` on a reanimated `Animated.View`.** Geometry/border/position
   must go on the `style` prop. This shipped invisible for six slices; pattern is in
   `app/src/components/PulseRings.tsx`.
3. **Contrast probes must composite the ANCESTOR CHAIN, not `elementsFromPoint`** — RN-Web sets
   `pointer-events:none` on disabled Pressables and on the drench bands, so the hit-stack lies.
4. **Motion is verified by pixel diff or non-zero computed geometry**, never by sampling transform values.
5. `district.ts` holds ONE hand-written input (three area sparklines); everything else is derived.
   Do not hand-type a figure another figure could contradict.
6. Concurrent agents: own playwright session per agent (`-s=<name>`), never restart the shared dev
   server on :8081, never `git add -A`, stage explicit paths only. The ml/ session commits to this
   same branch (ml/ only, no conflict).
7. Metro on Windows misses a NEW route subdirectory — delete and recreate it rather than restarting.

## Resume command

Dispatch the remaining slices in this order: 16, 19, 15, 20, then 18, then 21. Slices 16/19/15/20 are
mutually independent given the entry-point rule above.
