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

## §Empty gates (checks that ran and found nothing — demote after 3 consecutive empty runs)

- 2026-08-12 v1-citizen: §2 language sweep — ran per-slice ×6 + full sweep in slice 8; **zero hits
  every time.** Makers write §2-clean copy from the COMMON header alone. (1st empty run.)
- 2026-08-12 v1-citizen: horizontal-scroll floor at 430px — never failed (390 caught the one real
  overflow, slice 7's chip). 430 may be redundant alongside 390. (1st empty run.)
- 2026-08-12 v1-citizen: tap-target ≥44px floor — never failed; the register's own metrics clear it
  by construction. (1st empty run.)
- 2026-08-12 v1-citizen: no-red audit on non-aedes surfaces — never failed; COMMON rule 4 held by
  construction across slices 3–8. (1st empty run.)

## Cost gauge (v1-citizen)

Slices ~55–100k subagent tokens each; slice 8 (polish, widest scope) 139k/97 tool-uses — proportional,
not thrash. Evaluators ~70–78k each. One fix cycle total across 4 hard slices. No outliers flagged.
