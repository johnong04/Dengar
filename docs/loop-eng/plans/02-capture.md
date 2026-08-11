# Slice 2 — capture screen · gate: hard · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Oracle (2c)
Reference `docs/design/board/a-capture.png` (exceed it) + COMMON floors + rubric. Evaluator → up to
2 fix rounds.

## Outcome
The app's home: the instrument, live. Board sketch becomes a working capture flow against the stub.

**Idle:** concentric-ring Listen button (a-capture), status row (mic ready · on-device), headline
"Identify the mosquito that found you", 10cm/glass guidance, instrument spec line, history footer
from the store. **The rings breathe** — the design-system pulse (1.6s, scale 1→1.12, opacity
.35→0, reanimated). Reduced-motion: static ring + subtle opacity shift.

**Listening (on press):** 5.0s countdown (mono, tenths), live level meter — web: real
getUserMedia amplitude if a mic exists, else simulated envelope; the meter component takes a values
stream so the real native source plugs in later. Ring pulse tightens. Cancel affordance.

**Handoff:** at 0.0s call `classify()` (stub) with a silent 80000-sample Float32Array, show a brief
analyzing state (~320ms latency is real), navigate to `/result` carrying the Verdict. All four
outcomes must route correctly.

## What is unrecreatable (why hard)
Nothing stored — `hard` because this is the app's signature screen and the video's second-most
important frame; it carries the board oracle.

## Hard cases the evaluator will probe
Countdown reaches exactly 0.0 · cancel mid-recording returns to idle cleanly · double-tap doesn't
start two sessions · reduced-motion path exists.
