# Slice 4 — detected result (red drench) · gate: hard · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Oracle (2c)
Reference `docs/design/board/c-detected.png` (exceed it) + COMMON floors + rubric. Evaluator → up to
2 fix rounds.

## Outcome
The verdict screen — the video's uncuttable frame. On `kind: 'detected'` with species `aedes`, the
surface drenches verdict-red; "Aedes." verdict type, confidence + floor in mono, the
fourteen-detections/72h line, white primary action.

- **Detail fields are per-field optional** (specs.md §4): render taxon/sex/gravid rows only when
  present in `verdict.detail`; the screen must read complete with zero detail (stub drops it 30%
  of the time — screenshot BOTH states).
- **`not_aedes` detection is NOT red**: quiet ground, "Not a dengue vector" framing, log action.
  Red is rationed to Aedes alone (COMMON rule 4).
- Verdict reveal: 240ms drench-in (reduced-motion: crossfade). "Log detection" appends to the
  store (visible in history + footer count); "Discard" returns to capture, stores nothing.

## What is unrecreatable (why hard)
Writes to the detection store (the record a user cannot re-produce — the mosquito is gone), and
carries the board oracle for the single most important frame in the 8-minute video.

## Hard cases the evaluator will probe
Full-detail vs no-detail both compose · not_aedes never shows red · Log writes exactly one record ·
Discard writes none · confidence renders from the Verdict, not hardcoded.
