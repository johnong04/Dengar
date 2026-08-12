# Slice 11 — warmth into law · gate: hard · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first.

## Oracle
`docs/design/board/warm-{capture,abstain,detected}.png` (the approved direction) + John's refinement
brief in design-system.md §Gate 2 + contrast floors. Evaluator → up to 1 fix round.

## Outcome
The warm citizen language becomes law: `docs/design/design-system.md` tokens table rewritten and
`app/tailwind.config.js` updated to match, so every later slice inherits it for free. **No screens
change in this slice** — that is slice 12. This is the palette + type + surface vocabulary only.

Extract from the three warm board files (`app/src/app/board/warm-*.tsx`) and **refine per John's
note — the direction is approved, the specific hues are not**:
- Keep: warm ink / warm muted (the largest single warmth gain), filled grouped surfaces at radius 20
  instead of hairline rules, mono restricted to numbers, the gradient drench, the raised/recessed
  two-level depth, warm-white primary action instead of pure white.
- Refine: the amber block read muddy-brown over near-black — the tint is too dark and too yellow.
  Aim for *warm light on a dark instrument*, not coloured plastic. Same judgement on the mint.
  Consider lower-opacity tints of a cleaner hue, or carrying warmth in the text tone with a much
  subtler ground. Commit to values; do not ship three options.
- Name every token (`ink-warm`, `muted-warm`, `surface-raised`, `tint-guide`, `tint-trust`, drench
  gradient stops, …) — screens must never write a raw hex again.
- Delete dead tokens from both files (`faint` at 3.47:1 is below AA and was already dropped in
  practice; the `verdict-quiet` family is unused in v1 — keep only if slice 12+ has a use).

Also in this slice: the design-system doc gets the **officer light-ground tokens** it already lists
promoted into `tailwind.config.js` under an `o-` prefix (or equivalent) so officer slices have named
tokens too, plus the officer type decision (Inter vs Plex — officer-e/d used Plex Mono for numbers;
commit to one and record it).

## What is unrecreatable (why hard)
This file is law for ~21 remaining screens. A muddy palette here poisons every one of them, and the
cost is discovered only at the final polish pass. Get it right before anything consumes it.

## Verification
`npm run check` green. Build ONE throwaway probe route rendering every token as a labelled swatch on
both grounds (`/board/tokens`), screenshot it at 390×844, and MEASURE every text-on-surface pair's
contrast from computed styles — report the table. The probe route is a deliverable, not a test
artifact: later slices and the evaluator use it.
