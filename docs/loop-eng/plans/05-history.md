# Slice 5 — history · gate: smoke · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Outcome
`/history`: the citizen's own log, instrument register. List from the store (newest first): species
+ sex when known, confidence (mono), time, coarse location, sync state (`queued` chip when
pendingSync). Aedes entries get a small alert-red dot — the one red allowed outside the drench.
Tapping an entry: inline expand (no modal) with the full readout rows. Empty state teaches: "Your
detections build your district's map" + capture CTA. Entry point from capture footer works both ways.

## Acceptance (one line)
Log from slice 4 → appears here with correct fields; empty state renders when store cleared;
`npm run check` green.
