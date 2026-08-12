# Loop-eng retro — Dengar

## §Misses (process/verification failure-modes, one line each)

- 2026-08-12 v1-citizen: **planner wrote a self-contradicting plan** — 03-abstain.md forbade touching
  the inference seam AND demanded real pipeline numbers in the same file; the maker obeyed the
  constraint, the evaluator flagged the hard case, and a fix cycle was spent resolving what planning
  should have caught. Fix pattern: when a plan constrains a seam, the planner must check the plan's
  own acceptance can be met without crossing it.
- 2026-08-12 v1-citizen: **tailwind arbitrary-value fonts fail silently** (`font-[IBMPlexSans_700Bold]`
  → underscore becomes a space → fallback font renders, nothing errors). Cost one board re-shoot.
  Promoted: COMMON.md rule 6 now bans arbitrary font classes; config tokens only.
- 2026-08-12 v1-citizen: **design-system doc drifted from tailwind config within one run** (drench
  family lived only in config until slice 8). If a token is born mid-run, the doc update belongs to
  the slice that births it, not the polish pass.

- 2026-08-12 v2-full: **`elementsFromPoint` alone under-reports contrast on react-native-web.** RN-Web
  sets `pointer-events:none` on a disabled `Pressable`, so the element drops out of the hit-stack and
  its text measures as a bogus 1:1 bg-on-bg — 3 false failures before the maker unioned the point-stack
  with the element's ancestor chain and ordered by DOM depth. Promoted: any contrast probe on this
  stack composites the ANCESTOR CHAIN, not the hit-stack.
- 2026-08-12 v2-full: **a seeded-data module is a correctness surface, not fixtures.** Slice 13
  hand-typed KPI deltas, heat-grid values and watch-area counts beside a trend series, and four groups
  contradicted each other in one frame (heat grid said 10 detections today, chart and KPI said 6).
  Prose ("figures only from specs §9") cannot catch self-inconsistency because every number was
  individually plausible. Fix pattern: ONE base array, everything else derived in code. Census-test
  candidate if it recurs: assert cross-consistency of any seeded dataset rendered in more than one view.
- 2026-08-12 v2-full: **measuring an animation's VALUES is not measuring whether it renders.** The capture
  pulse never painted (className dropped on a reanimated Animated.View → width/height 0), yet slice 2's
  evaluator "verified" it by sampling scale and opacity mid-flight, slice 8's polish pass re-confirmed it,
  and slice 12's maker rewrote its docstring to assert motion was law. Three passes, all reading the
  animated transform instead of the painted box. Promoted: a motion floor requires (1) non-zero computed
  geometry on the animated element and (2) two screenshots at different phases that visibly differ.

- 2026-08-12 v2-full: **an untracked orphan file can red-line the shared gate for every concurrent
  agent.** A dead slice left `components/Roadmap.tsx` referencing routes it never created; Expo typed
  routes rejected it, so `npm run check` failed for two unrelated makers, who each spent a step
  diagnosing "not mine". A shared red gate is how a real failure gets skimmed past. Promoted: when a
  slice dies, the orchestrator parks its orphans OUT of the source tree before dispatching anything else.
- 2026-08-12 v2-full: **transient API failures are survivable at zero work-loss, and the reason is
  per-slice commits plus explicit-path staging.** Five 529s: two agents lost mid-build recovered fully
  by resume-with-state-summary, three died before writing and cost only wall-clock. The context-reset
  design was built for token limits; it turns out to be the same mechanism that makes server errors
  cheap. Corollary learned the hard way: my first hypothesis (concurrency was provoking them) was
  refuted when one hit with 2 agents running — do not attribute infrastructure noise to a controllable
  cause without evidence.

