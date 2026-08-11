# Slice 3 — abstain results ×3 · gate: hard · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Oracle (2c)
Reference `docs/design/board/a-abstain.png` (exceed it) + COMMON floors + rubric. Evaluator → up to
2 fix rounds.

## Outcome
`/result` renders the three abstain verdicts from the stub's Verdict param — the most-seen screens
in the real app, each with its own honest readout and its own next move (specs.md §4):

- **no_mosquito** — "No mosquito in this recording." Event score vs floor in mono. Reassure: most
  recordings end here; nothing saved, nothing left the phone.
- **not_confident** — its own copy (not a variant of no_mosquito): a wingbeat was there but the
  call wasn't clean. "Get closer and try again" is the action. MSC max vs 0.70 floor readout.
- **too_noisy** — the environment, not the user, failed. Band-SNR readout vs floor. Action: move
  from the noise source. This is the 67.3%-defense made visible: the instrument refuses rather
  than guesses.

Shared abstain skeleton, differing verdict line + readout rows + guidance. Ink on normal dark
ground — zero red, zero warning styling. Primary action returns to capture; a quiet reveal
transition (240ms, reduced-motion: crossfade).

## What is unrecreatable (why hard)
The product's credibility. A user who hits abstain 7 times in a row and still trusts the app is
the entire citizen-science wager; these three screens carry the board oracle and the §4 rule that
abstain is first-class.

## Hard cases the evaluator will probe
Each reason renders distinct copy and readouts · stub loop: capture→abstain→capture cycles clean ·
readout numbers come from the actual Verdict/RawInference, not hardcoded.
