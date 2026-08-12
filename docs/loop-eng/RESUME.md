# v2-full run — COMPLETE (2026-08-12, session 2)

**11/11 slices shipped and committed. Run report: `docs/loop-eng/runs/2026-08-12-v2-full.md`.**
Nothing below is a pending instruction; it is the state at close. The open items that matter are in
the run report's "Left undone" section — chiefly that **`src/copy/ms.ts` is machine-drafted and unread
by a human**, and that **nothing in this run has been rendered on the physical phone**.

One unpromoted observation from slice 21, recorded rather than treated as law because it was NOT
independently measured: it reported that on this setup a Tailwind spacing class computes to `0px`
unless that exact class string already appears somewhere in the tree (`pl-[30px]` and `pl-8` both
computed 0; `pl-6` worked because other files use it). The likely mechanism is the dev server not
regenerating CSS for a newly-seen class without `--clear`, not a permanent platform rule. **Measure
`getComputedStyle` before trusting a new spacing class, and verify this before writing it down as a
fact** — the last platform "fact" a slice reported this run turned out to be invented.

---

# (historical) resume state — session 2, mid-run

Branch `john-v1-citizen`. `npm run check` GREEN (`gating: ok` + `geo: ok`). Every completed slice is
committed. The app is demoable at this commit.

**10 of 11 slices done.** Slice 18 is IN FLIGHT; slice 21 is the last one.

## Done and closed