- 2026-08-12 v2-full: **parking orphan files in the session scratchpad loses them.** RESUME.md told
  the next session slice 19's partial helper was parked at `<scratchpad>/slice19/Roadmap.tsx`; the
  scratchpad is session-scoped, so it was gone and the slice was rebuilt from scratch. The
  park-outside-`app/src/` protocol is right, the destination was wrong — park under a gitignored path
  INSIDE the repo, or accept the rebuild and say so in RESUME rather than promising a file.
- 2026-08-12 v2-full: **a formatter with no config file is a shared-gate hazard.** Two concurrent
  agents each discovered independently that bare `npx prettier --write` reformats to double-quote/80-col
  against a single-quote/100-col tree, and each hand-passed flags to work around it. Nobody reported it
  as a defect because nobody's own slice went red. Fixed by committing `app/.prettierrc`. Class of miss:
  a hazard every agent routes around privately is invisible to the run — the orchestrator only sees it
  when two reports mention the same workaround.

- 2026-08-12 v2-full s2: **a subagent's stated cause can be wrong while its result is right.** Slice 20
  fixed a zero-height bar and shipped a comment blaming react-native-web for dropping escaped-dot
  Tailwind classes. Measured: `h-1.5` is 6px, the bars render exactly as claimed — the fix was right,
  the diagnosis invented. It was one step from entering RESUME.md as a hard-won fact and taxing every
  future agent. Promoted: the orchestrator measures any NEW platform fact before promoting it to law;
  a fact that contradicts a working measurement is a finding, not a lesson.
- 2026-08-12 v2-full s2: **the §2 language sweep passed in English and failed in Malay.** `tinjauan`
  reads as "survey" where the English "outlook" does not breach. Every prior run's §2 sweep was
  monolingual by construction and therefore proved less than it appeared to. Promoted: sweep every
  shipped language, not the source language.
- 2026-08-12 v2-full s2: **parallel dispatch of 4 mutually-independent slices worked with zero
  conflicts** — but only after moving `git commit` from the agents to the orchestrator. Agents report
  explicit paths; the orchestrator stages and commits. Four agents racing on `index.lock` is a failure
  mode with no upside, and the orchestrator writing the message is what kept each commit honest about
  what the slice actually did (including its unverified parts).

## §Empty gates (checks that ran and found nothing — demote after 3 consecutive empty runs)

- 2026-08-12 v1-citizen: §2 language sweep — ran per-slice ×6 + full sweep in slice 8; **zero hits
  every time.** Makers write §2-clean copy from the COMMON header alone. (1st empty run.)
- 2026-08-12 v1-citizen: horizontal-scroll floor at 430px — never failed (390 caught the one real
  overflow, slice 7's chip). 430 may be redundant alongside 390. (1st empty run.)
- 2026-08-12 v1-citizen: tap-target ≥44px floor — never failed; the register's own metrics clear it
  by construction. (1st empty run.)
- 2026-08-12 v1-citizen: no-red audit on non-aedes surfaces — never failed; COMMON rule 4 held by
  construction across slices 3–8. (1st empty run.)

- 2026-08-12 v2-full s2: §2 language sweep (ENGLISH) — ran per-slice ×5, zero hits again. (2nd empty
  run.) **But the Malay sweep found one on its first outing** — so the gate is not empty, it was
  under-scoped. Do not demote on the English count.
- 2026-08-12 v2-full s2: tap-target ≥44px — never failed across 19 route/states. (2nd empty run.)
- 2026-08-12 v2-full s2: **430px viewport — REVERSES v1's demote-candidate note.** v1 called it
  possibly redundant alongside 390. Session 2 found a 430-only defect 390 could not see: `fitFocus`
  scales by width alone, so a fixed-height map box framed correctly at 390 and sliced the
  neighbourhood outline off at 430. The gate earned its place; keep it.

## Cost gauge (v1-citizen)

Slices ~55–100k subagent tokens each; slice 8 (polish, widest scope) 139k/97 tool-uses — proportional,
not thrash. Evaluators ~70–78k each. One fix cycle total across 4 hard slices. No outliers flagged.
