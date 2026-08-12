# v2-full run — resume state (paused 2026-08-12, API 529 storm)

Branch `john-v1-citizen`. Working tree CLEAN, `npm run check` GREEN (`gating: ok` + `geo: ok`).
Every completed slice is committed. The app is demoable at this commit.

## Done and closed

| Slice | Verdict |
|---|---|
| 11 warmth into law | PASS — verified independently (40/40 doc↔config parity, 87 contrast pairs) |
| 12 warm citizen screens | PASS after 1 fix (pulse rings actually render now) |
| 13 officer Trend home | PASS after 1 fix (every figure derived from 3 area sparklines) |
| 14 officer cluster map | BUILT + committed; **NOT marked PASS** — see below |
| 17 static-node mode | PASS (smoke) |

## Slice 14 — partially verified, do NOT treat as passed

Its evaluator died to a 529 twice without completing. The orchestrator verified the one piece of
load-bearing arithmetic by hand — expected values computed from first principles, not by reusing
`geo.ts`'s own `mercatorY`:

- four corners exact to ≤1e-6 px, all `inside: true`
- mid-latitude **384.0030940005** vs naive lerp **384** → deviation 3.094e-3 px. **Mercator confirmed**;
  a lerp would have returned exactly 384
- round-trip error 4.88e-15 deg
- out-of-bounds (3.30, 101.80) → (2064.0, −1674.1), `inside: false` — extrapolates and flags rather
  than clamping, which is right: a clamped dot sits on the frame edge and reads as real data in the
  wrong place

**Still unverified on slice 14:** contrast table, per-dot ground check (does any dot land on a
carriageway / water / the green reserve / inside Kem Wardieburn), attribution at both viewports across
all three cluster ids, cross-screen figure consistency against the officer home, and rubric grades.
These roll into slice 21's whole-app pass — do not let slice 21 assume they were done.

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

## How to run it (orchestrator protocol — you are the orchestrator, not the implementer)

Engine: `~/.claude/commands/run-plans.md`, mode **hack** per `.claude/loop-eng-profile.md`. Plans live
in `docs/loop-eng/plans/`; read `v2-full-COMMON.md` first, then the slice's own plan.

- **One fresh subagent per slice.** `smoke` → effort medium, build + one happy-path assertion.
  `hard` → effort high, plus its own skeptical screenshot **evaluator** (read-only, own browser
  session, tuned to REFUTE) → **1 fix round** (profile knob, John lowered it from 2) →
  flag-and-continue. Never halt the run; log survivors and move on. Slice 21 is the net.
- **Concurrency rules that were paid for in defects:** each agent gets its own playwright session
  (`-s=<name>`); nobody restarts the shared dev server on :8081; nobody uses `git add -A` (stage
  explicit paths — the ml/ session commits to this same branch); when a slice dies, park its orphan
  files OUT of `app/src/` before dispatching anything else, or the shared `npm run check` goes red for
  everyone and a real failure gets skimmed past.
- **Gate:** `cd app && npm run check` (tsc + gating.check + geo.check). Commit after every slice.
- **Tell each evaluator to MEASURE, not assert.** Contrast composited up the ancestor chain; motion
  proven by non-zero computed geometry plus two visibly-different frames; figures traced numeral by
  numeral to specs.md §9 or shown with arithmetic.
- **API note:** six transient 529s paused this run. Resume-on-failure is normal — `SendMessage` the
  same agent with a state summary rather than restarting the slice. Two agents recovered fully that way.

## Run-end duties (do not skip — these outlive the harness)

1. `docs/loop-eng/retro.md` — BOTH ledgers. §Misses (process failure-modes, one line, promote
   recurring ones into the command docs) and **§Empty gates** (checks that ran and found nothing, with
   cost — same gate empty 3 runs → demote it). A run reporting no empty gates did not look.
2. `docs/loop-eng/evals/2026-08-12-john-v1-citizen/INDEX.md` — one line per finding, marked `real` or
   `noise`, with a runnable case where one exists. **Record noise too** — a case saying "must NOT
   report this" is what stops a re-tuned reviewer getting louder.
3. `docs/loop-eng/runs/2026-08-12-v2-full.md` — run report in the shape of the v1 one.
4. Cost gauge: tokens per slice; an outlier that cost far more *yet passed* is a thrash signal.

**`docs/loop-eng/handoff.md` is gitignored** — durable notes go in THIS file, not there.
