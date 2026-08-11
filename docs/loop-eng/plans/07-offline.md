# Slice 7 — offline indicator + sync queue · gate: smoke · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Outcome
Offline is a feature, not a failure (the airplane-mode shot depends on it reading that way). A quiet
persistent chip (capture status row + history header): offline → `offline · N queued` in mono,
online with pending → brief `syncing N…` then gone. Never a banner, never an alert. Web:
`navigator.onLine` + events; the store's pendingSync drives N; fake a sync (queued→synced after a
few seconds online). Detections always save locally regardless — copy says so at the moment it
matters (a queued chip on a fresh detection, not a lecture).

## Acceptance (one line)
Toggling offline (devtools) flips the chip through all three states without layout shift;
`npm run check` green.
