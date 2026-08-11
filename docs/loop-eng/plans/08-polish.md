# Slice 8 — critique + polish pass · gate: hard (its own 2 fix cycles) · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Outcome
The quality round over everything slices 1–7 built. Not new features — repair and refinement.

1. **Invoke `impeccable:impeccable` critique** across all v1 screens (capture idle+listening,
   4 verdicts, history full+empty, onboarding, offline states) at 390×844 AND 430×932.
2. **Measure the floors** on every screen: AA contrast on actual painted backgrounds (compute, don't
   eyeball), no horizontal scroll, tap targets ≥44px, reduced-motion paths exist, copy vs the plan
   set diff = 0, §2 language sweep over every string (grep for scan/nearby/ambient/detect—the
   banned framings).
3. **Grade the rubric** (design-system.md §Rubric axes) per screen, 1–5, evidence per score.
4. **Fix everything fixable within 2 bounded rounds**, re-screenshot after each.
5. **Deliverables:** final screenshot set `docs/loop-eng/screens/final/` (every screen, both
   viewports) · `docs/loop-eng/handoff.md` updated with per-axis grades, what was fixed, what was
   flagged-unfixed and why · design-system.md updated if any token legitimately moved (law follows
   built reality, with a dated note).

## What is unrecreatable (why hard)
The morning review IS this deliverable — John wakes to the screenshot set + grades and decides
next steps from it. A polish pass that silently skipped screens forfeits the run's whole point.
