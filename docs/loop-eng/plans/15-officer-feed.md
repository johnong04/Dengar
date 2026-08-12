# Slice 15 — officer alert feed + dispatch acknowledgement · gate: smoke · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Depends on slices 13–14.

## Outcome
Closes the officer loop: an alert list, and what happens after Acknowledge.

- `/officer/alerts` — the full feed the home's watch rows summarise. Rows in the officer register:
  area, count/window, a sparkline, recency dot, state (`directive issued` / `acknowledged` /
  `watch`). Tap → the cluster screen. Filter chips (all / active / acknowledged) are enough; no search.
- **Acknowledged state** on the cluster sheet: after Acknowledge, the directive becomes a record —
  who acknowledged, when, the 48 h deadline as a countdown, and a quiet "fogging scheduled" line.
  This is the specs §5 v2 "dispatch acknowledgement" beat and it must feel like signing a record, not
  dismissing a notification. Persist in the seeded module (in-memory is fine).
- The home's KPI/watch rows reflect an acknowledged cluster without a reload.

## Acceptance (one line)
Home → alerts → cluster → Acknowledge → acknowledged state renders and the feed row updates; two
screenshots (`15-officer-alerts.png`, `15-officer-acknowledged.png`); `npm run check` green.