| Slice | Verdict |
|---|---|
| 11 warmth into law | PASS — verified independently (40/40 doc↔config parity, 87 contrast pairs) |
| 12 warm citizen screens | PASS after 1 fix (pulse rings actually render now) |
| 13 officer Trend home | PASS after 1 fix (every figure derived from 3 area sparklines) |
| 14 officer cluster map | BUILT + committed; **NOT marked PASS** — see below |
| 15 officer alert feed + ack | PASS (smoke) — acknowledge flow driven live, SPA, no reload |
| 16 citizen area risk | PASS (smoke) |
| 17 static-node mode | PASS (smoke) |
| 19 v3 citizen roadmap | PASS (smoke) |
| 20 v3 officer roadmap | PASS (smoke) |
| entry-point wiring | done (orchestrator's own task, not a slice) — see below |

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
**Slice 15 also introduced a small visual delta to slice 14's shipped cluster screen** — the landmark
pill now flips below its anchor so the taller acknowledged-record sheet cannot push it into the legend.
These roll into slice 21's whole-app pass — do not let slice 21 assume they were done.

## Remaining

- **18 BM/EN toggle** — plan `18-bilingual.md`. IN FLIGHT this session. Widest blast radius in the run;
  `app/src/copy/` is a declared critical path. The real work is BM overflow at 390, not the words.
- **21 final polish** — plan `21-final-polish.md`. Runs last. `hard` gate: evaluator + 1 fix round.
  It is the net for every survivor listed on this page.

## Entry-point wiring — DONE, and the reasoning is load-bearing

`/area` sits in the capture foot beside History as a peer, not a second CTA. Verified live: both links
52 px, SPA navigation (navigation entries === 1), no horizontal scroll at 390.

**Officer and roadmap routes are listed on the BOARD menu (`/board`), deliberately NOT in product nav.**
A citizen screen linking to an officer dashboard breaks the audience separation the design rests on,
and a v3 roadmap screen in product nav implies capability we do not have. The board menu was already
the dev route list, so it was reused rather than adding a `/demo` route. If slice 21 "fixes" this by
adding product links, that is a regression, not a polish.

## Hard-won facts any resuming agent needs

1. **NO new dependencies, ever** — a native module bricks the installed phone dev build until a ~1.5 h
   EAS rebuild. All visualization is composed from `View`s.
2. **react-native-web DROPS `className` on a reanimated `Animated.View`.** Geometry/border/position
   must go on the `style` prop. This shipped invisible for six slices; pattern is in
   `app/src/components/PulseRings.tsx`.
   **Scoped correctly 2026-08-12:** this is about `Animated.View`, NOT about decimal Tailwind classes.
   Slice 20 shipped a comment claiming RN-Web drops escaped-dot classes and renders `h-3.5` at height 0.
   Measured live and refuted: `h-1.5` is 6 px, `mt-1.5` works on the same line, and the bars render
   350×14 with the fill at 135.1 px = 38.6%, exactly the stated share. Comment corrected. A false
   hard-won fact in a shipped comment is how the next agent inherits a bug that does not exist.
3. **Contrast probes must composite the ANCESTOR CHAIN, not `elementsFromPoint`** — RN-Web sets
   `pointer-events:none` on disabled Pressables and on the drench bands, so the hit-stack lies.
4. **Motion is verified by pixel diff or non-zero computed geometry**, never by sampling transform values.
5. `district.ts` holds ONE hand-written input (three area sparklines); everything else is derived.
   Do not hand-type a figure another figure could contradict.
6. Concurrent agents: own playwright session per agent (`-s=<name>`), never restart the shared dev
   server on :8081, never `git add -A`, stage explicit paths only. The ml/ session commits to this
   same branch (ml/ only, no conflict).
7. Metro on Windows misses a NEW route subdirectory — delete and recreate it rather than restarting.
8. **`app/.prettierrc` now exists** (singleQuote, printWidth 100, tailwind plugin). Before it did,
   bare `npx prettier --write` reformatted to double-quote/80-col against a single-quote/100-col tree —
   two agents each burned time working around it privately and neither reported it. Bare prettier is
   now safe. Three pre-existing files are still not prettier-clean (wrap width only); reformatting them
   was deliberately deferred rather than churning the tree mid-run.
9. **Onboarding gates the app.** To reach any route in a fresh browser session, set
   `localStorage['dengar.onboarded'] = '1'`.
10. **Do not park orphan files in the session scratchpad** — it is session-scoped and they vanish.
    Slice 19's parked helper was gone this session and the slice was rebuilt from scratch. Park under a
    gitignored path inside the repo, or accept the rebuild and say so here rather than promising a file.

## Figure consistency — one app, one number

Slices 19 and 20 both show the citizen-science vs ovitrap cost gap. Both print the exact quotient
**7.6×** and name §9's rounded "8×" beside it. Do not let a later slice round it back — one app must
not carry two numbers for one fact. Slice 19 also **omits cases-averted** with the reason printed
where the number would go (§9 has no detection→case-prevented efficacy figure); slice 20's dispatch
headline is a **ratio (2.6×) not an absolute** for the same reason. Both omissions are deliberate and
protect the submission.

## How to run it (orchestrator protocol — you are the orchestrator, not the implementer)

Engine: `~/.claude/commands/run-plans.md`, mode **hack** per `.claude/loop-eng-profile.md`. Plans live
in `docs/loop-eng/plans/`; read `v2-full-COMMON.md` first, then the slice's own plan.

- **One fresh subagent per slice.** `smoke` → effort medium, build + one happy-path assertion.
  `hard` → effort high, plus its own skeptical screenshot **evaluator** (read-only, own browser
  session, tuned to REFUTE) → **1 fix round** (profile knob, John lowered it from 2) →
  flag-and-continue. Never halt the run; log survivors and move on. Slice 21 is the net.
- **Agents do NOT commit** (changed this session): four parallel agents racing on `index.lock` is a
  needless failure mode. Agents report explicit file paths; the orchestrator stages those paths and
  commits per slice. This also kept every commit message honest about what the slice actually did.
- **Concurrency rules that were paid for in defects:** each agent gets its own playwright session
  (`-s=<name>`); nobody restarts the shared dev server on :8081; when a slice dies, park its orphan
  files OUT of `app/src/` before dispatching anything else, or the shared `npm run check` goes red for
  everyone and a real failure gets skimmed past.
- **Gate:** `cd app && npm run check` (tsc + gating.check + geo.check). Commit after every slice.
- **Tell each evaluator to MEASURE, not assert.** Contrast composited up the ancestor chain; motion
  proven by non-zero computed geometry plus two visibly-different frames; figures traced numeral by
  numeral to specs.md §9 or shown with arithmetic.
- **API note:** six transient 529s paused the first session. Resume-on-failure is normal —
  `SendMessage` the same agent with a state summary rather than restarting the slice. Two agents
  recovered fully that way. Session 2 saw zero 529s across five agents.

## Run-end duties (do not skip — these outlive the harness)

1. `docs/loop-eng/retro.md` — BOTH ledgers. §Misses (process failure-modes, one line, promote
   recurring ones into the command docs) and **§Empty gates** (checks that ran and found nothing, with
   cost — same gate empty 3 runs → demote it). A run reporting no empty gates did not look.
   *Two session-2 misses are already appended; more are owed at run end.*
2. `docs/loop-eng/evals/2026-08-12-john-v1-citizen/INDEX.md` — one line per finding, marked `real` or
   `noise`, with a runnable case where one exists. **Record noise too** — a case saying "must NOT
   report this" is what stops a re-tuned reviewer getting louder.
3. `docs/loop-eng/runs/2026-08-12-v2-full.md` — run report in the shape of the v1 one.
4. Cost gauge: tokens per slice; an outlier that cost far more *yet passed* is a thrash signal.
   Session 2 so far: 16 → 152k, 19 → 143k, 15 → 169k, 20 → 170k. No outliers.

**`docs/loop-eng/handoff.md` is gitignored** — durable notes go in THIS file, not there.
