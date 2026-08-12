# Slice 19 — v3 citizen roadmap screens · gate: smoke · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Citizen warm language, no new register.

## Outcome
specs §5 v3, citizen side. **Frontend only, framed as roadmap, and the framing is not optional** —
these screens describe capability we do not have, so each carries a quiet `roadmap` marker and the
video narration says so (specs §13 rule 3).

Three screens under `/roadmap/`:
1. **Privacy / federated learning status** — "your audio never left this device" as a stated fact with
   the local-training indicator and an encrypted-update log (timestamps, sizes, `sent: model update
   only`). This is the screen that makes the airplane-mode shot legible as an architecture rather
   than a trick.
2. **Fine-grained detection explainer** — species + sex + gravid, with *why this matters*: only
   females bite; only blood-fed females transmit. The `detail` fields already exist optionally in the
   contract (specs §4) — render the full version here from seeded data and label it roadmap.
3. **Impact dashboard** — detections contributed, area covered, and estimated cases averted. **Every
   figure here is `[modeled]` and must show its arithmetic** on screen or be omitted (specs §9). If a
   number cannot be derived from §9, do not display it — a fabricated impact stat is the single most
   disqualifying thing this app could show. Prefer contributed-detections (real, from the store) as
   the headline and derived estimates clearly marked below.

## Acceptance (one line)
Three screens render in the warm citizen language, each with a visible roadmap marker, every modeled
figure showing its derivation or absent; screenshots `19-v3-{privacy,detail,impact}.png`;
`npm run check` green.
