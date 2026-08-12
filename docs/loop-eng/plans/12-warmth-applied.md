# Slice 12 — warmth applied to the v1 citizen screens · gate: hard · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Depends on slice 11 (tokens are law).

## Oracle
`docs/design/board/warm-{capture,abstain,detected}.png` for language; `docs/loop-eng/screens/final/*`
for content parity (nothing may be lost). Floors + rubric. Evaluator → up to 1 fix round.

## Outcome
Every shipped v1 citizen screen is repainted in the slice-11 law. **Behaviour, copy and numbers do not
change** — this is a visual pass. Screens: capture (idle / listening / analyzing), result
(aedes drench / not_aedes / 3 abstains), history (list / expanded / empty), onboarding (4 beats +
denied), the sync chip in both locations.

Carry over from the warm board specifically:
- the filled saturated instrument disc + halo rings on capture, replacing hairline rings
- readouts grouped in a filled surface with a fill-track under the gating number, so the score is
  *seen* not parsed
- the privacy line promoted out of the paragraph into its own trust block (this was the single best
  move on the warm board — abstain is 90% of what users see)
- gradient drench + raised/recessed depth on the detected screen
- mono demoted to numbers only; prose in warm plex at generous sizes

Clear these known items while in here (from `docs/loop-eng/handoff.md`): the dead gap between
guidance and footer on capture; the history expanded row duplicating the collapsed confidence; the
onboarding kicker-on-every-beat cadence (banned-adjacent eyebrow grammar — vary it).

## What is unrecreatable (why hard)
These are the screens on camera. The board is approved but a board is three static frames; this pass
is where the language either holds across ten screens and five states or falls apart.

## Verification
`npm run check` green. Re-shoot the FULL set into `docs/loop-eng/screens/final/` (overwrite — the old
cold set is superseded; git history keeps it). Every screen at 390, the three board-gated ones also at
430. Measure contrast on everything recoloured. Confirm no behaviour regression: one live loop
capture → verdict → log → history shows the record.
