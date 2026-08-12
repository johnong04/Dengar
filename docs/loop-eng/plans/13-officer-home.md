# Slice 13 — officer shell + Trend home · gate: hard · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first.

## Oracle
`docs/design/board/officer-e.png` (exceed it) + John's two amendments + floors + rubric.
Evaluator → up to 2 fix rounds.

## Outcome
The officer surface exists as a real route group, visually unmistakable from the citizen app: light
ground, cool panels, cobalt, dense. `/officer` is the Trend home from officer-e.

Structure: district header (name + date/time stamp) · three KPI cells with delta pills (detections
today vs yesterday, active clusters, nodes reporting) · **the directive strip** · the 14-day chart ·
the hour×day heat grid · sparkline watch rows (tap → cluster detail, slice 14).

The chart is the slice's centre and the pitch as a shape: rising detection bars, the rainfall series
behind them at its own scale, a `today` rule, then **hollow ghost bars at +14…+21 days** for the
clinical cases that trigger fogging under the status quo, with a bracket labelled `14–21 d`. Composed
from Views only (no chart library — COMMON rule 1). Label the ghost series so nobody reads it as
measured data.

**John's two amendments, both required:**
1. **More CTA emphasis on the directive** — borrow officer-f's directive weight (it was a wide cobalt
   button-card, the strongest of the three). A nudge, not a drench: the directive should be the
   obvious next action without becoming the whole screen.
2. **Remove the red left-edge stripe** on the directive card — a coloured border-left >1px as an
   accent is a banned pattern. Use a full border, a tint, a leading state dot, or nothing.

Data: one seeded module (`src/data/district.ts`) holding the 14-day series, rainfall, heat grid,
watch areas and the cluster — shared with slices 14/15/16 and the citizen map. Mark the surface
`simulated` per COMMON rule 8.

## What is unrecreatable (why hard)
This is video beat 5 — the frame where the project stops being "we can hear mosquitoes" and becomes
"this changes what a district does." It also establishes the officer language for every later officer
screen.

## Verification
`npm run check` green. Screenshots at 390 and 430 → `docs/loop-eng/screens/13-officer-home*.png`.
Measure: contrast on every text-on-tint pair (the round-2 agent found two real failures at ~4.0–4.5:1
in tinted pills — re-check yours), no horizontal scroll, prose word count ≤ ~40 on the whole screen
(the round-1 rejection was verbosity; hold the line), tap targets ≥44px, and that a citizen screen and
this screen placed side by side are not confusable.
